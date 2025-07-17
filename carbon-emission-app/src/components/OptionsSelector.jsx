import React, { useState } from 'react';

/**
 * OptionsSelector component for what-if scenario parameters
 * @param {object} props - Component props
 * @param {function} props.onOptionsChange - Callback when options change
 * @param {object} props.selectedOptions - Currently selected options
 * @returns {JSX.Element} OptionsSelector component
 */
const OptionsSelector = ({ onOptionsChange, selectedOptions = {} }) => {
  const [options, setOptions] = useState({
    traffic: 'normal',
    cuaca: 'normal',
    loadFactor: 'standard',
    energy: 'standard',
    tollOption: 'with_tolls',
    ...selectedOptions
  });

  const handleOptionChange = (key, value) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    if (onOptionsChange) {
      onOptionsChange(newOptions);
    }
  };

  const getAdjustmentText = (key, value) => {
    const adjustments = {
      traffic: {
        normal: 'Tidak ada penyesuaian',
        padat: '+10% konsumsi bahan bakar',
        sangat_padat: '+20% konsumsi bahan bakar'
      },
      cuaca: {
        normal: 'Tidak ada penyesuaian',
        hujan_ringan: '+5% konsumsi bahan bakar',
        hujan_lebat: '+10% konsumsi bahan bakar'
      },
      loadFactor: {
        standard: 'Kapasitas normal',
        peak: '+15% konsumsi (peak season)'
      },
      energy: {
        standard: '2.6 kg CO₂/liter',
        biofuel: '0.5 kg CO₂/liter (LCA)',
        listrik_renewable: '0 kg CO₂/kWh'
      }
    };
    return adjustments[key]?.[value] || '';
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="subsection-title">Skenario What-If</h2>
        <p className="text-gray-600 text-sm">
          Sesuaikan parameter untuk simulasi berbagai kondisi perjalanan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Conditions */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Kondisi Lalu Lintas
          </label>
          <div className="space-y-2">
            {[
              { value: 'normal', label: 'Normal', desc: 'Lalu lintas lancar' },
              { value: 'padat', label: 'Padat', desc: 'Kemacetan ringan (+10%)' },
              { value: 'sangat_padat', label: 'Sangat Padat', desc: 'Kemacetan berat (+20%)' }
            ].map((traffic) => (
              <label
                key={traffic.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  options.traffic === traffic.value
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="traffic"
                  value={traffic.value}
                  checked={options.traffic === traffic.value}
                  onChange={(e) => handleOptionChange('traffic', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{traffic.label}</div>
                  <div className="text-sm text-gray-600">{traffic.desc}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  options.traffic === traffic.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {options.traffic === traffic.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {getAdjustmentText('traffic', options.traffic)}
          </p>
        </div>

        {/* Weather Conditions */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Kondisi Cuaca
          </label>
          <div className="space-y-2">
            {[
              { value: 'normal', label: 'Normal', desc: 'Cuaca cerah/berawan' },
              { value: 'hujan_ringan', label: 'Hujan Ringan', desc: 'Gerimis/hujan ringan (+5%)' },
              { value: 'hujan_lebat', label: 'Hujan Lebat', desc: 'Hujan deras (+10%)' }
            ].map((cuaca) => (
              <label
                key={cuaca.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  options.cuaca === cuaca.value
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="cuaca"
                  value={cuaca.value}
                  checked={options.cuaca === cuaca.value}
                  onChange={(e) => handleOptionChange('cuaca', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{cuaca.label}</div>
                  <div className="text-sm text-gray-600">{cuaca.desc}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  options.cuaca === cuaca.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {options.cuaca === cuaca.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {getAdjustmentText('cuaca', options.cuaca)}
          </p>
        </div>

        {/* Load Factor */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Load Factor
          </label>
          <div className="space-y-2">
            {[
              { value: 'standard', label: 'Standard', desc: 'Kapasitas normal' },
              { value: 'peak', label: 'Peak Season', desc: 'Musim ramai (+15%)' }
            ].map((load) => (
              <label
                key={load.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  options.loadFactor === load.value
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="loadFactor"
                  value={load.value}
                  checked={options.loadFactor === load.value}
                  onChange={(e) => handleOptionChange('loadFactor', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{load.label}</div>
                  <div className="text-sm text-gray-600">{load.desc}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  options.loadFactor === load.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {options.loadFactor === load.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {getAdjustmentText('loadFactor', options.loadFactor)}
          </p>
        </div>

        {/* Energy Source */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Sumber Energi
          </label>
          <div className="space-y-2">
            {[
              { value: 'standard', label: 'Konvensional', desc: 'Bahan bakar fosil' },
              { value: 'biofuel', label: 'Biofuel', desc: 'Bahan bakar bio (50% lebih rendah)' },
              { value: 'listrik_renewable', label: 'Listrik Renewable', desc: 'Energi terbarukan (0 emisi)' }
            ].map((energy) => (
              <label
                key={energy.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  options.energy === energy.value
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="energy"
                  value={energy.value}
                  checked={options.energy === energy.value}
                  onChange={(e) => handleOptionChange('energy', e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{energy.label}</div>
                  <div className="text-sm text-gray-600">{energy.desc}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  options.energy === energy.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {options.energy === energy.value && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {getAdjustmentText('energy', options.energy)}
          </p>
        </div>
      </div>

      {/* Toll Option for Road Vehicles */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Opsi Jalan Tol (Kendaraan Jalan)
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="tollOption"
                value="with_tolls"
                checked={options.tollOption === 'with_tolls'}
                onChange={(e) => handleOptionChange('tollOption', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Melalui Tol</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="tollOption"
                value="avoid_tolls"
                checked={options.tollOption === 'avoid_tolls'}
                onChange={(e) => handleOptionChange('tollOption', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Hindari Tol</span>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Opsi ini hanya berlaku untuk kendaraan jalan (mobil, bus, motor)
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Ringkasan Skenario</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• Lalu lintas: <strong>{options.traffic}</strong> {getAdjustmentText('traffic', options.traffic) && `(${getAdjustmentText('traffic', options.traffic)})`}</p>
          <p>• Cuaca: <strong>{options.cuaca}</strong> {getAdjustmentText('cuaca', options.cuaca) && `(${getAdjustmentText('cuaca', options.cuaca)})`}</p>
          <p>• Load Factor: <strong>{options.loadFactor}</strong> {getAdjustmentText('loadFactor', options.loadFactor) && `(${getAdjustmentText('loadFactor', options.loadFactor)})`}</p>
          <p>• Energi: <strong>{options.energy}</strong> {getAdjustmentText('energy', options.energy) && `(${getAdjustmentText('energy', options.energy)})`}</p>
          <p>• Tol: <strong>{options.tollOption === 'with_tolls' ? 'Melalui tol' : 'Hindari tol'}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default OptionsSelector;
