/**
 * Unit Conversion & Dimensional Culinary Math Engine
 * Supports standard culinary units across Mass, Volume, and Count dimensions.
 */

const DIMENSIONS = {
  MASS: 'MASS',
  VOLUME: 'VOLUME',
  COUNT: 'COUNT'
};

// Base unit: Gram (g)
const MASS_FACTORS = {
  'g': 1,
  'gram': 1,
  'grams': 1,
  'oz': 28.3495,
  'ounce': 28.3495,
  'ounces': 28.3495,
  'lb': 453.592,
  'pound': 453.592,
  'pounds': 453.592,
  '#': 453.592,
  'kg': 1000,
  'kilogram': 1000
};

// Base unit: Milliliter (ml)
const VOLUME_FACTORS = {
  'ml': 1,
  'milliliter': 1,
  'fl oz': 29.5735,
  'fl_oz': 29.5735,
  'fluid ounce': 29.5735,
  'tsp': 4.92892,
  'teaspoon': 4.92892,
  'tbsp': 14.7868,
  'tablespoon': 14.7868,
  'cup': 236.588,
  'cups': 236.588,
  'pint': 473.176,
  'pt': 473.176,
  'quart': 946.353,
  'qt': 946.353,
  'quarts': 946.353,
  'gal': 3785.41,
  'gallon': 3785.41,
  'gallons': 3785.41,
  'l': 1000,
  'liter': 1000,
  'liters': 1000
};

// Base unit: Single Unit (1)
const COUNT_FACTORS = {
  'unit': 1,
  'each': 1,
  'ea': 1,
  'egg': 1,
  'eggs': 1,
  'bun': 1,
  'buns': 1,
  'can': 1,
  'portion': 1,
  'piece': 1,
  'pastry': 1,
  'tartlet': 1,
  'tartlets': 1,
  'croissant': 1,
  'croissants': 1,
  'dozen': 12,
  'dz': 12
};

// Common culinary ingredient densities (g / ml)
const DENSITIES = {
  water: 1.0,
  milk: 1.03,
  heavy_cream: 0.99,
  cream: 0.99,
  butter: 0.91,
  oil: 0.92,
  flour: 0.53,
  sugar: 0.85,
  honey: 1.42,
  vanilla: 1.05
};

function normalizeUnit(unitStr) {
  if (!unitStr || typeof unitStr !== 'string') return 'unit';
  const clean = unitStr.trim().toLowerCase().replace(/[-_]/g, ' ');
  if (clean.includes('fl') && clean.includes('oz')) return 'fl oz';
  if (clean === 'lb' || clean === 'lbs' || clean === 'pound' || clean === 'pounds' || clean === '#') return 'lb';
  if (clean === 'oz' || clean === 'ounce' || clean === 'ounces') return 'oz';
  if (clean === 'g' || clean === 'gram' || clean === 'grams') return 'g';
  if (clean === 'kg' || clean === 'kilogram') return 'kg';
  if (clean === 'qt' || clean === 'quart' || clean === 'quarts') return 'quart';
  if (clean === 'pt' || clean === 'pint') return 'pint';
  if (clean === 'gal' || clean === 'gallon') return 'gal';
  if (clean === 'egg' || clean === 'eggs') return 'egg';
  if (clean === 'bun' || clean === 'buns') return 'bun';
  if (clean === 'dz' || clean === 'dozen') return 'dozen';
  return clean;
}

function getDimension(unit) {
  const norm = normalizeUnit(unit);
  if (MASS_FACTORS[norm]) return DIMENSIONS.MASS;
  if (VOLUME_FACTORS[norm]) return DIMENSIONS.VOLUME;
  if (COUNT_FACTORS[norm]) return DIMENSIONS.COUNT;
  return null;
}

