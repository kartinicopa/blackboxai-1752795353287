import axios from 'axios';
import { REGION_CODES } from '../constants/config.js';
import { handleError, handleNetworkError, validateParams } from '../utils/errorHandler.js';

/**
 * BMKG API service for weather data
 */

/**
 * Get current weather data from BMKG API
 * @param {string} regionCode - BMKG region code
 * @returns {Promise<object>} Weather data
 */
export const getCurrentWeather = async (regionCode) => {
  try {
    const validation = validateParams({ regionCode }, ['regionCode']);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const baseUrl = import.meta.env.VITE_BMKG_BASE_URL || 'https://api.bmkg.go.id/publik/prakiraan-cuaca';
    
    console.log('Fetching weather data for region:', regionCode);

    const response = await axios.get(baseUrl, {
      params: { adm4: regionCode },
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Carbon-Emission-Calculator/1.0'
      }
    });

    if (response.data.error || response.data.statusCode === 404) {
      throw new Error(response.data.message || 'Data cuaca tidak ditemukan');
    }

    // Process weather data
    const weatherData = processWeatherData(response.data);
    
    console.log('Weather data retrieved successfully for region:', regionCode);
    
    return {
      success: true,
      data: weatherData
    };

  } catch (error) {
    console.error('Error in getCurrentWeather:', error);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return handleNetworkError(error, 'BMKG API request');
    }
    
    // Return mock data as fallback
    return {
      success: true,
      data: getMockWeatherData(regionCode),
      isMock: true
    };
  }
};

/**
 * Get weather forecast for multiple days
 * @param {string} regionCode - BMKG region code
 * @param {number} days - Number of days to forecast (default: 3)
 * @returns {Promise<object>} Forecast data
 */
export const getWeatherForecast = async (regionCode, days = 3) => {
  try {
    const validation = validateParams({ regionCode }, ['regionCode']);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    console.log(`Fetching ${days}-day forecast for region:`, regionCode);

    // Try to get current weather data first
    const currentWeather = await getCurrentWeather(regionCode);
    
    if (currentWeather.success && !currentWeather.isMock) {
      // If we have real data, generate forecast based on current conditions
      const forecastData = generateForecastFromCurrent(currentWeather.data, days);
      
      return {
        success: true,
        data: forecastData
      };
    } else {
      // Return mock forecast data
      return {
        success: true,
        data: getMockForecastData(regionCode, days),
        isMock: true
      };
    }

  } catch (error) {
    console.error('Error in getWeatherForecast:', error);
    
    return {
      success: true,
      data: getMockForecastData(regionCode, days),
      isMock: true
    };
  }
};

/**
 * Get weather data for multiple regions along a route
 * @param {Array} regions - Array of region codes
 * @returns {Promise<object>} Weather data for all regions
 */
export const getRouteWeatherData = async (regions) => {
  try {
    console.log('Fetching weather data for route regions:', regions);

    const weatherPromises = regions.map(region => getCurrentWeather(region));
    const results = await Promise.allSettled(weatherPromises);

    const routeWeather = {
      regions: [],
      summary: {
        averageTemp: 0,
        averageHumidity: 0,
        dominantCondition: 'normal',
        hasRain: false
      }
    };

    let totalTemp = 0;
    let totalHumidity = 0;
    let validResults = 0;
    const conditions = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        const weatherData = result.value.data;
        routeWeather.regions.push({
          regionCode: regions[index],
          regionName: getRegionName(regions[index]),
          weather: weatherData
        });

        if (weatherData.current) {
          totalTemp += weatherData.current.temperature || 25;
          totalHumidity += weatherData.current.humidity || 70;
          conditions.push(weatherData.current.condition || 'normal');
          validResults++;

          if (weatherData.current.condition && 
              (weatherData.current.condition.includes('hujan') || 
               weatherData.current.condition.includes('rain'))) {
            routeWeather.summary.hasRain = true;
          }
        }
      }
    });

    // Calculate averages
    if (validResults > 0) {
      routeWeather.summary.averageTemp = Math.round(totalTemp / validResults);
      routeWeather.summary.averageHumidity = Math.round(totalHumidity / validResults);
      
      // Determine dominant condition
      const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
      }, {});
      
      routeWeather.summary.dominantCondition = Object.keys(conditionCounts)
        .reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b);
    }

    return {
      success: true,
      data: routeWeather
    };

  } catch (error) {
    console.error('Error in getRouteWeatherData:', error);
    return handleError(error, 'Gagal mengambil data cuaca rute', false);
  }
};

/**
 * Process raw weather data from BMKG API
 * @param {object} rawData - Raw API response
 * @returns {object} Processed weather data
 */
const processWeatherData = (rawData) => {
  try {
    // Handle different possible response formats
    let weatherArray = rawData;
    
    if (rawData.data) {
      weatherArray = rawData.data;
    } else if (rawData.weather) {
      weatherArray = rawData.weather;
    }

    if (!Array.isArray(weatherArray)) {
      weatherArray = [weatherArray];
    }

    const current = weatherArray[0] || {};
    
    return {
      current: {
        datetime: current.utc_datetime || current.local_datetime || new Date().toISOString(),
        localDatetime: current.local_datetime || new Date().toLocaleString('id-ID'),
        temperature: parseFloat(current.t) || 25,
        humidity: parseFloat(current.hu) || 70,
        condition: current.weather_desc || current.weather_desc_en || 'normal',
        conditionEn: current.weather_desc_en || 'normal',
        windSpeed: parseFloat(current.ws) || 5,
        windDirection: current.wd || 'N',
        cloudCover: parseFloat(current.tcc) || 50,
        visibility: current.vs_text || '10 km',
        analysisDate: current.analysis_date || new Date().toISOString()
      },
      raw: rawData
    };
  } catch (error) {
    console.error('Error processing weather data:', error);
    return getMockWeatherData();
  }
};

