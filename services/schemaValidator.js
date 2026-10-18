/**
 * Runtime Schema Validator & Type Safety Guard
 * Ensures data integrity for Inventory, Recipes, Profiles, and Feedback.
 * Prevents NaN, negative numbers, missing IDs, or corrupt states.
 */

class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

const VALID_CATEGORIES = [
  'Dairy',
  'Dairy Alt',
  'Produce',
  'Meat',
  'Dry Goods',
  'Baking Essentials',
  'Beverage',
  'Condiments',
  'Bakery',
  'Packaging',
  'General'
];

const VALID_TRENDS = ['up', 'down', 'stable'];

function sanitizeString(val, fallback = '') {
  if (val == null) return fallback;
  return String(val).trim();
}

function sanitizeNumber(val, fallback = 0, min = 0) {
  const num = Number(val);
  if (isNaN(num)) return fallback;
  return Math.max(min, num);
}

/**
 * Validates and normalizes an Inventory Item
 */
function validateInventoryItem(item) {
  const errors = [];
  if (!item || typeof item !== 'object') {
    throw new ValidationError('Inventory item must be an object');
  }

  const id = sanitizeString(item.id);
  const name = sanitizeString(item.name);
  if (!name) errors.push('Item name is required and cannot be empty');

  const unitCost = Number(item.unitCost);
  if (isNaN(unitCost) || unitCost < 0) {
    errors.push('unitCost must be a non-negative number');
  }

  const unit = sanitizeString(item.unit, 'unit');
  if (!unit) errors.push('Unit is required');

  if (errors.length > 0) {
    throw new ValidationError(`Inventory validation failed for "${name || id}": ${errors.join(', ')}`, errors);
  }

  const sanitized = {
    id: id || 'inv-' + Date.now(),
    name,
    category: VALID_CATEGORIES.includes(item.category) ? item.category : 'General',
    supplier: sanitizeString(item.supplier, 'General Supplier'),
    packageQuantity: sanitizeNumber(item.packageQuantity, 1, 0.01),
    packageUnit: sanitizeString(item.packageUnit, unit),
    packageCost: sanitizeNumber(item.packageCost, unitCost),
    unitCost: Number(unitCost.toFixed(4)),
    unit,
    lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0],
    previousUnitCost: sanitizeNumber(item.previousUnitCost, unitCost),
    priceChangePct: sanitizeNumber(item.priceChangePct, 0, -100),
    trend: VALID_TRENDS.includes(item.trend) ? item.trend : 'stable',
    priceHistory: Array.isArray(item.priceHistory) ? item.priceHistory : [],
    profileId: sanitizeString(item.profileId, '')
  };

  return sanitized;
}

/**
 * Validates and normalizes a Recipe
 */
function validateRecipe(recipe) {
  const errors = [];
  if (!recipe || typeof recipe !== 'object') {
    throw new ValidationError('Recipe must be an object');
  }

  const name = sanitizeString(recipe.name);
  if (!name) errors.push('Recipe name is required');

  const portionYield = Number(recipe.portionYield);
  if (isNaN(portionYield) || portionYield <= 0) {
    errors.push('portionYield must be greater than 0');
  }

  const sellingPrice = Number(recipe.sellingPrice);
  if (isNaN(sellingPrice) || sellingPrice <= 0) {
    errors.push('sellingPrice must be greater than 0');
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push('Recipe must contain at least one ingredient');
  }

  if (errors.length > 0) {
    throw new ValidationError(`Recipe validation failed for "${name}": ${errors.join(', ')}`, errors);
  }

  const sanitizedIngredients = recipe.ingredients.map((ing, idx) => {
    const ingName = sanitizeString(ing.name, `Ingredient #${idx + 1}`);
    const quantity = sanitizeNumber(ing.quantity, 1, 0.001);
    const unit = sanitizeString(ing.unit, 'unit');
    const inventoryId = sanitizeString(ing.inventoryId);
    return {
      inventoryId: inventoryId || null,
      name: ingName,
      quantity,
      unit
    };
  });

  return {
    id: sanitizeString(recipe.id) || 'rec-' + Date.now(),
    profileId: sanitizeString(recipe.profileId, 'bakery'),
    name,
    category: sanitizeString(recipe.category, 'Main'),
    portionYield: Math.max(1, portionYield),
    unitName: sanitizeString(recipe.unitName, 'portions'),
    sellingPrice: Number(sellingPrice.toFixed(2)),
    monthlyVolume: Math.max(1, sanitizeNumber(recipe.monthlyVolume, 100)),
    ingredients: sanitizedIngredients,
    laborCostPerUnit: sanitizeNumber(recipe.laborCostPerUnit, 0),
    packagingCostPerUnit: sanitizeNumber(recipe.packagingCostPerUnit, 0),
    lastAuditDate: recipe.lastAuditDate || new Date().toISOString().split('T')[0]
  };
}

/**
 * Validates a Profile
 */
function validateProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new ValidationError('Profile must be an object');
  }
  const id = sanitizeString(profile.id);
  const name = sanitizeString(profile.name);
  if (!id || !name) {
    throw new ValidationError('Profile must have an id and name');
  }

  return {
    id,
    name,
    type: sanitizeString(profile.type, 'Restaurant'),
    owner: sanitizeString(profile.owner, 'Chef / Owner'),
    location: sanitizeString(profile.location, 'Local'),
    currency: sanitizeString(profile.currency, '$'),
    targetFoodCostPct: Math.min(100, Math.max(1, sanitizeNumber(profile.targetFoodCostPct, 28))),
    monthlyRevenueGoal: sanitizeNumber(profile.monthlyRevenueGoal, 10000)
  };
}

module.exports = {
  ValidationError,
  VALID_CATEGORIES,
  VALID_TRENDS,
  validateInventoryItem,
  validateRecipe,
  validateProfile
};