/**
 * Converts a quantity from one culinary unit to another
 * @param {number} qty - Input quantity
 * @param {string} fromUnit - Source unit (e.g. 'g', 'oz', 'quart', 'egg')
 * @param {string} toUnit - Target unit (e.g. 'lb', 'fl oz')
 * @param {string|number} density - Optional density or ingredient keyword (e.g. 'butter', 'heavy_cream', or 0.91)
 * @returns {number} converted quantity
 */
function convert(qty, fromUnit, toUnit, density = null) {
  if (qty == null || isNaN(qty)) return 0;
  if (fromUnit === toUnit) return Number(qty);

  const uFrom = normalizeUnit(fromUnit);
  const uTo = normalizeUnit(toUnit);
  if (uFrom === uTo) return Number(qty);

  const dimFrom = getDimension(uFrom);
  const dimTo = getDimension(uTo);

  // 1. Same dimension: direct scale conversion
  if (dimFrom === DIMENSIONS.MASS && dimTo === DIMENSIONS.MASS) {
    const baseGrams = qty * MASS_FACTORS[uFrom];
    return baseGrams / MASS_FACTORS[uTo];
  }

  if (dimFrom === DIMENSIONS.VOLUME && dimTo === DIMENSIONS.VOLUME) {
    const baseMl = qty * VOLUME_FACTORS[uFrom];
    return baseMl / VOLUME_FACTORS[uTo];
  }

  if (dimFrom === DIMENSIONS.COUNT && dimTo === DIMENSIONS.COUNT) {
    const baseUnits = qty * COUNT_FACTORS[uFrom];
    return baseUnits / COUNT_FACTORS[uTo];
  }

  // 2. Cross-dimension (Mass <-> Volume) using density (g/ml)
  let densityVal = 1.0;
  if (typeof density === 'number') {
    densityVal = density;
  } else if (typeof density === 'string') {
    const key = density.toLowerCase().replace(/[\s-]/g, '_');
    densityVal = DENSITIES[key] || 1.0;
  }

  // Volume to Mass (ml * g/ml = g)
  if (dimFrom === DIMENSIONS.VOLUME && dimTo === DIMENSIONS.MASS) {
    const baseMl = qty * VOLUME_FACTORS[uFrom];
    const grams = baseMl * densityVal;
    return grams / MASS_FACTORS[uTo];
  }

  // Mass to Volume (g / (g/ml) = ml)
  if (dimFrom === DIMENSIONS.MASS && dimTo === DIMENSIONS.VOLUME) {
    const baseGrams = qty * MASS_FACTORS[uFrom];
    const ml = baseGrams / densityVal;
    return ml / VOLUME_FACTORS[uTo];
  }

  // Incompatible dimension (e.g. count to mass without weight-per-piece)
  // Fall back to 1:1 nominal pass-through to prevent breaking
  return Number(qty);
}

/**
 * Calculates exact ingredient cost in a recipe dynamically converting units if needed
 * @param {object} ingredient - { quantity: 14, unit: 'oz', name: '...' }
 * @param {object} inventoryItem - { unitCost: 0.275, unit: 'oz' }
 */
function calculateIngredientCost(ingredient, inventoryItem) {
  if (!inventoryItem || typeof inventoryItem.unitCost !== 'number') return 0;
  const ingQty = Number(ingredient.quantity) || 0;
  const ingUnit = ingredient.unit || inventoryItem.unit || 'unit';
  const invUnit = inventoryItem.unit || 'unit';

  if (normalizeUnit(ingUnit) === normalizeUnit(invUnit)) {
    return ingQty * inventoryItem.unitCost;
  }

  // Convert recipe ingredient quantity to inventory purchasing unit
  const convertedQty = convert(ingQty, ingUnit, invUnit, ingredient.name || inventoryItem.name);
  return convertedQty * inventoryItem.unitCost;
}

module.exports = {
  DIMENSIONS,
  MASS_FACTORS,
  VOLUME_FACTORS,
  COUNT_FACTORS,
  DENSITIES,
  normalizeUnit,
  getDimension,
  convert,
  calculateIngredientCost
};