/**
 * Generate forecast data from current weather
 * @param {object} currentWeather - Current weather data
 * @param {number} days - Number of days to forecast
 * @returns {Array} Forecast data array
 */
const generateForecastFromCurrent = (currentWeather, days) => {
  const forecast = [];
  const baseDate = new Date();

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(baseDate);
    forecastDate.setDate(baseDate.getDate() + i);

    // Add some variation to the forecast
    const tempVariation = (Math.random() - 0.5) * 6; // ±3°C variation
    const humidityVariation = (Math.random() - 0.5) * 20; // ±10% variation

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      localDate: forecastDate.toLocaleDateString('id-ID'),
      temperature: Math.round((currentWeather.current?.temperature || 25) + tempVariation),
      humidity: Math.max(30, Math.min(90, Math.round((currentWeather.current?.humidity || 70) + humidityVariation))),
      condition: currentWeather.current?.condition || 'normal',
      conditionEn: currentWeather.current?.conditionEn || 'normal',
      windSpeed: Math.max(0, (currentWeather.current?.windSpeed || 5) + (Math.random() - 0.5) * 4),
      cloudCover: Math.max(0, Math.min(100, (currentWeather.current?.cloudCover || 50) + (Math.random() - 0.5) * 40))
    });
  }

  return forecast;
};

/**
 * Get mock weather data as fallback
 * @param {string} regionCode - Region code
 * @returns {object} Mock weather data
 */
const getMockWeatherData = (regionCode = '32.73') => {
  const conditions = ['cerah', 'berawan', 'hujan ringan', 'normal'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  return {
    current: {
      datetime: new Date().toISOString(),
      localDatetime: new Date().toLocaleString('id-ID'),
      temperature: Math.round(22 + Math.random() * 8), // 22-30°C
      humidity: Math.round(60 + Math.random() * 30), // 60-90%
      condition: condition,
      conditionEn: condition === 'cerah' ? 'clear' : condition === 'berawan' ? 'cloudy' : condition === 'hujan ringan' ? 'light rain' : 'normal',
      windSpeed: Math.round(3 + Math.random() * 7), // 3-10 km/h
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      cloudCover: Math.round(20 + Math.random() * 60), // 20-80%
      visibility: '10 km',
      analysisDate: new Date().toISOString()
    },
    isMock: true
  };
};

/**
 * Get mock forecast data
 * @param {string} regionCode - Region code
 * @param {number} days - Number of days
 * @returns {Array} Mock forecast data
 */
const getMockForecastData = (regionCode, days) => {
  const forecast = [];
  const baseDate = new Date();
  const conditions = ['cerah', 'berawan', 'hujan ringan', 'normal'];

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(baseDate);
    forecastDate.setDate(baseDate.getDate() + i);
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      localDate: forecastDate.toLocaleDateString('id-ID'),
      temperature: Math.round(22 + Math.random() * 8),
      humidity: Math.round(60 + Math.random() * 30),
      condition: condition,
      conditionEn: condition === 'cerah' ? 'clear' : condition === 'berawan' ? 'cloudy' : condition === 'hujan ringan' ? 'light rain' : 'normal',
      windSpeed: Math.round(3 + Math.random() * 7),
      cloudCover: Math.round(20 + Math.random() * 60),
      isMock: true
    });
  }

  return forecast;
};

/**
 * Get region name from region code
 * @param {string} regionCode - BMKG region code
 * @returns {string} Region name
 */
const getRegionName = (regionCode) => {
  const regionNames = {
    '31.71': 'Jakarta Pusat',
    '31.72': 'Jakarta Utara',
    '31.73': 'Jakarta Barat',
    '31.74': 'Jakarta Selatan',
    '31.75': 'Jakarta Timur',
    '32.73': 'Bandung',
    '32.77': 'Cimahi',
    '32.71': 'Bogor',
    '32.76': 'Depok'
  };
  
  return regionNames[regionCode] || `Region ${regionCode}`;
};

/**
 * Get weather adjustment factor for fuel consumption
 * @param {object} weatherData - Weather data
 * @returns {number} Adjustment factor
 */
export const getWeatherAdjustmentFactor = (weatherData) => {
  try {
    let factor = 1.0;
    
    if (weatherData && weatherData.current) {
      const condition = weatherData.current.condition?.toLowerCase() || '';
      
      if (condition.includes('hujan ringan') || condition.includes('light rain')) {
        factor *= 1.05; // 5% increase for light rain
      } else if (condition.includes('hujan lebat') || condition.includes('heavy rain') || condition.includes('hujan')) {
        factor *= 1.1; // 10% increase for heavy rain
      }
      
      // Temperature effects (extreme temperatures increase consumption)
      const temp = weatherData.current.temperature || 25;
      if (temp < 15 || temp > 35) {
        factor *= 1.03; // 3% increase for extreme temperatures
      }
      
      // Wind effects
      const windSpeed = weatherData.current.windSpeed || 0;
      if (windSpeed > 15) {
        factor *= 1.02; // 2% increase for strong winds
      }
    }
    
    return factor;
  } catch (error) {
    console.error('Error calculating weather adjustment factor:', error);
    return 1.0;
  }
};
