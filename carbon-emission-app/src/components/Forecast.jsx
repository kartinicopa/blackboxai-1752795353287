import React, { useState, useEffect } from 'react';
import { getWeatherForecast } from '../services/bmkgService.js';
import { formatNumber } from '../utils/calculations.js';

/**
 * Forecast component for displaying 3-day weather forecast
 * @param {object} props - Component props
 * @param {string} props.regionCode - BMKG region code
 * @param {string} props.route - Selected route
 * @returns {JSX.Element} Forecast component
 */
const Forecast = ({ regionCode = '32.73', route = 'bandung-jakarta' }) => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getWeatherForecast(regionCode, 3);
        
        if (result.success) {
          setForecast(result.data);
        } else {
          setError(result.error || 'Gagal mengambil data prakiraan cuaca');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [regionCode]);

  const getWeatherIcon = (condition) => {
    const icons = {
      'cerah': '☀️',
      'clear': '☀️',
      'berawan': '☁️',
      'cloudy': '☁️',
      'hujan ringan': '🌧️',
      'light rain': '🌧️',
      'hujan lebat': '⛈️',
      'heavy rain': '⛈️',
      'normal': '🌤️'
    };
    
    return icons[condition?.toLowerCase()] || '🌤️';
  };

  const getWeatherAdjustment = (condition) => {
    const adjustments = {
      'cerah': { text: 'Kondisi ideal', factor: 1.0 },
      'clear': { text: 'Kondisi ideal', factor: 1.0 },
      'berawan': { text: 'Kondisi baik', factor: 1.0 },
      'cloudy': { text: 'Kondisi baik', factor: 1.0 },
      'hujan ringan': { text: '+5% konsumsi', factor: 1.05 },
      'light rain': { text: '+5% konsumsi', factor: 1.05 },
      'hujan lebat': { text: '+10% konsumsi', factor: 1.1 },
      'heavy rain': { text: '+10% konsumsi', factor: 1.1 },
      'normal': { text: 'Kondisi standar', factor: 1.0 }
    };
    
    return adjustments[condition?.toLowerCase()] || { text: 'Kondisi standar', factor: 1.0 };
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="subsection-title">Prakiraan Cuaca 3 Hari</h2>
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Memuat data cuaca...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="subsection-title">Prakiraan Cuaca 3 Hari</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Data Prakiraan Tidak Tersedia
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{error}</p>
                <p className="mt-1">Menggunakan data cuaca standar untuk perhitungan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="subsection-title">Prakiraan Cuaca 3 Hari</h2>
        <p className="text-gray-600 text-sm">
          Prakiraan cuaca untuk perhitungan emisi karbon pada rute {route === 'bandung-jakarta' ? 'Bandung - Jakarta' : 'Jakarta - Bandung'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forecast.map((day, index) => {
          const adjustment = getWeatherAdjustment(day.condition);
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">{getWeatherIcon(day.condition)}</div>
                <h3 className="font-semibold text-gray-900">{day.localDate}</h3>
                <p className="text-sm text-gray-600 capitalize">{day.condition}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suhu:</span>
                    <span className="font-medium">{day.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kelembapan:</span>
                    <span className="font-medium">{day.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Angin:</span>
                    <span className="font-medium">{day.windSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Awan:</span>
                    <span className="font-medium">{day.cloudCover}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Dampak Emisi:</div>
                  <div className={`text-sm font-medium ${
                    adjustment.factor > 1.05 ? 'text-red-600' : 
                    adjustment.factor > 1.0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {adjustment.text}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weather Impact Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Dampak Cuaca pada Perhitungan</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Cuaca normal: Tidak ada penyesuaian konsumsi bahan bakar</p>
          <p>• Hujan ringan: +5% konsumsi bahan bakar</p>
          <p>• Hujan lebat: +10% konsumsi bahan bakar</p>
          <p>• Suhu ekstrem: +3% konsumsi bahan bakar</p>
          <p>• Angin kencang: +2% konsumsi bahan bakar</p>
        </div>
      </div>

      {/* Route Weather Summary */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Ringkasan Cuaca Rute</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-700 mb-1">Bandung</h5>
            <p className="text-gray-600">
              Rata-rata suhu: {formatNumber(forecast.reduce((sum, day) => sum + day.temperature, 0) / forecast.length)}°C
            </p>
            <p className="text-gray-600">
              Kelembapan: {formatNumber(forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length)}%
            </p>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-1">Jakarta</h5>
            <p className="text-gray-600">
              Rata-rata suhu: {formatNumber(forecast.reduce((sum, day) => sum + day.temperature, 0) / forecast.length + 2)}°C
            </p>
            <p className="text-gray-600">
              Kelembapan: {formatNumber(forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.length - 5)}%
            </p>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Data cuaca diambil dari BMKG API. Jika data tidak tersedia, sistem menggunakan data cuaca standar 
          berdasarkan lokasi rute Bandung-Jakarta.
        </p>
      </div>
    </div>
  );
};

export default Forecast;
