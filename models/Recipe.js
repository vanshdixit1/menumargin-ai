const BaseEntity = require('./BaseEntity');
const RecipeIngredient = require('./RecipeIngredient');

/**
 * Recipe Entity
 * Encapsulates culinary composition, portion yields, dynamic COGS, and margin diagnostics.
 */
class Recipe extends BaseEntity {
  #profileId;
  #name;
  #category;
  #portionYield;
  #unitName;
  #sellingPrice;
  #monthlyVolume;
  #laborCostPerUnit;
  #packagingCostPerUnit;
  #lastAuditDate;
  #ingredients;

  constructor(data = {}) {
    super(data.id, data.createdAt, data.lastAuditDate);
    this.#profileId = data.profileId || 'bakery';
    this.#name = String(data.name || '').trim();
    this.#category = data.category || 'Main';
    this.#portionYield = Math.max(1, Number(data.portionYield) || 1);
    this.#unitName = data.unitName || 'portion';
    this.#sellingPrice = Number(data.sellingPrice) || 1.0;
    this.#monthlyVolume = Number(data.monthlyVolume) || 500;
    this.#laborCostPerUnit = Number(data.laborCostPerUnit) || 0;
    this.#packagingCostPerUnit = Number(data.packagingCostPerUnit) || 0;
    this.#lastAuditDate = data.lastAuditDate || new Date().toISOString().split('T')[0];

    // Encapsulate ingredients as value objects
    const rawIngs = Array.isArray(data.ingredients) ? data.ingredients : [];
    this.#ingredients = rawIngs.map(i => new RecipeIngredient(i));
  }

