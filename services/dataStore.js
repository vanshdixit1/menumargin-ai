const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const unitConverter = require('./unitConverter');
const {
  validateInventoryItem,
  validateRecipe,
  validateProfile,
  ValidationError
} = require('./schemaValidator');
const {
  InventoryItem,
  Recipe,
  KitchenProfile,
  MarginAudit
} = require('../models');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const DEFAULT_DATA_FILE = path.join(DATA_DIR, 'defaultData.json');

/**
 * ============================================================================
 * 1. STORAGE ADAPTER PATTERN
 * ============================================================================
 */
class StorageAdapter {
  read() { throw new Error('Not implemented'); }
  write(data) { throw new Error('Not implemented'); }
  reset() { throw new Error('Not implemented'); }
}

class JsonFileStorageAdapter extends StorageAdapter {
  constructor(dataDir, dataFile, defaultDataFile) {
    super();
    this.dataDir = dataDir;
    this.dataFile = dataFile;
    this.defaultDataFile = defaultDataFile;
    this.cache = null;
  }

  ensureInitialized() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.dataFile)) {
      const defaultRaw = fs.readFileSync(this.defaultDataFile, 'utf8');
      fs.writeFileSync(this.dataFile, defaultRaw, 'utf8');
      this.cache = JSON.parse(defaultRaw);
    }
  }

  read() {
    if (this.cache) return this.cache;
    this.ensureInitialized();
    try {
      const raw = fs.readFileSync(this.dataFile, 'utf8');
      this.cache = JSON.parse(raw);
    } catch (err) {
      console.error('[JsonFileStorageAdapter] Read error, falling back to default:', err);
      const defaultRaw = fs.readFileSync(this.defaultDataFile, 'utf8');
      this.cache = JSON.parse(defaultRaw);
    }
    return this.cache;
  }

  write(data) {
    this.cache = data;
    const serialized = JSON.stringify(data, null, 2);
    const tempFile = `${this.dataFile}.tmp-${Date.now()}`;

    try {
      fs.writeFileSync(tempFile, serialized, 'utf8');
      try {
        fs.renameSync(tempFile, this.dataFile);
      } catch (renameErr) {
        if (renameErr.code !== 'EPERM' && renameErr.code !== 'EEXIST') {
          throw renameErr;
        }
        fs.copyFileSync(tempFile, this.dataFile);
        fs.unlinkSync(tempFile);
      }
    } catch (writeErr) {
      console.error('[JsonFileStorageAdapter] Write error:', writeErr);
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch (cleanupErr) {
        console.error('[JsonFileStorageAdapter] Temporary file cleanup error:', cleanupErr);
      }
      throw writeErr;
    }
    return this.cache;
  }

  reset() {
    const defaultRaw = fs.readFileSync(this.defaultDataFile, 'utf8');
    fs.writeFileSync(this.dataFile, defaultRaw, 'utf8');
    this.cache = JSON.parse(defaultRaw);
    return this.cache;
  }
}

/**
 * ============================================================================
 * 2. REPOSITORY & DOMAIN AGGREGATE
 * Fully encapsulates entities, abstracts noisy calculations, and produces crisp DTOs
 * ============================================================================
 */
class DataStore extends EventEmitter {
  #adapter;
  #profiles = new Map(); // id -> KitchenProfile
  #inventory = new Map(); // id -> InventoryItem
  #recipes = new Map(); // id -> Recipe
  #activeProfileId = 'bakery';
  #dependencyGraph = new Map(); // inventoryId -> Set<recipeId>
  #feedbackLog = [];

  constructor(adapter) {
    super();
    this.#adapter = adapter || new JsonFileStorageAdapter(DATA_DIR, DATA_FILE, DEFAULT_DATA_FILE);
    this._bootstrap();
    this._registerDomainListeners();
  }

  _bootstrap() {
    const rawData = this.#adapter.read();

    // 1. Instantiate Kitchen Profiles
    this.#profiles.clear();
    const rawProfiles = rawData.profiles || {};
    Object.keys(rawProfiles).forEach(id => {
      this.#profiles.set(id, new KitchenProfile({ id, ...rawProfiles[id] }));
    });
    this.#activeProfileId = rawData.activeProfileId || 'bakery';

    // 2. Instantiate Inventory Items
    this.#inventory.clear();
    const rawInv = rawData.inventory || [];
    rawInv.forEach(itemData => {
      const item = new InventoryItem(itemData);
      this.#inventory.set(item.id, item);
    });

    // 3. Instantiate Recipes
    this.#recipes.clear();
    const rawRecs = rawData.recipes || [];
    rawRecs.forEach(recData => {
      const rec = new Recipe(recData);
      this.#recipes.set(rec.id, rec);
    });

    // 4. Feedbacks & Invoices
    this.#feedbackLog = Array.isArray(rawData.userFeedbackLog) ? [...rawData.userFeedbackLog] : [];

    // 5. Rebuild DAG
    this.#rebuildDependencyGraph();
  }

