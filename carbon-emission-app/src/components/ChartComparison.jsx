import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatNumber } from '../utils/calculations.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * ChartComparison component for visualizing emission data
 * @param {object} props - Component props
 * @param {Array} props.data - Calculation results data
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} ChartComparison component
 */
const ChartComparison = ({ data = [], loading = false }) => {
  const getModeLabel = (mode) => {
    const labels = {
      mobil: 'Mobil',
      bus: 'Bus/Minibus',
      motor: 'Motor',
      ka_argo: 'KA Argo',
      kcic: 'KCIC'
    };
    return labels[mode] || mode;
  };

  const getModeColor = (mode) => {
    const colors = {
      mobil: 'rgba(59, 130, 246, 0.8)',
      bus: 'rgba(16, 185, 129, 0.8)',
      motor: 'rgba(245, 158, 11, 0.8)',
      ka_argo: 'rgba(239, 68, 68, 0.8)',
      kcic: 'rgba(139, 92, 246, 0.8)'
    };
    return colors[mode] || 'rgba(107, 114, 128, 0.8)';
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="subsection-title">Grafik Perbandingan</h2>
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Memuat grafik...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h2 className="subsection-title">Grafik Perbandingan</h2>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pilih rute dan moda transportasi untuk melihat grafik perbandingan
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data.map(item => getModeLabel(item.mode)),
    datasets: [
      {
        label: 'Emisi CO₂ (kg)',
        data: data.map(item => item.emission),
        backgroundColor: data.map(item => getModeColor(item.mode)),
        borderColor: data.map(item => getModeColor(item.mode).replace('0.8', '1')),
        borderWidth: 1,
      },
      {
        label: 'Konsumsi Bahan Bakar (L/kWh)',
        data: data.map(item => item.fuelConsumption),
        backgroundColor: data.map(item => getModeColor(item.mode).replace('0.8', '0.6')),
        borderColor: data.map(item => getModeColor(item.mode).replace('0.8', '0.8')),
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Perbandingan Emisi Karbon dan Konsumsi Bahan Bakar',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Emisi')) {
              return `${label}: ${formatNumber(value, 3)} kg CO₂`;
            } else {
              return `${label}: ${formatNumber(value, 3)} L/kWh`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nilai'
        },
        ticks: {
          callback: function(value) {
            return formatNumber(value, 2);
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Moda Transportasi'
        }
      }
    }
  };

  // Efficiency comparison chart
  const efficiencyData = {
    labels: data.map(item => getModeLabel(item.mode)),
    datasets: [
      {
        label: 'Emisi per km (kg CO₂/km)',
        data: data.map(item => item.distance > 0 ? item.emission / item.distance : 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ]
  };

  const efficiencyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Efisiensi Emisi per Kilometer',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Emisi per km: ${formatNumber(context.parsed.y, 3)} kg CO₂/km`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kg CO₂ per km'
        },
        ticks: {
          callback: function(value) {
            return formatNumber(value, 3);
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Moda Transportasi'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Comparison Chart */}
      <div className="card">
        <h2 className="subsection-title">Grafik Perbandingan Emisi dan Konsumsi</h2>
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Efficiency Chart */}
      <div className="card">
        <h2 className="subsection-title">Efisiensi Emisi per Kilometer</h2>
        <div className="chart-container">
          <Bar data={efficiencyData} options={efficiencyOptions} />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Moda Terbaik</h3>
          <div className="text-2xl font-bold text-green-600">
            {data.length > 0 ? getModeLabel(data.reduce((min, item) => 
              item.emission < min.emission ? item : min
            ).mode) : '-'}
          </div>
          <p className="text-sm text-gray-600">Emisi terendah</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rata-rata Emisi</h3>
          <div className="text-2xl font-bold text-blue-600">
            {data.length > 0 ? formatNumber(
              data.reduce((sum, item) => sum + item.emission, 0) / data.length
            ) : '-'} kg
          </div>
          <p className="text-sm text-gray-600">CO₂ per moda</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Emisi</h3>
          <div className="text-2xl font-bold text-red-600">
            {data.length > 0 ? formatNumber(
              data.reduce((sum, item) => sum + item.emission, 0)
            ) : '-'} kg
          </div>
          <p className="text-sm text-gray-600">Semua moda</p>
        </div>
      </div>
    </div>
  );
};

export default ChartComparison;
