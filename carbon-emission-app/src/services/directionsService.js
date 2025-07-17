import axios from 'axios';
import { handleError, handleNetworkError, validateParams } from '../utils/errorHandler.js';

/**
 * Google Directions API service
 */

/**
 * Get route data from Google Directions API
 * @param {object} params - Route parameters
 * @param {string} params.origin - Origin location
 * @param {string} params.destination - Destination location
 * @param {boolean} params.avoidTolls - Whether to avoid toll roads
 * @returns {Promise<object>} Route data including distance and duration
 */
export const getRouteData = async ({ origin, destination, avoidTolls = false }) => {
  try {
    // Validate required parameters
    const validation = validateParams({ origin, destination }, ['origin', 'destination']);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key tidak ditemukan');
    }

    const params = {
      origin,
      destination,
      key: apiKey,
      units: 'metric',
      mode: 'driving',
      ...(avoidTolls && { avoid: 'tolls' })
    };

    console.log('Fetching route data:', { origin, destination, avoidTolls });

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params,
      timeout: 10000
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Google Directions API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
    }

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('Tidak ada rute yang ditemukan');
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    const routeData = {
      distance: {
        value: leg.distance.value, // in meters
        text: leg.distance.text,
        km: Math.round(leg.distance.value / 1000 * 100) / 100 // convert to km with 2 decimals
      },
      duration: {
        value: leg.duration.value, // in seconds
        text: leg.duration.text,
        hours: Math.round(leg.duration.value / 3600 * 100) / 100 // convert to hours
      },
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps?.map(step => ({
        distance: step.distance,
        duration: step.duration,
        instructions: step.html_instructions?.replace(/<[^>]*>/g, ''), // remove HTML tags
        location: {
          lat: step.end_location.lat,
          lng: step.end_location.lng
        }
      })) || [],
      polyline: route.overview_polyline?.points || '',
      bounds: route.bounds,
      warnings: route.warnings || [],
      copyrights: route.copyrights
    };

    console.log('Route data retrieved successfully:', {
      distance: routeData.distance.km + ' km',
      duration: routeData.duration.text
    });

    return {
      success: true,
      data: routeData
    };

  } catch (error) {
    console.error('Error in getRouteData:', error);
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return handleNetworkError(error, 'Google Directions API request');
    }
    
    return handleError(error, 'Gagal mengambil data rute. Periksa koneksi internet dan coba lagi.', false);
  }
};

/**
 * Get multiple route options (with and without tolls)
 * @param {object} params - Route parameters
 * @returns {Promise<object>} Multiple route options
 */
export const getRouteOptions = async ({ origin, destination }) => {
  try {
    console.log('Fetching route options for:', { origin, destination });

    const [tollRoute, noTollRoute] = await Promise.allSettled([
      getRouteData({ origin, destination, avoidTolls: false }),
      getRouteData({ origin, destination, avoidTolls: true })
    ]);

    const result = {
      success: true,
      data: {
        withTolls: null,
        withoutTolls: null
      }
    };

    if (tollRoute.status === 'fulfilled' && tollRoute.value.success) {
      result.data.withTolls = tollRoute.value.data;
    }

    if (noTollRoute.status === 'fulfilled' && noTollRoute.value.success) {
      result.data.withoutTolls = noTollRoute.value.data;
    }

    // If both failed, return error
    if (!result.data.withTolls && !result.data.withoutTolls) {
      throw new Error('Gagal mengambil data rute untuk semua opsi');
    }

    console.log('Route options retrieved:', {
      withTolls: result.data.withTolls ? `${result.data.withTolls.distance.km} km` : 'Failed',
      withoutTolls: result.data.withoutTolls ? `${result.data.withoutTolls.distance.km} km` : 'Failed'
    });

    return result;

  } catch (error) {
    console.error('Error in getRouteOptions:', error);
    return handleError(error, 'Gagal mengambil opsi rute', false);
  }
};

/**
 * Decode Google polyline string to coordinates
 * @param {string} polyline - Encoded polyline string
 * @returns {Array} Array of {lat, lng} coordinates
 */
export const decodePolyline = (polyline) => {
  try {
    if (!polyline) return [];

    const points = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < polyline.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }

    return points;
  } catch (error) {
    console.error('Error decoding polyline:', error);
    return [];
  }
};

/**
 * Calculate estimated fuel consumption based on route characteristics
 * @param {object} routeData - Route data from Google Directions
 * @param {string} mode - Transportation mode
 * @returns {object} Estimated consumption adjustments
 */
export const estimateRouteAdjustments = (routeData, mode) => {
  try {
    let adjustments = {
      traffic: 1.0,
      terrain: 1.0,
      urban: 1.0
    };

    // Analyze route warnings for traffic conditions
    if (routeData.warnings) {
      const hasTrafficWarning = routeData.warnings.some(warning => 
        warning.toLowerCase().includes('traffic') || 
        warning.toLowerCase().includes('congestion')
      );
      if (hasTrafficWarning) {
        adjustments.traffic = 1.1; // 10% increase for traffic
      }
    }

    // Estimate urban vs highway based on duration vs distance ratio
    const avgSpeed = routeData.distance.km / routeData.duration.hours;
    if (avgSpeed < 30) {
      adjustments.urban = 1.15; // Urban driving increases consumption
    } else if (avgSpeed > 80) {
      adjustments.urban = 0.95; // Highway driving can be more efficient
    }

    return adjustments;
  } catch (error) {
    console.error('Error estimating route adjustments:', error);
    return { traffic: 1.0, terrain: 1.0, urban: 1.0 };
  }
};