  #rebuildDependencyGraph() {
    this.#dependencyGraph.clear();
    for (const recipe of this.#recipes.values()) {
      recipe.ingredients.forEach(ing => {
        if (ing.inventoryId) {
          if (!this.#dependencyGraph.has(ing.inventoryId)) {
            this.#dependencyGraph.set(ing.inventoryId, new Set());
          }
          this.#dependencyGraph.get(ing.inventoryId).add(recipe.id);
        }
      });
    }
  }

  #persist() {
    const serializedProfiles = {};
    for (const [id, prof] of this.#profiles.entries()) {
      serializedProfiles[id] = prof.toJSON();
    }

    const payload = {
      activeProfileId: this.#activeProfileId,
      profiles: serializedProfiles,
      inventory: Array.from(this.#inventory.values()).map(i => i.toJSON()),
      recipes: Array.from(this.#recipes.values()).map(r => r.toJSON()),
      sampleInvoices: this.#adapter.read().sampleInvoices || [],
      userFeedbackLog: this.#feedbackLog
    };

    this.#adapter.write(payload);
    return payload;
  }

  _registerDomainListeners() {
    this.on('inventory:price_updated', ({ item, affectedRecipes }) => {
      console.log(`[OOP Domain Event] Price updated on ${item.name}: now $${item.unitCost}/${item.unit} (${item.priceChangePct > 0 ? '+' : ''}${item.priceChangePct}%)`);
    });

    this.on('margin:alert', ({ recipe, foodCostPct, targetPct, leakageMonthly, level }) => {
      console.warn(`[OOP Margin Alert - ${level}] Dish "${recipe.name}" Food Cost: ${foodCostPct}% (Target: ${targetPct}%), Monthly Leakage: $${leakageMonthly}`);
    });
  }

  // Raw Compatibility Access
  getData() {
    return {
      activeProfileId: this.#activeProfileId,
      profiles: Object.fromEntries(Array.from(this.#profiles.entries()).map(([k, v]) => [k, v.toJSON()])),
      inventory: Array.from(this.#inventory.values()).map(i => i.toJSON()),
      recipes: Array.from(this.#recipes.values()).map(r => r.toJSON()),
      sampleInvoices: this.#adapter.read().sampleInvoices || [],
      userFeedbackLog: this.#feedbackLog
    };
  }

  saveData(data) {
    this.#adapter.write(data);
    this._bootstrap();
    return data;
  }

  // Profile Encapsulation
  getActiveProfile() {
    const prof = this.#profiles.get(this.#activeProfileId) || this.#profiles.get('bakery');
    return prof.toJSON();
  }

  getActiveProfileEntity() {
    return this.#profiles.get(this.#activeProfileId) || this.#profiles.get('bakery');
  }

  setActiveProfile(profileId) {
    if (this.#profiles.has(profileId)) {
      this.#activeProfileId = profileId;
      this.#persist();
      const prof = this.#profiles.get(profileId);
      this.emit('profile:switched', prof.toJSON());
      return prof.toJSON();
    }

    throw new Error(`Profile ${profileId} not found`);
  }

  createProfile(profileInput) {
    const id = String(profileInput.id || `workspace-${Date.now()}`).trim();
    if (this.#profiles.has(id)) {
      throw new Error('A workspace with this identifier already exists');
    }
    const profile = new KitchenProfile(validateProfile({
      ...profileInput,
      id
    }));
    this.#profiles.set(id, profile);
    this.#activeProfileId = id;
    this.#persist();
    this.emit('profile:created', profile.toJSON());
    return profile.toJSON();
  }

  deleteProfile(profileId) {
    if (['bakery', 'cafe', 'foodtruck'].includes(profileId)) {
      throw new Error('Demo workspaces cannot be deleted');
    }
    this.#profiles.delete(profileId);
    for (const [id, item] of this.#inventory.entries()) {
      if (item.profileId === profileId) this.#inventory.delete(id);
    }
    for (const [id, recipe] of this.#recipes.entries()) {
      if (recipe.profileId === profileId) this.#recipes.delete(id);
    }
    this.#activeProfileId = 'bakery';
    this.#persist();
  }

  // Inventory Encapsulation & Crisp Abstraction
  getInventory() {
    const activeProfile = this.#profiles.get(this.#activeProfileId);
    const isCustomWorkspace = activeProfile && this.#activeProfileId !== 'bakery'
      && this.#activeProfileId !== 'cafe'
      && this.#activeProfileId !== 'foodtruck';
    return Array.from(this.#inventory.values())
      .filter(item => !isCustomWorkspace || item.profileId === this.#activeProfileId)
      .map(i => i.toJSON());
  }

  getInventoryEntities() {
    return Array.from(this.#inventory.values());
  }

  getInventoryItem(id) {
    const item = this.#inventory.get(id);
    return item ? item.toJSON() : null;
  }

  getInventoryEntity(id) {
    return this.#inventory.get(id) || null;
  }

  /**
   * Crisp Inventory Summary
   * High-signal view showing only what the chef needs (price, spike flag, impacted dishes)
   */
  getCrispInventorySummary() {
    return Array.from(this.#inventory.values()).map(item => {
      const depCount = this.getDependentRecipes(item.id).length;
      return item.toCrispSummary(depCount);
    });
  }

  updateInventoryItem(itemInput, meta = {}) {
    let entity = this.#inventory.get(itemInput.id);
    if (!entity) {
      entity = new InventoryItem(validateInventoryItem({
        ...itemInput,
        profileId: itemInput.profileId || this.#activeProfileId
      }));
      this.#inventory.set(entity.id, entity);
    } else {
      entity.recordDelivery(itemInput.unitCost, {
        packageCost: itemInput.packageCost,
        supplier: itemInput.supplier,
        invoiceId: meta.invoiceId,
        note: meta.note
      });
    }

    this.#persist();

    // Check DAG dependencies
    const affectedRecipeIds = this.getDependentRecipes(entity.id);
    const affectedRecipes = [];
    const activeProf = this.getActiveProfileEntity();
    const inventoryList = this.getInventory();

    affectedRecipeIds.forEach(recId => {
      const rec = this.#recipes.get(recId);
      if (rec) {
        const diag = rec.diagnose(activeProf.targetFoodCostPct, inventoryList);
        affectedRecipes.push({ recipe: rec.toJSON(), metrics: diag });

        if (diag.monthlyMarginLeakage > 0) {
          const level = diag.status === 'CRITICAL_LEAKAGE' ? 'CRITICAL' : 'WARNING';
          this.emit('margin:alert', {
            recipe: rec.toJSON(),
            foodCostPct: diag.foodCostPct,
            targetPct: diag.targetFoodCostPct,
            leakageMonthly: diag.monthlyMarginLeakage,
            level
          });
        }
      }
    });

    this.emit('inventory:price_updated', {
      item: entity.toJSON(),
      affectedRecipes
    });

    return entity.toJSON();
  }

  getDependentRecipes(inventoryId) {
    if (!this.#dependencyGraph.has(inventoryId)) return [];
    return Array.from(this.#dependencyGraph.get(inventoryId));
  }

  // Recipe Encapsulation & Crisp Abstraction
  getRecipes(profileId) {
    const pid = profileId || this.#activeProfileId;
    return Array.from(this.#recipes.values())
      .filter(r => r.profileId === pid)
      .map(r => r.toJSON());
  }

  getRecipeEntities(profileId) {
    const pid = profileId || this.#activeProfileId;
    return Array.from(this.#recipes.values()).filter(r => r.profileId === pid);
  }

  getAllRecipes() {
    return Array.from(this.#recipes.values()).map(r => r.toJSON());
  }

  saveRecipe(recipeInput) {
    const valid = validateRecipe(recipeInput);
    const entity = new Recipe(valid);
    this.#recipes.set(entity.id, entity);
    this.#rebuildDependencyGraph();
    this.#persist();
    this.emit('recipe:saved', entity.toJSON());
    return entity.toJSON();
  }

  deleteRecipe(id) {
    const removed = this.#recipes.delete(id);
    if (removed) {
      this.#rebuildDependencyGraph();
      this.#persist();
      this.emit('recipe:deleted', id);
    }
    return removed;
  }

  /**
   * Crisp Recipe Summary
   * Delivers high-level actionable margin intelligence per dish
   */
  getCrispRecipesSummary(profileId) {
    const prof = this.getActiveProfileEntity();
    const recipes = this.getRecipeEntities(profileId);
    const inventoryList = this.getInventory();

    return recipes.map(r => r.toCrispSummary(prof.targetFoodCostPct, inventoryList));
  }

  /**
   * Canonical Recipe Metrics Calculation
   * Delegates to the Recipe domain entity
   */
  calculateRecipeMetrics(recipeInput, profileInput, inventoryList) {
    const recEntity = recipeInput instanceof Recipe
      ? recipeInput
      : new Recipe(recipeInput);
    const targetPct = profileInput?.targetFoodCostPct || this.getActiveProfileEntity().targetFoodCostPct;
    const inv = inventoryList || this.getInventory();

    const diag = recEntity.diagnose(targetPct, inv);
    return {
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
      actionRecommendation: diag.actionRecommendation,
      detailedIngredients: diag.detailedIngredients
    };
  }

  /**
   * Domain Aggregate: Creates a full MarginAudit
   */
  createMarginAudit(profileId) {
    const prof = this.getActiveProfileEntity();
    const recipes = this.getRecipeEntities(profileId);
    const inventoryList = this.getInventory();
    return new MarginAudit(prof, recipes, inventoryList);
  }

  // Feedback Management
  addFeedback(feedback) {
    const entry = {
      id: 'fb-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...feedback
    };
    this.#feedbackLog.unshift(entry);
    this.#persist();
    this.emit('feedback:received', entry);
    return entry;
  }

  getFeedbacks() {
    return [...this.#feedbackLog];
  }

  resetToDefault() {
    this.#adapter.reset();
    this._bootstrap();
    this.emit('data:reset');
    return this.getData();
  }
}

const instance = new DataStore();

module.exports = instance;
module.exports.DataStore = DataStore;
module.exports.StorageAdapter = StorageAdapter;
module.exports.JsonFileStorageAdapter = JsonFileStorageAdapter;
module.exports.unitConverter = unitConverter;
