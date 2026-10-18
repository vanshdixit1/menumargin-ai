/**
 * MarginAudit Aggregate
 * Encapsulates multi-dish margin audits, portfolio risk assessment, and executive rollups.
 */
class MarginAudit {
  #profile;
  #recipes;
  #inventory;
  #auditedDishes;
  #totalMonthlyRevenue;
  #totalMonthlyProfit;
  #totalMonthlyLeakage;

  constructor(profile, recipes = [], inventory = []) {
    this.#profile = profile;
    this.#recipes = recipes;
    this.#inventory = inventory;
    this.#auditedDishes = [];
    this.#totalMonthlyRevenue = 0;
    this.#totalMonthlyProfit = 0;
    this.#totalMonthlyLeakage = 0;

    this.#runAudit();
  }

  #runAudit() {
    const targetPct = this.#profile.targetFoodCostPct || 28;

    this.#recipes.forEach(recipe => {
      const diag = recipe.diagnose(targetPct, this.#inventory);
      this.#totalMonthlyRevenue += diag.monthlyRevenue;
      this.#totalMonthlyProfit += diag.monthlyProfit;
      this.#totalMonthlyLeakage += diag.monthlyMarginLeakage;

      this.#auditedDishes.push({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        sellingPrice: recipe.sellingPrice,
        plateCost: diag.plateCost,
        foodCostPct: diag.foodCostPct,
        targetFoodCostPct: targetPct,
        monthlyVolume: diag.monthlyVolume,
        monthlyRevenue: diag.monthlyRevenue,
        monthlyProfit: diag.monthlyProfit,
        monthlyLeakage: diag.monthlyMarginLeakage,
        annualLeakage: diag.annualMarginLeakage,
        status: diag.status,
        primaryCostDriver: diag.primaryCostDriver,
        actionRecommendation: diag.actionRecommendation,
        recommendedPrice: diag.recommendedPrice
      });
    });

    // Sort dishes by monthly leakage descending so highest risk is first
    this.#auditedDishes.sort((a, b) => b.monthlyLeakage - a.monthlyLeakage);
  }

  get totalMonthlyLeakage() { return this.#totalMonthlyLeakage; }
  get annualLeakage() { return this.#totalMonthlyLeakage * 12; }
  get auditedDishes() { return [...this.#auditedDishes]; }

  /**
   * Crisp Executive Audit Report
   * Strips away low-level clutter and returns only punchy financial intelligence.
   */
  toCrispExecutiveSummary() {
    const criticalDishes = this.#auditedDishes.filter(d => d.status === 'CRITICAL_LEAKAGE');
    const warningDishes = this.#auditedDishes.filter(d => d.status === 'WARNING');
    const healthyDishes = this.#auditedDishes.filter(d => d.status === 'HEALTHY');

    const topBleeding = criticalDishes[0] || warningDishes[0] || null;

    let priorityAction = 'All menu items within healthy margin thresholds.';
    if (topBleeding) {
      priorityAction = `URGENT: Re-anchor ${topBleeding.name} from $${topBleeding.sellingPrice.toFixed(2)} → $${topBleeding.recommendedPrice.toFixed(2)} to stop $${topBleeding.monthlyLeakage.toLocaleString()}/mo leakage.`;
    }

    return {
      kitchen: {
        name: this.#profile.name,
        type: this.#profile.type,
        owner: this.#profile.owner,
        location: this.#profile.location,
        targetFoodCostPct: this.#profile.targetFoodCostPct
      },
      auditDate: new Date().toISOString().split('T')[0],
      financials: {
        totalMonthlyRevenueFormatted: `$${this.#totalMonthlyRevenue.toLocaleString()}`,
        monthlyLeakageFormatted: `$${this.#totalMonthlyLeakage.toLocaleString()}`,
        annualLeakageFormatted: `$${(this.#totalMonthlyLeakage * 12).toLocaleString()}`,
        annualProfitAtRisk: this.#totalMonthlyLeakage * 12
      },
      healthBreakdown: {
        totalDishes: this.#auditedDishes.length,
        criticalCount: criticalDishes.length,
        warningCount: warningDishes.length,
        healthyCount: healthyDishes.length,
        overallStatus: criticalDishes.length > 0 ? 'CRITICAL_ATTENTION' : (warningDishes.length > 0 ? 'WARNING' : 'OPTIMAL')
      },
      highestPriorityAction: priorityAction,
      topLeakingDishes: criticalDishes.map(d => ({
        name: d.name,
        foodCostPct: `${d.foodCostPct}% (Target: ${d.targetFoodCostPct}%)`,
        monthlyLeakage: `-$${d.monthlyLeakage.toLocaleString()} / mo`,
        annualLeakage: `-$${d.annualLeakage.toLocaleString()} / yr`,
        driver: d.primaryCostDriver?.summary || 'Cost inflation',
        fix: d.actionRecommendation
      }))
    };
  }

  toDetailedReport() {
    return {
      profile: this.#profile.toJSON ? this.#profile.toJSON() : this.#profile,
      summary: {
        totalMonthlyRevenue: this.#totalMonthlyRevenue,
        totalMonthlyProfit: this.#totalMonthlyProfit,
        totalMonthlyLeakage: this.#totalMonthlyLeakage,
        annualLeakage: this.#totalMonthlyLeakage * 12
      },
      auditedDishes: this.#auditedDishes
    };
  }
}

module.exports = MarginAudit;
