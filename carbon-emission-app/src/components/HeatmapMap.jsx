import React, { useState, useEffect } from 'react';
import { routeCoordinates } from '../constants/config.js';

/**
 * HeatmapMap component for visualizing emission distribution along routes
 * @param {object} props - Component props
 * @param {Array} props.data - Calculation results data
 * @param {string} props.route - Selected route
 * @returns {JSX.Element} HeatmapMap component
 */
const HeatmapMap = ({ data = [], route = 'bandung-jakarta' }) => {
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Mock route data for visualization
  const routeData = {
    'bandung-jakarta': {
      name: 'Bandung - Jakarta',
      origin: { lat: -6.9175, lng: 107.6191, name: 'Bandung' },
      destination: { lat: -6.2088, lng: 106.8456, name: 'Jakarta' },
      waypoints: [
        { lat: -6.8947, lng: 107.5369, name: 'Cimahi' },
        { lat: -6.5950, lng: 107.4572, name: 'Purwakarta' },
        { lat: -6.3227, lng: 107.3069, name: 'Karawang' },
        { lat: -6.2383, lng: 106.9756, name: 'Bekasi' }
      ]
    },
    'jakarta-bandung': {
      name: 'Jakarta - Bandung',
      origin: { lat: -6.2088, lng: 106.8456, name: 'Jakarta' },
      destination: { lat: -6.9175, lng: 107.6191, name: 'Bandung' },
      waypoints: [
        { lat: -6.2383, lng: 106.9756, name: 'Bekasi' },
        { lat: -6.3227, lng: 107.3069, name: 'Karawang' },
        { lat: -6.5950, lng: 107.4572, name: 'Purwakarta' },
        { lat: -6.8947, lng: 107.5369, name: 'Cimahi' }
      ]
    }
  };

  // Generate mock emission data for visualization
  const generateEmissionData = () => {
    if (!data || data.length === 0) return [];

    const currentRoute = routeData[route];
    const allPoints = [currentRoute.origin, ...currentRoute.waypoints, currentRoute.destination];
    
    return data.map(transportMode => {
      const totalEmission = transportMode.emission || 0;
      const points = allPoints.map((point, index) => {
        const progress = index / (allPoints.length - 1);
        const emissionAtPoint = totalEmission * (0.5 + progress * 0.5); // Emission increases along route
        
        return {
          ...point,
          emission: emissionAtPoint,
          intensity: Math.min(emissionAtPoint / 10, 1), // Normalize to 0-1
          transportMode: transportMode.mode
        };
      });
      
      return {
        mode: transportMode.mode,
        label: getModeLabel(transportMode.mode),
        points,
        totalEmission
      };
    });
  };

  const getModeLabel = (mode) => {
    const labels = {
      mobil: 'Mobil',
      bus: 'Bus/Minibus',
      motor: 'Motor',
      ka_argo: 'KA Argo Parahyangan',
      kcic: 'KCIC Whoosh'
    };
    return labels[mode] || mode;
  };

  const getIntensityColor = (intensity) => {
    // Color scale from green to red based on emission intensity
    const colors = [
      'rgba(34, 197, 94, 0.8)',   // Low emission - green
      'rgba(250, 204, 21, 0.8)',  // Medium emission - yellow
      'rgba(239, 68, 68, 0.8)'    // High emission - red
    ];
    
    const index = Math.floor(intensity * (colors.length - 1));
    return colors[index];
  };

  const emissionData = generateEmissionData();

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="subsection-title">Distribusi Emisi di Sepanjang Rute</h2>
        <p className="text-gray-600 text-sm">
          Visualisasi distribusi emisi karbon untuk berbagai moda transportasi sepanjang rute
        </p>
      </div>

      {/* Route Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{routeData[route]?.name || 'Rute'}</h3>
            <p className="text-sm text-gray-600">
              {routeData[route]?.origin.name} → {routeData[route]?.destination.name}
            </p>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="btn-secondary text-sm"
          >
            {showMap ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
          </button>
        </div>
      </div>

      {/* Map Visualization */}
      {showMap && (
        <div className="space-y-6">
          {/* Route Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Rute Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700">Titik Awal</h5>
                <p className="text-sm text-gray-600">{routeData[route]?.origin.name}</p>
                <p className="text-xs text-gray-500">
                  Lat: {routeData[route]?.origin.lat.toFixed(4)}, Lng: {routeData[route]?.origin.lng.toFixed(4)}
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Titik Akhir</h5>
                <p className="text-sm text-gray-600">{routeData[route]?.destination.name}</p>
                <p className="text-xs text-gray-500">
                  Lat: {routeData[route]?.destination.lat.toFixed(4)}, Lng: {routeData[route]?.destination.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Emission Distribution */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Distribusi Emisi per Titik</h4>
            {emissionData.map((transportData) => (
              <div key={transportData.mode} className="mb-6">
                <h5 className="font-medium text-gray-800 mb-2">
                  {transportData.label} - Total: {transportData.totalEmission.toFixed(2)} kg CO₂
                </h5>
                
                <div className="space-y-2">
                  {transportData.points.map((point, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getIntensityColor(point.intensity) }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{point.name}</div>
                        <div className="text-xs text-gray-600">
                          Emisi: {point.emission.toFixed(2)} kg CO₂
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {((index / (transportData.points.length - 1)) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Legenda Intensitas Emisi</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Rendah</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-700">Sedang</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-700">Tinggi</span>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Detail Rute</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Total jarak: ~150 km</p>
              <p>• Waktu tempuh: 2-4 jam (tergantung moda transportasi)</p>
              <p>• Jalur utama: Tol Cipularang</p>
              <p>• Titik penting: Cimahi, Purwakarta, Karawang, Bekasi</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Catatan</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• Visualisasi ini menunjukkan distribusi emisi secara teoritis sepanjang rute</p>
          <p>• Warna menunjukkan intensitas emisi (hijau = rendah, merah = tinggi)</p>
          <p>• Untuk visualisasi interaktif, integrasi dengan Google Maps API diperlukan</p>
          <p>• Data berdasarkan perhitungan emisi untuk setiap moda transportasi</p>
        </div>
      </div>
    </div>
  );
};

export default HeatmapMap;
