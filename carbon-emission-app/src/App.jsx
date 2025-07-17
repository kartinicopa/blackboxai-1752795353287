import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import RouteSelector from './components/RouteSelector';
import TransportModeSelector from './components/TransportModeSelector';
import OptionsSelector from './components/OptionsSelector';
import CalculationTable from './components/CalculationTable';
import ChartComparison from './components/ChartComparison';
import HeatmapMap from './components/HeatmapMap';
import Forecast from './components/Forecast';
import PDFExport from './components/PDFExport';
import { calculateAllModes, calculateComprehensiveEmission } from './utils/calculations.js';
import { getRouteData } from './services/directionsService.js';
import { getWeatherAdjustmentFactor } from './services/bmkgService.js';
import { staticDistances } from './constants/config.js';

/**
 * Main App component for Carbon Emission Calculator
 */
function App() {
  const [mode, setMode] = useState('aktual'); // 'aktual' or 'prediksi'
  const [route, setRoute] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [scenario, setScenario] = useState({});
  const [calculationData, setCalculationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(0);

  // Calculate emissions when parameters change
  useEffect(() => {
    if (route && transportMode) {
      calculateEmissions();
    }
  }, [route, transportMode, scenario, mode]);

  const calculateEmissions = async () => {
    if (!route || !transportMode) return;

    setLoading(true);
    setError(null);

    try {
      let currentDistance = 0;
      let currentScenario = { ...scenario };

      // Get distance based on transport mode
      if (['ka_argo', 'kcic'].includes(transportMode)) {
        // Use static distance for trains
        currentDistance = staticDistances[transportMode] || 150;
      } else {
        // Use Google Directions API for road vehicles
        const routeData = routeCoordinates[route];
        if (routeData) {
          const result = await getRouteData({
            origin: routeData.origin,
            destination: routeData.destination,
            avoidTolls: scenario.tollOption === 'avoid_tolls'
          });

          if (result.success) {
            currentDistance = result.data.distance.km;
          } else {
            // Fallback distance
            currentDistance = 150;
          }
        }
      }

      setDistance(currentDistance);

      // Calculate emissions based on mode
      let results = [];
      
      if (mode === 'aktual') {
        // Single mode calculation
        const result = calculateComprehensiveEmission(transportMode, currentDistance, currentScenario);
        results = [result];
      } else {
        // Multiple modes for comparison
        const modes = ['mobil', 'bus', 'motor', 'ka_argo', 'kcic'];
        results = modes.map(mode => 
          calculateComprehensiveEmission(mode, currentDistance, currentScenario)
        );
      }

      // Apply weather adjustments
      const weatherAdjustment = await getWeatherAdjustmentFactor({ current: { condition: scenario.cuaca } });
      results = results.map(result => ({
        ...result,
        fuelConsumption: result.fuelConsumption * weatherAdjustment,
        emission: result.emission * weatherAdjustment
      }));

      setCalculationData(results);

    } catch (err) {
      console.error('Error calculating emissions:', err);
      setError(err.message || 'Terjadi kesalahan saat menghitung emisi');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = (newRoute) => {
    setRoute(newRoute);
  };

  const handleTransportModeChange = (newMode) => {
    setTransportMode(newMode);
  };

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
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

  return (
    <Layout>
      {/* Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setMode('aktual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                mode === 'aktual'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Perhitungan Aktual
            </button>
            <button
              onClick={() => setMode('prediksi')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                mode === 'prediksi'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Prediksi Scenario
            </button>
          </nav>
        </div>
      </div>

      {/* Mode Description */}
      <div className="mb-6">
        {mode === 'aktual' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Mode Perhitungan Aktual</h3>
            <p className="text-sm text-blue-700">
              Hitung emisi karbon berdasarkan data aktual dari Google Directions API dan BMKG. 
              Pilih satu moda transportasi untuk perhitungan detail.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Mode Prediksi Scenario</h3>
            <p className="text-sm text-green-700">
              Simulasikan berbagai skenario what-if untuk melihat dampak kondisi lalu lintas, cuaca, 
              dan sumber energi terhadap emisi karbon. Semua moda transportasi akan dibandingkan.
            </p>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RouteSelector 
          onRouteChange={handleRouteChange} 
          selectedRoute={route} 
        />
        
        <TransportModeSelector 
          onModeChange={handleTransportModeChange} 
          selectedMode={transportMode}
          allowMultiple={mode === 'prediksi'}
        />
      </div>

      {/* Scenario Options (only for prediksi mode) */}
      {mode === 'prediksi' && (
        <div className="mb-8">
          <OptionsSelector 
            onOptionsChange={handleScenarioChange} 
            selectedOptions={scenario}
          />
        </div>
      )}

      {/* Results Section */}
      {route && transportMode && (
        <>
          {/* Summary */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Ringkasan Perhitungan</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Rute:</span>
                  <span className="font-medium ml-2">{route === 'bandung-jakarta' ? 'Bandung - Jakarta' : 'Jakarta - Bandung'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Jarak:</span>
                  <span className="font-medium ml-2">{distance.toFixed(2)} km</span>
                </div>
                <div>
                  <span className="text-gray-600">Moda:</span>
                  <span className="font-medium ml-2">{getModeLabel(transportMode)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium ml-2">{mode === 'aktual' ? 'Aktual' : 'Prediksi'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-8">
            <CalculationTable 
              data={calculationData} 
              loading={loading} 
              error={error} 
            />

            {!loading && !error && calculationData.length > 0 && (
              <>
                <ChartComparison 
                  data={calculationData} 
                  loading={loading} 
                />

                <HeatmapMap 
                  data={calculationData} 
                  route={route} 
                />

                <Forecast 
                  route={route} 
                />

                <PDFExport 
                  data={calculationData} 
                  route={route} 
                  scenario={scenario}
                  loading={loading}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* Welcome Message */}
      {!route && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Selamat Datang</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pilih rute dan moda transportasi untuk memulai perhitungan emisi karbon
          </p>
        </div>
      )}
    </Layout>
  );
}

export default App;
