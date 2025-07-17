import React, { useState } from 'react';

/**
 * RouteSelector component for choosing travel route
 * @param {object} props - Component props
 * @param {function} props.onRouteChange - Callback when route changes
 * @param {string} props.selectedRoute - Currently selected route
 * @returns {JSX.Element} RouteSelector component
 */
const RouteSelector = ({ onRouteChange, selectedRoute = '' }) => {
  const [route, setRoute] = useState(selectedRoute);

  const handleRouteChange = (e) => {
    const newRoute = e.target.value;
    setRoute(newRoute);
    if (onRouteChange) {
      onRouteChange(newRoute);
    }
  };

  const routes = [
    { value: '', label: '-- Pilih Rute --' },
    { value: 'bandung-jakarta', label: 'Bandung → Jakarta' },
    { value: 'jakarta-bandung', label: 'Jakarta → Bandung' }
  ];

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="subsection-title">Pilih Rute Perjalanan</h2>
        <p className="text-gray-600 text-sm mb-4">
          Pilih arah perjalanan untuk menghitung emisi karbon transportasi
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="route-select" className="block text-sm font-medium text-gray-700 mb-2">
            Rute Perjalanan
          </label>
          <select
            id="route-select"
            value={route}
            onChange={handleRouteChange}
            className="select-field"
            aria-describedby="route-help"
          >
            {routes.map((routeOption) => (
              <option key={routeOption.value} value={routeOption.value}>
                {routeOption.label}
              </option>
            ))}
          </select>
          <p id="route-help" className="text-xs text-gray-500 mt-1">
            Pilih rute untuk memulai perhitungan emisi karbon
          </p>
        </div>

        {route && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Rute Dipilih: {routes.find(r => r.value === route)?.label}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Sistem akan menghitung jarak dan estimasi emisi untuk berbagai moda transportasi 
                    pada rute ini.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Route Information */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Bandung → Jakarta</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Jarak estimasi: ~150 km</li>
            <li>• Waktu tempuh: 2-4 jam</li>
            <li>• Melalui Tol Cipularang</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Jakarta → Bandung</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Jarak estimasi: ~150 km</li>
            <li>• Waktu tempuh: 2-4 jam</li>
            <li>• Melalui Tol Cipularang</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RouteSelector;
