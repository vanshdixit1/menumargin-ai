const BaseEntity = require('./BaseEntity');

/**
 * KitchenProfile Entity
 * Encapsulates restaurant concept, financial targets, and margin benchmark rules.
 */
class KitchenProfile extends BaseEntity {
  #name;
  #type;
  #owner;
  #location;
  #currency;
  #targetFoodCostPct;
  #monthlyRevenueGoal;

  constructor(data = {}) {
    super(data.id, data.createdAt);
    this.#name = String(data.name || '').trim();
    this.#type = data.type || 'Restaurant';
    this.#owner = data.owner || 'Chef / Owner';
    this.#location = data.location || 'Local';
    this.#currency = data.currency || '$';
    this.#targetFoodCostPct = Number(data.targetFoodCostPct) || 28;
    this.#monthlyRevenueGoal = Number(data.monthlyRevenueGoal) || 15000;
  }

  get name() { return this.#name; }
  get type() { return this.#type; }
  get owner() { return this.#owner; }
  get location() { return this.#location; }
  get currency() { return this.#currency; }
  get targetFoodCostPct() { return this.#targetFoodCostPct; }
  get monthlyRevenueGoal() { return this.#monthlyRevenueGoal; }

  setTargetFoodCost(pct) {
    const val = Number(pct);
    if (isNaN(val) || val <= 0 || val >= 100) {
      throw new Error(`Invalid food cost target percentage: ${pct}`);
    }
    this.#targetFoodCostPct = val;
    this.touch();
  }

  toCrispSummary() {
    return {
      id: this.id,
      name: this.#name,
      type: this.#type,
      location: this.#location,
      targetFoodCostPct: this.#targetFoodCostPct,
      formattedTarget: `${this.#targetFoodCostPct}% Food Cost Target`
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.#name,
      type: this.#type,
      owner: this.#owner,
      location: this.#location,
      currency: this.#currency,
      targetFoodCostPct: this.#targetFoodCostPct,
      monthlyRevenueGoal: this.#monthlyRevenueGoal
    };
  }
}

module.exports = KitchenProfile;
