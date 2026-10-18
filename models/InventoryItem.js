const BaseEntity = require('./BaseEntity');

/**
 * InventoryItem Entity
 * Encapsulates wholesale ingredient state, time-series deliveries, and inflation signals.
 */
class InventoryItem extends BaseEntity {
  #name;
  #category;
  #supplier;
  #packageQuantity;
  #packageUnit;
  #packageCost;
  #unitCost;
  #unit;
  #previousUnitCost;
  #priceChangePct;
  #trend;
  #lastUpdated;
  #priceHistory;
  #profileId;

  constructor(data = {}) {
    super(data.id, data.createdAt, data.lastUpdated);
    this.#name = String(data.name || '').trim();
    this.#category = data.category || 'General';
    this.#supplier = data.supplier || 'Primary Supplier';
    this.#packageQuantity = Number(data.packageQuantity) || 1;
    this.#packageUnit = data.packageUnit || 'unit';
    this.#packageCost = Number(data.packageCost) || Number(data.unitCost) || 0;
    this.#unitCost = Number(data.unitCost) || 0;
    this.#unit = data.unit || 'unit';
    this.#previousUnitCost = Number(data.previousUnitCost) || this.#unitCost;
    this.#priceChangePct = Number(data.priceChangePct) || 0;
    this.#trend = data.trend || 'stable';
    this.#lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];
    this.#priceHistory = Array.isArray(data.priceHistory) ? [...data.priceHistory] : [];
    this.#profileId = data.profileId || null;
  }

  // Encapsulated Getters
  get name() { return this.#name; }
  get category() { return this.#category; }
  get supplier() { return this.#supplier; }
  get unitCost() { return this.#unitCost; }
  get unit() { return this.#unit; }
  get packageQuantity() { return this.#packageQuantity; }
  get packageUnit() { return this.#packageUnit; }
  get packageCost() { return this.#packageCost; }
  get previousUnitCost() { return this.#previousUnitCost; }
  get priceChangePct() { return this.#priceChangePct; }
  get trend() { return this.#trend; }
  get lastUpdated() { return this.#lastUpdated; }
  get priceHistory() { return [...this.#priceHistory]; }
  get profileId() { return this.#profileId; }

  /**
   * Encapsulated domain logic: updates price from delivery invoice,
   * calculates delta, logs historical audit, and determines volatility.
   */
  recordDelivery(newUnitCost, meta = {}) {
    const cost = Number(newUnitCost);
    if (isNaN(cost) || cost < 0) {
      throw new Error(`Invalid unit cost for ${this.#name}: ${newUnitCost}`);
    }

    const oldCost = this.#unitCost;
    const deltaPct = oldCost > 0
      ? Number((((cost - oldCost) / oldCost) * 100).toFixed(1))
      : 0;

    this.#previousUnitCost = oldCost;
    this.#unitCost = Number(cost.toFixed(4));
    this.#priceChangePct = deltaPct;
    this.#trend = deltaPct > 1.5 ? 'up' : (deltaPct < -1.5 ? 'down' : 'stable');
    this.#lastUpdated = new Date().toISOString().split('T')[0];

    if (meta.packageCost) {
      this.#packageCost = Number(meta.packageCost);
    }
    if (meta.supplier) {
      this.#supplier = meta.supplier;
    }

    // Append to time-series history
    this.#priceHistory.push({
      date: this.#lastUpdated,
      unitCost: this.#unitCost,
      packageCost: this.#packageCost,
      supplier: this.#supplier,
      invoiceId: meta.invoiceId || null,
      priceChangePct: deltaPct,
      note: meta.note || 'Delivery invoice update'
    });

    this.touch();
    return this;
  }

  /**
   * Domain behavior: returns whether this item is currently suffering from an inflation surge
   */
  isInflationSpike(thresholdPct = 5) {
    return this.#priceChangePct >= thresholdPct;
  }

  /**
   * Crisp, high-signal summary for executive user view
   * Hides all redundant packaging math and presents only actionable signals.
   */
  toCrispSummary(dependentCount = 0) {
    const isSpike = this.isInflationSpike(5);
    const sign = this.#priceChangePct > 0 ? '+' : '';

    return {
      id: this.id,
      name: this.#name,
      category: this.#category,
      unitCostFormatted: `$${this.#unitCost.toFixed(3)} / ${this.#unit}`,
      inflationSignal: `${isSpike ? '⚠️' : '✓'} ${sign}${this.#priceChangePct.toFixed(1)}%`,
      trend: this.#trend,
      isSpike,
      supplier: this.#supplier,
      lastUpdated: this.#lastUpdated,
      dishesImpactedCount: dependentCount,
      statusBadge: isSpike ? 'CRITICAL_SPIKE' : (this.#trend === 'up' ? 'WARNING' : 'STABLE')
    };
  }

  /**
   * Complete persistence serialization
   */
  toJSON() {
    return {
      id: this.id,
      name: this.#name,
      category: this.#category,
      supplier: this.#supplier,
      packageQuantity: this.#packageQuantity,
      packageUnit: this.#packageUnit,
      packageCost: this.#packageCost,
      unitCost: this.#unitCost,
      unit: this.#unit,
      previousUnitCost: this.#previousUnitCost,
      priceChangePct: this.#priceChangePct,
      trend: this.#trend,
      lastUpdated: this.#lastUpdated,
      priceHistory: this.#priceHistory,
      profileId: this.#profileId
    };
  }
}

module.exports = InventoryItem;
