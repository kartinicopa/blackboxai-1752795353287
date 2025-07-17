import { consumptionRates, emissionFactors } from '../constants/config.js';

/**
 * Calculate fuel consumption based on rate, distance, and adjustments
 * @param {string} mode - Transportation mode
 * @param {number} distance - Distance in kilometers
 * @param {object} adjustments - Adjustment factors
 * @returns {number} Fuel consumption in liters
 */
export const calculateFuelConsumption = (mode, distance, adjustments = {}) => {
  const baseRate = consumptionRates[mode] || 0;
  const adjustmentFactor = getAdjustmentFactor(adjustments);
  return baseRate * distance * adjustmentFactor;
};

/**
 * Calculate CO₂ emissions based on fuel consumption and energy source
 * @param {number} fuelConsumption - Fuel consumption in liters
 * @param {string} energySource - Energy source type
 * @returns {number} CO₂ emissions in kg
 */
export const calculateEmission = (fuelConsumption, energySource = 'bahan_bakar') => {
  const factor = emissionFactors[energySource] || emissionFactors.bahan_bakar;
  return fuelConsumption * factor;
};

/**
 * Get adjustment factor based on scenario parameters
 * @param {object} params - Scenario parameters
 * @returns {number} Combined adjustment factor
 */
export const getAdjustmentFactor = (params = {}) => {
  let factor = 1;
  
  // Traffic adjustments
  if (params.traffic === 'padat') factor *= 1.1;
  if (params.traffic === 'sangat_padat') factor *= 1.2;
  
  // Weather adjustments
  if (params.cuaca === 'hujan_ringan') factor *= 1.05;
  if (params.cuaca === 'hujan_lebat') factor *= 1.1;
  
  // Load factor adjustments
  if (params.loadFactor === 'peak') factor *= 1.15;
  
  return factor;
};

/**
 * Calculate comprehensive emission data for a transportation mode
 * @param {string} mode - Transportation mode
 * @param {number} distance - Distance in kilometers
 * @param {object} scenario - Scenario parameters
 * @returns {object} Complete calculation results
 */
export const calculateComprehensiveEmission = (mode, distance, scenario = {}) => {
  const fuelConsumption = calculateFuelConsumption(mode, distance, scenario);
  const energySource = scenario.energy || 'bahan_bakar';
  const emission = calculateEmission(fuelConsumption, energySource);
  
  return {
    mode,
    distance: parseFloat(distance.toFixed(2)),
    fuelConsumption: parseFloat(fuelConsumption.toFixed(3)),
    emission: parseFloat(emission.toFixed(3)),
    energySource,
    scenario
  };
};

/**
 * Calculate emissions for all transportation modes
 * @param {number} distance - Distance in kilometers
 * @param {object} scenario - Scenario parameters
 * @returns {array} Array of calculation results for all modes
 */
export const calculateAllModes = (distance, scenario = {}) => {
  const modes = ['mobil', 'bus', 'motor', 'ka_argo', 'kcic'];
  return modes.map(mode => calculateComprehensiveEmission(mode, distance, scenario));
};

/**
 * Format number for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  return parseFloat(value).toFixed(decimals);
};
