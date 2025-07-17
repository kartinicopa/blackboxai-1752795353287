// Transportation consumption rates (liters per km)
export const consumptionRates = {
  mobil: 0.069,        // Mobil Avanza
  bus: 0.091,          // Minibus HiAce
  motor: 0.02,         // Motor Vario
  ka_argo: 0.05,       // KA Argo Parahyangan (per passenger)
  kcic: 0.036          // KCIC Whoosh (kWh per pkm)
};

// Emission factors (kg CO₂ per liter/kWh)
export const emissionFactors = {
  bahan_bakar: 2.6,           // Diesel/gasoline
  listrik_grid: 0.85,         // PLN grid electricity
  biofuel: 0.5,               // Biofuel LCA
  listrik_renewable: 0        // Renewable electricity
};

// Static distances (km) for train services
export const staticDistances = {
  ka_argo: 150,        // Bandung-Jakarta via KA Argo
  kcic: 142            // Bandung-Jakarta via KCIC
};

// BMKG Region codes for weather data
export const REGION_CODES = {
  // DKI Jakarta
  'jakarta-pusat': '31.71',
  'jakarta-utara': '31.72',
  'jakarta-barat': '31.73',
  'jakarta-selatan': '31.74',
  'jakarta-timur': '31.75',
  'kepulauan-seribu': '31.01',
  
  // Jawa Barat
  'bandung': '32.73',
  'bandung-barat': '32.17',
  'cimahi': '32.77',
  'purwakarta': '32.14',
  'karawang': '32.15',
  'bekasi': '32.75',
  'bekasi-kabupaten': '32.16',
  'bogor': '32.71',
  'depok': '32.76',
  'sukabumi': '32.72',
  'tasikmalaya': '32.78',
  'cirebon': '32.74',
  'banjar': '32.79'
};

// Route coordinates for Google Directions API
export const routeCoordinates = {
  'bandung-jakarta': {
    origin: 'Bandung, West Java, Indonesia',
    destination: 'Jakarta, Indonesia'
  },
  'jakarta-bandung': {
    origin: 'Jakarta, Indonesia',
    destination: 'Bandung, West Java, Indonesia'
  }
};

// Transportation modes configuration
export const transportModes = [
  { id: 'mobil', label: 'Mobil', type: 'road' },
  { id: 'bus', label: 'Bus/Minibus', type: 'road' },
  { id: 'motor', label: 'Motor', type: 'road' },
  { id: 'ka_argo', label: 'KA Argo Parahyangan', type: 'rail' },
  { id: 'kcic', label: 'KCIC Whoosh', type: 'rail' }
];
