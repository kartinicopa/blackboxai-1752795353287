import React, { useState } from 'react';
import { transportModes } from '../constants/config.js';

/**
 * TransportModeSelector component for choosing transportation modes
 * @param {object} props - Component props
 * @param {function} props.onModeChange - Callback when mode changes
 * @param {string} props.selectedMode - Currently selected mode
 * @param {boolean} props.allowMultiple - Allow multiple mode selection
 * @returns {JSX.Element} TransportModeSelector component
 */
const TransportModeSelector = ({ 
  onModeChange, 
  selectedMode = '', 
  allowMultiple = false 
}) => {
  const [mode, setMode] = useState(selectedMode);
  const [selectedModes, setSelectedModes] = useState([]);

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleMultipleModeChange = (modeId, checked) => {
    let newSelectedModes;
    if (checked) {
      newSelectedModes = [...selectedModes, modeId];
    } else {
      newSelectedModes = selectedModes.filter(id => id !== modeId);
    }
    setSelectedModes(newSelectedModes);
    if (onModeChange) {
      onModeChange(newSelectedModes);
    }
  };

  const getModeIcon = (modeId) => {
    const icons = {
      mobil: '🚗',
      bus: '🚌',
      motor: '🏍️',
      ka_argo: '🚄',
      kcic: '🚅'
    };
    return icons[modeId] || '🚗';
  };

  const getModeDescription = (modeId) => {
    const descriptions = {
      mobil: 'Kendaraan pribadi dengan konsumsi bahan bakar ~0.069 L/km',
      bus: 'Bus/Minibus dengan konsumsi bahan bakar ~0.091 L/km',
      motor: 'Sepeda motor dengan konsumsi bahan bakar ~0.02 L/km',
      ka_argo: 'Kereta Api Argo Parahyangan dengan jarak statis 150 km',
      kcic: 'KCIC Whoosh dengan jarak statis 142 km (listrik)'
    };
    return descriptions[modeId] || '';
  };

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="subsection-title">Pilih Moda Transportasi</h2>
        <p className="text-gray-600 text-sm mb-4">
          {allowMultiple 
            ? 'Pilih satu atau lebih moda transportasi untuk dibandingkan'
            : 'Pilih satu moda transportasi untuk dihitung emisinya'
          }
        </p>
      </div>

      <div className="space-y-4">
        {!allowMultiple ? (
          // Single selection mode
          <div className="grid grid-cols-1 gap-3">
            {transportModes.map((transportMode) => (
              <label
                key={transportMode.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  mode === transportMode.id
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="transportMode"
                  value={transportMode.id}
                  checked={mode === transportMode.id}
                  onChange={handleModeChange}
                  className="sr-only"
                />
                <div className="flex items-center space-x-4 w-full">
                  <div className="text-2xl">
                    {getModeIcon(transportMode.id)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {transportMode.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getModeDescription(transportMode.id)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Tipe: {transportMode.type === 'road' ? 'Jalan Raya' : 'Kereta Api'}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    mode === transportMode.id
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {mode === transportMode.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          // Multiple selection mode
          <div className="grid grid-cols-1 gap-3">
            {transportModes.map((transportMode) => (
              <label
                key={transportMode.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedModes.includes(transportMode.id)
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedModes.includes(transportMode.id)}
                  onChange={(e) => handleMultipleModeChange(transportMode.id, e.target.checked)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-4 w-full">
                  <div className="text-2xl">
                    {getModeIcon(transportMode.id)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {transportMode.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getModeDescription(transportMode.id)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Tipe: {transportMode.type === 'road' ? 'Jalan Raya' : 'Kereta Api'}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded border ${
                    selectedModes.includes(transportMode.id)
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {selectedModes.includes(transportMode.id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Selected mode info */}
        {mode && !allowMultiple && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Moda Dipilih: {transportModes.find(m => m.id === mode)?.label}
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{getModeDescription(mode)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Multiple modes info */}
        {selectedModes.length > 0 && allowMultiple && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {selectedModes.length} Moda Dipilih untuk Perbandingan
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <ul className="list-disc list-inside space-y-1">
                    {selectedModes.map(modeId => (
                      <li key={modeId}>
                        {transportModes.find(m => m.id === modeId)?.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Informasi Perhitungan</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Kendaraan Jalan:</strong> Jarak dihitung menggunakan Google Directions API</p>
          <p>• <strong>Kereta Api:</strong> Menggunakan jarak statis yang telah ditentukan</p>
          <p>• <strong>Faktor Emisi:</strong> Berdasarkan standar IPCC untuk berbagai jenis bahan bakar</p>
          <p>• <strong>Penyesuaian:</strong> Perhitungan dapat disesuaikan berdasarkan kondisi cuaca dan lalu lintas</p>
        </div>
      </div>
    </div>
  );
};

export default TransportModeSelector;
