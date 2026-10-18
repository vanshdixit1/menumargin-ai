const unitConverter = require('../services/unitConverter');

/**
 * RecipeIngredient Value Object
 * Encapsulates ingredient dosage and cost calculation with dimensional unit normalization.
 */
class RecipeIngredient {
  #inventoryId;
  #name;
  #quantity;
  #unit;

  constructor(data = {}) {
    this.#inventoryId = data.inventoryId || null;
    this.#name = String(data.name || '').trim();
    this.#quantity = Number(data.quantity) || 0;
    this.#unit = data.unit || 'unit';
  }

  get inventoryId() { return this.#inventoryId; }
  get name() { return this.#name; }
  get quantity() { return this.#quantity; }
  get unit() { return this.#unit; }

  /**
   * Encapsulates cost calculation by delegating to the unit converter
   */
  calculateCost(inventoryItem) {
    if (!inventoryItem) return 0;
    return unitConverter.calculateIngredientCost(
      { name: this.#name, quantity: this.#quantity, unit: this.#unit },
      inventoryItem
    );
  }

  toJSON() {
    return {
      inventoryId: this.#inventoryId,
      name: this.#name,
      quantity: this.#quantity,
      unit: this.#unit
    };
  }
}

module.exports = RecipeIngredient;
