import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatNumber } from './calculations.js';

/**
 * Generate PDF report for emission calculations
 * @param {object} reportData - Data for the report
 * @returns {void}
 */
export const generatePDFReport = (reportData) => {
  try {
    const doc = new jsPDF();
    
    // Set up document properties
    doc.setProperties({
      title: 'Laporan Simulasi Emisi Karbon',
      subject: 'Carbon Emission Calculation Report',
      author: 'Carbon Emission Calculator',
      creator: 'Carbon Emission App'
    });
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN SIMULASI EMISI KARBON', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Moda Transportasi Bandung - Jakarta', 105, 30, { align: 'center' });
    
    // Route information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rute: ${reportData.route || 'Bandung - Jakarta'}`, 20, 45);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 52);
    doc.text(`Jarak: ${formatNumber(reportData.distance || 0)} km`, 20, 59);
    
    // Scenario information if available
    if (reportData.scenario) {
      doc.setFont('helvetica', 'bold');
      doc.text('Skenario Simulasi:', 20, 70);
      doc.setFont('helvetica', 'normal');
      
      let yPos = 77;
      if (reportData.scenario.traffic) {
        doc.text(`• Traffic: ${getTrafficLabel(reportData.scenario.traffic)}`, 25, yPos);
        yPos += 7;
      }
      if (reportData.scenario.cuaca) {
        doc.text(`• Cuaca: ${getWeatherLabel(reportData.scenario.cuaca)}`, 25, yPos);
        yPos += 7;
      }
      if (reportData.scenario.loadFactor) {
        doc.text(`• Load Factor: ${getLoadFactorLabel(reportData.scenario.loadFactor)}`, 25, yPos);
        yPos += 7;
      }
      if (reportData.scenario.energy) {
        doc.text(`• Sumber Energi: ${getEnergyLabel(reportData.scenario.energy)}`, 25, yPos);
        yPos += 7;
      }
    }
    
    // Results table
    const tableStartY = reportData.scenario ? 100 : 75;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Hasil Perhitungan:', 20, tableStartY);
    
    // Prepare table data
    const tableHeaders = [
      'Moda Transportasi',
      'Jarak (km)',
      'Konsumsi Bahan Bakar (L)',
      'Emisi CO₂ (kg)'
    ];
    
    const tableData = reportData.results?.map(result => [
      getModeLabel(result.mode),
      formatNumber(result.distance),
      formatNumber(result.fuelConsumption, 3),
      formatNumber(result.emission, 3)
    ]) || [];
    
    // Generate table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: tableStartY + 10,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 55, 72],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [247, 250, 252]
      }
    });
    
    // Summary statistics
    if (reportData.results && reportData.results.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 15;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkasan:', 20, finalY);
      
      const totalEmission = reportData.results.reduce((sum, result) => sum + result.emission, 0);
      const avgEmission = totalEmission / reportData.results.length;
      const minEmission = Math.min(...reportData.results.map(r => r.emission));
      const maxEmission = Math.max(...reportData.results.map(r => r.emission));
      
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total Emisi: ${formatNumber(totalEmission, 2)} kg CO₂`, 25, finalY + 10);
      doc.text(`• Rata-rata Emisi: ${formatNumber(avgEmission, 2)} kg CO₂`, 25, finalY + 17);
      doc.text(`• Emisi Terendah: ${formatNumber(minEmission, 2)} kg CO₂`, 25, finalY + 24);
      doc.text(`• Emisi Tertinggi: ${formatNumber(maxEmission, 2)} kg CO₂`, 25, finalY + 31);
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Dibuat dengan Carbon Emission Calculator', 105, pageHeight - 15, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString('id-ID')}`, 105, pageHeight - 10, { align: 'center' });
    
    // Save the PDF
    const fileName = `laporan-emisi-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return {
      success: true,
      fileName
    };
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Gagal membuat laporan PDF: ' + error.message);
  }
};

/**
 * Helper functions for labels
 */
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

const getTrafficLabel = (traffic) => {
  const labels = {
    normal: 'Normal',
    padat: 'Padat (+10%)',
    sangat_padat: 'Sangat Padat (+20%)'
  };
  return labels[traffic] || traffic;
};

const getWeatherLabel = (cuaca) => {
  const labels = {
    normal: 'Normal',
    hujan_ringan: 'Hujan Ringan (+5%)',
    hujan_lebat: 'Hujan Lebat (+10%)'
  };
  return labels[cuaca] || cuaca;
};

const getLoadFactorLabel = (loadFactor) => {
  const labels = {
    standard: 'Standard',
    peak: 'Peak Season (+15%)'
  };
  return labels[loadFactor] || loadFactor;
};

const getEnergyLabel = (energy) => {
  const labels = {
    standard: 'Bahan Bakar Konvensional',
    bahan_bakar: 'Bahan Bakar Konvensional',
    biofuel: 'Biofuel',
    listrik_renewable: 'Listrik Renewable'
  };
  return labels[energy] || energy;
};

/**
 * Generate simple PDF with custom content
 * @param {string} title - PDF title
 * @param {string} content - PDF content
 * @param {string} fileName - File name
 */
export const generateSimplePDF = (title, content, fileName = 'report.pdf') => {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(content, 170);
    doc.text(lines, 20, 40);
    
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw new Error('Gagal membuat PDF: ' + error.message);
  }
};