  // Getters
  get profileId() { return this.#profileId; }
  get name() { return this.#name; }
  get category() { return this.#category; }
  get portionYield() { return this.#portionYield; }
  get unitName() { return this.#unitName; }
  get sellingPrice() { return this.#sellingPrice; }
  get monthlyVolume() { return this.#monthlyVolume; }
  get laborCostPerUnit() { return this.#laborCostPerUnit; }
  get packagingCostPerUnit() { return this.#packagingCostPerUnit; }
  get lastAuditDate() { return this.#lastAuditDate; }
  get ingredients() { return [...this.#ingredients]; }

  /**
   * Encapsulated COGS & Cost Breakdown Engine
   * Returns line-item costs and identifies the primary cost driver
   */
  calculateCOGS(inventoryList = []) {
    let batchIngredientsCost = 0;
    let topIngredient = null;
    let maxLineCost = -1;

    const detailedIngredients = this.#ingredients.map(ing => {
      const invItem = inventoryList.find(i => i.id === ing.inventoryId);
      const lineCost = ing.calculateCost(invItem);
      batchIngredientsCost += lineCost;

      if (lineCost > maxLineCost) {
        maxLineCost = lineCost;
        topIngredient = {
          name: ing.name,
          lineCost,
          unit: ing.unit,
          quantity: ing.quantity
        };
      }

      return {
        inventoryId: ing.inventoryId,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        unitCost: invItem ? invItem.unitCost : 0,
        lineCost: Number(lineCost.toFixed(3)),
        trend: invItem?.trend || 'stable',
        priceChangePct: invItem?.priceChangePct || 0
      };
    });

    const ingredientPerPortion = batchIngredientsCost / this.#portionYield;
    const plateCost = ingredientPerPortion + this.#packagingCostPerUnit;
    const primaryDriverSharePct = plateCost > 0 && topIngredient
      ? Number(((topIngredient.lineCost / this.#portionYield / plateCost) * 100).toFixed(0))
      : 0;

    return {
      batchIngredientsCost: Number(batchIngredientsCost.toFixed(2)),
      ingredientPerPortion: Number(ingredientPerPortion.toFixed(2)),
      plateCost: Number(plateCost.toFixed(2)),
      primaryCostDriver: topIngredient ? {
        name: topIngredient.name,
        sharePct: primaryDriverSharePct,
        summary: `${topIngredient.name} (${primaryDriverSharePct}% of plate cost)`
      } : null,
      detailedIngredients
    };
  }

  /**
   * Encapsulated Margin Diagnostics & Turnaround Strategy
   * Computes health status, monthly leakage, and target recovery price
   */
  diagnose(targetPct = 28, inventoryList = []) {
    const cogs = this.calculateCOGS(inventoryList);
    const plateCost = cogs.plateCost;
    const foodCostPct = Number(((plateCost / this.#sellingPrice) * 100).toFixed(1));
    const grossMarginPct = Number((100 - foodCostPct).toFixed(1));

    // Determine status
    let status = 'HEALTHY';
    if (foodCostPct > targetPct + 6) {
      status = 'CRITICAL_LEAKAGE';
    } else if (foodCostPct > targetPct) {
      status = 'WARNING';
    }

    // Financial Leakage Math
    const targetPlateCost = this.#sellingPrice * (targetPct / 100);
    const unitOverrun = Math.max(0, plateCost - targetPlateCost);
    const monthlyMarginLeakage = Math.round(unitOverrun * this.#monthlyVolume);
    const annualMarginLeakage = monthlyMarginLeakage * 12;
    const monthlyRevenue = Math.round(this.#sellingPrice * this.#monthlyVolume);
    const monthlyProfit = Math.round((this.#sellingPrice - plateCost - this.#laborCostPerUnit) * this.#monthlyVolume);

    // Recommended Menu Price to restore target food cost %
    const idealPrice = targetPct > 0 ? (plateCost / (targetPct / 100)) : this.#sellingPrice;
    // Round to psychological price point (e.g. .75, .95, .50)
    const recommendedPrice = Number((Math.ceil(idealPrice * 4) / 4).toFixed(2));

    // Actionable recommendation
    let actionRecommendation = 'Margin healthy. No action required.';
    if (status === 'CRITICAL_LEAKAGE') {
      actionRecommendation = `Reposition price from $${this.#sellingPrice.toFixed(2)} → $${recommendedPrice.toFixed(2)} or trim ${cogs.primaryCostDriver?.name || 'ingredients'} by ~15%`;
    } else if (status === 'WARNING') {
      actionRecommendation = `Monitor ${cogs.primaryCostDriver?.name || 'ingredients'}; consider minor price bump to $${recommendedPrice.toFixed(2)}`;
    }

    return {
      foodCostPct,
      grossMarginPct,
      targetFoodCostPct: targetPct,
      status,
      monthlyVolume: this.#monthlyVolume,
      monthlyRevenue,
      monthlyProfit,
      monthlyMarginLeakage,
      annualMarginLeakage,
      recommendedPrice,
      primaryCostDriver: cogs.primaryCostDriver,
      actionRecommendation,
      ...cogs
    };
  }

  /**
   * Crisp, Executive High-Signal DTO
   * Delivers only what the restaurant owner or chef needs to make an immediate decision
   */
  toCrispSummary(targetPct = 28, inventoryList = []) {
    const diag = this.diagnose(targetPct, inventoryList);
    const isLeaking = diag.monthlyMarginLeakage > 0;

    return {
      id: this.id,
      name: this.#name,
      category: this.#category,
      sellingPriceFormatted: `$${this.#sellingPrice.toFixed(2)}`,
      plateCostFormatted: `$${diag.plateCost.toFixed(2)}`,
      foodCostPct: diag.foodCostPct,
      targetFoodCostPct: targetPct,
      status: diag.status,
      leakageHeadline: isLeaking ? `-$${diag.monthlyMarginLeakage.toLocaleString()} / mo` : '$0 leakage',
      annualLeakageFormatted: isLeaking ? `-$${diag.annualMarginLeakage.toLocaleString()} / yr` : '$0',
      primaryCostDriver: diag.primaryCostDriver?.summary || 'Evenly distributed',
      quickAction: diag.actionRecommendation,
      recommendedPriceFormatted: `$${diag.recommendedPrice.toFixed(2)}`
    };
  }

  /**
   * Full DTO with complete ingredients breakdown
   */
  toDetailedDTO(targetPct = 28, inventoryList = []) {
    const diag = this.diagnose(targetPct, inventoryList);
    return {
      id: this.id,
      profileId: this.#profileId,
      name: this.#name,
      category: this.#category,
      portionYield: this.#portionYield,
      unitName: this.#unitName,
      sellingPrice: this.#sellingPrice,
      monthlyVolume: this.#monthlyVolume,
      laborCostPerUnit: this.#laborCostPerUnit,
      packagingCostPerUnit: this.#packagingCostPerUnit,
      lastAuditDate: this.#lastAuditDate,
      ingredients: diag.detailedIngredients,
      metrics: {
        totalIngredientsCost: diag.batchIngredientsCost,
        ingredientPerPortion: diag.ingredientPerPortion,
        plateCost: diag.plateCost,
        foodCostPct: diag.foodCostPct,
        grossMarginPct: diag.grossMarginPct,
        targetFoodCostPct: diag.targetFoodCostPct,
        marginStatus: diag.status,
        monthlyVolume: diag.monthlyVolume,
        monthlyRevenue: diag.monthlyRevenue,
        monthlyProfit: diag.monthlyProfit,
        monthlyMarginLeakage: diag.monthlyMarginLeakage,
        primaryCostDriver: diag.primaryCostDriver,
        recommendedPrice: diag.recommendedPrice,
        actionRecommendation: diag.actionRecommendation
      }
    };
  }

  toJSON() {
    return {
      id: this.id,
      profileId: this.#profileId,
      name: this.#name,
      category: this.#category,
      portionYield: this.#portionYield,
      unitName: this.#unitName,
      sellingPrice: this.#sellingPrice,
      monthlyVolume: this.#monthlyVolume,
      ingredients: this.#ingredients.map(i => i.toJSON()),
      laborCostPerUnit: this.#laborCostPerUnit,
      packagingCostPerUnit: this.#packagingCostPerUnit,
      lastAuditDate: this.#lastAuditDate
    };
  }
}

module.exports = Recipe;
