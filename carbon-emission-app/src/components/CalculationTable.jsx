import React from 'react';
import { formatNumber } from '../utils/calculations.js';

/**
 * CalculationTable component for displaying emission calculation results
 * @param {object} props - Component props
 * @param {Array} props.data - Calculation results data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @returns {JSX.Element} CalculationTable component
 */
const CalculationTable = ({ data = [], loading = false, error = null }) => {
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

  const getEnergyTypeLabel = (energySource) => {
    const labels = {
      bahan_bakar: 'Bahan Bakar',
      biofuel: 'Biofuel',
      listrik_renewable: 'Listrik Renewable',
      listrik_grid: 'Listrik Grid'
    };
    return labels[energySource] || energySource;
  };

  const getModeIcon = (mode) => {
    const icons = {
      mobil: '🚗',
      bus: '🚌',
      motor: '🏍️',
      ka_argo: '🚄',
      kcic: '🚅'
    };
    return icons[mode] || '🚗';
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="subsection-title">Hasil Perhitungan</h2>
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Menghitung emisi karbon...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="subsection-title">Hasil Perhitungan</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Terjadi Kesalahan
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h2 className="subsection-title">Hasil Perhitungan</h2>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pilih rute dan moda transportasi untuk melihat hasil perhitungan
          </p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalEmission = data.reduce((sum, item) => sum + (item.emission || 0), 0);
  const avgEmission = totalEmission / data.length;
  const minEmission = Math.min(...data.map(item => item.emission || 0));
  const maxEmission = Math.max(...data.map(item => item.emission || 0));
  const minEmissionMode = data.find(item => item.emission === minEmission);
  const maxEmissionMode = data.find(item => item.emission === maxEmission);

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="subsection-title">Hasil Perhitungan Emisi Karbon</h2>
        <p className="text-gray-600 text-sm">
          Perbandingan konsumsi bahan bakar dan emisi CO₂ untuk berbagai moda transportasi
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800">Total Emisi</div>
          <div className="text-2xl font-bold text-blue-900">{formatNumber(totalEmission)} kg</div>
          <div className="text-xs text-blue-600">CO₂ semua moda</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800">Rata-rata</div>
          <div className="text-2xl font-bold text-green-900">{formatNumber(avgEmission)} kg</div>
          <div className="text-xs text-green-600">CO₂ per moda</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-800">Terendah</div>
          <div className="text-2xl font-bold text-yellow-900">{formatNumber(minEmission)} kg</div>
          <div className="text-xs text-yellow-600">{getModeLabel(minEmissionMode?.mode)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm font-medium text-red-800">Tertinggi</div>
          <div className="text-2xl font-bold text-red-900">{formatNumber(maxEmission)} kg</div>
          <div className="text-xs text-red-600">{getModeLabel(maxEmissionMode?.mode)}</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="table-responsive">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Moda Transportasi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Jarak (km)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Konsumsi (L/kWh)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Sumber Energi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Emisi CO₂ (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Efisiensi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const efficiency = item.distance > 0 ? item.emission / item.distance : 0;
              const isLowest = item.emission === minEmission;
              const isHighest = item.emission === maxEmission;
              
              return (
                <tr 
                  key={index} 
                  className={`table-row ${isLowest ? 'bg-green-50' : isHighest ? 'bg-red-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {getModeIcon(item.mode)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getModeLabel(item.mode)}
                        </div>
                        {isLowest && (
                          <div className="text-xs text-green-600 font-medium">
                            Paling Efisien
                          </div>
                        )}
                        {isHighest && (
                          <div className="text-xs text-red-600 font-medium">
                            Emisi Tertinggi
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.distance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.fuelConsumption, 3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.energySource === 'listrik_renewable' 
                        ? 'bg-green-100 text-green-800'
                        : item.energySource === 'biofuel'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getEnergyTypeLabel(item.energySource)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatNumber(item.emission, 3)}
                    </div>
                    <div className="text-xs text-gray-500">
                      kg CO₂
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatNumber(efficiency, 3)}
                    </div>
                    <div className="text-xs text-gray-500">
                      kg CO₂/km
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Additional Information */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Catatan Perhitungan</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Perhitungan berdasarkan konsumsi bahan bakar standar dan faktor emisi IPCC</p>
          <p>• Jarak untuk kendaraan jalan menggunakan Google Directions API</p>
          <p>• Jarak untuk kereta api menggunakan data statis yang telah ditentukan</p>
          <p>• Penyesuaian dilakukan berdasarkan kondisi lalu lintas, cuaca, dan skenario yang dipilih</p>
        </div>
      </div>
    </div>
  );
};

export default CalculationTable;
