import React from 'react';

/**
 * Layout component providing consistent structure across the application
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Layout component
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">
                Carbon Emission Calculator
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Simulasi Perhitungan Emisi Karbon Bandung - Jakarta
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm">
              © 2024 Carbon Emission Calculator - Tugas Akhir Teknik Informatika
            </div>
            <div className="text-sm mt-2 md:mt-0">
              Menggunakan Google Directions API & BMKG API
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
