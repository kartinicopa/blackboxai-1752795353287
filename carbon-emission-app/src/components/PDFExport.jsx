import React, { useState } from 'react';
import { generatePDFReport } from '../utils/pdfGenerator.js';

/**
 * PDFExport component for generating and downloading PDF reports
 * @param {object} props - Component props
 * @param {Array} props.data - Calculation results data
 * @param {string} props.route - Selected route
 * @param {object} props.scenario - Scenario parameters
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} PDFExport component
 */
const PDFExport = ({ data = [], route = '', scenario = {}, loading = false }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk dijadikan laporan. Silakan lakukan perhitungan terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const reportData = {
        route: route === 'bandung-jakarta' ? 'Bandung - Jakarta' : 'Jakarta - Bandung',
        distance: data[0]?.distance || 0,
        results: data,
        scenario: scenario,
        generatedAt: new Date().toISOString()
      };

      await generatePDFReport(reportData);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(err.message || 'Gagal membuat laporan PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const getRouteLabel = (route) => {
    const labels = {
      'bandung-jakarta': 'Bandung - Jakarta',
      'jakarta-bandung': 'Jakarta - Bandung'
    };
    return labels[route] || route;
  };

  const getScenarioSummary = () => {
    if (!scenario || Object.keys(scenario).length === 0) {
      return 'Perhitungan aktual';
    }

    const parts = [];
    if (scenario.traffic && scenario.traffic !== 'normal') {
      parts.push(`lalu lintas ${scenario.traffic}`);
    }
    if (scenario.cuaca && scenario.cuaca !== 'normal') {
      parts.push(`cuaca ${scenario.cuaca}`);
    }
    if (scenario.energy && scenario.energy !== 'standard') {
      parts.push(`energi ${scenario.energy}`);
    }

    return parts.length > 0 ? `Skenario: ${parts.join(', ')}` : 'Perhitungan aktual';
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="subsection-title">Download Laporan PDF</h2>
        <p className="text-gray-600 text-sm">
          Unduh laporan lengkap hasil perhitungan emisi karbon dalam format PDF
        </p>
      </div>

      <div className="space-y-4">
        {/* Report Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Preview Laporan</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Rute:</strong> {getRouteLabel(route)}</p>
            <p><strong>Jumlah Moda:</strong> {data.length}</p>
            <p><strong>Total Emisi:</strong> {data.reduce((sum, item) => sum + (item.emission || 0), 0).toFixed(2)} kg CO₂</p>
            <p><strong>Skenario:</strong> {getScenarioSummary()}</p>
          </div>
        </div>

        {/* Data Summary */}
        {data.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Ringkasan Data</h4>
            <div className="text-sm text-blue-700">
              <ul className="space-y-1">
                {data.map((item, index) => (
                  <li key={index}>
                    {item.mode}: {item.emission.toFixed(3)} kg CO₂
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating || loading || data.length === 0}
            className={`btn-primary flex items-center justify-center ${
              (isGenerating || loading || data.length === 0) 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Membuat PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Laporan PDF
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Halaman
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Sukses!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Laporan PDF berhasil dibuat dan diunduh.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Informasi Laporan</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Laporan berisi hasil perhitungan emisi karbon untuk semua moda transportasi</p>
            <p>• Format PDF siap untuk dicetak atau dibagikan</p>
            <p>• File akan otomatis diunduh ke perangkat Anda</p>
            <p>• Pastikan data perhitungan sudah lengkap sebelum mengunduh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFExport;
