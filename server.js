const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const dataStore = require('./services/dataStore');
const gemmaService = require('./services/gemmaService');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup upload handling
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

/* ==========================================================================
   API ROUTES
   ========================================================================== */

// 1. Health & Gemma Status
app.get('/api/status', async (req, res) => {
  try {
    const gemmaStatus = await gemmaService.checkGemmaStatus();
    res.json({
      status: 'online',
      app: 'MenuMargin AI (RecipeCost Intelligence)',
      version: '1.0.0',
      partnerSponsors: ['Google Gemma (Open-Weight)', 'Render', 'Backboard.io', 'DevRelay'],
      gemma: gemmaStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Profiles
app.get('/api/profile', (req, res) => {
  try {
    const data = dataStore.getData();
    const active = dataStore.getActiveProfile();
    res.json({
      active,
      availableProfiles: Object.values(data.profiles)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile/select', (req, res) => {
  try {
    const { profileId } = req.body;
    const selected = dataStore.setActiveProfile(profileId);
    res.json({ success: true, profile: selected });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/profile', (req, res) => {
  try {
    const active = dataStore.getActiveProfile();
    const updated = { ...active, ...req.body };
    const data = dataStore.getData();
    data.profiles[active.id] = updated;
    dataStore.saveData(data);
    res.json({ success: true, profile: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Wholesale Inventory & Price History
app.get('/api/inventory', (req, res) => {
  try {
    const items = dataStore.getInventory();
    // Calculate category summaries and overall inflation index
    const totalItems = items.length;
    const risingItems = items.filter(i => (i.priceChangePct || 0) > 5);
    const avgInflation = totalItems > 0 
      ? Number((items.reduce((acc, i) => acc + (i.priceChangePct || 0), 0) / totalItems).toFixed(1))
      : 0;

    res.json({
      items,
      stats: {
        totalItems,
        risingItemsCount: risingItems.length,
        averageInflationPct: avgInflation
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', (req, res) => {
  try {
    const item = req.body;
    if (!item.id) item.id = 'inv-' + Date.now();
    item.lastUpdated = new Date().toISOString().split('T')[0];
    const saved = dataStore.updateInventoryItem(item);
    res.json({ success: true, item: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Recipes with Real-Time COGS & Margin Metrics
app.get('/api/recipes', (req, res) => {
  try {
    const profile = dataStore.getActiveProfile();
    const inventory = dataStore.getInventory();
    const rawRecipes = dataStore.getRecipes();

    // Calculate real-time metrics for every recipe
    const calculated = rawRecipes.map(recipe => {
      let ingredientsCost = 0;
      const ingDetails = recipe.ingredients.map(ing => {
        const inv = inventory.find(i => i.id === ing.inventoryId);
        const unitCost = inv ? inv.unitCost : 0;
        const lineCost = unitCost * ing.quantity;
        ingredientsCost += lineCost;
        return {
          ...ing,
          unitCost,
          lineCost: Number(lineCost.toFixed(3)),
          trend: inv?.trend || 'stable',
          priceChangePct: inv?.priceChangePct || 0
        };
      });

      const portionYield = recipe.portionYield || 1;
      const ingredientPerPortion = ingredientsCost / portionYield;
      const packagingPerUnit = recipe.packagingCostPerUnit || 0;
      const laborPerUnit = recipe.laborCostPerUnit || 0;
      const plateCost = ingredientPerPortion + packagingPerUnit;
      const sellingPrice = recipe.sellingPrice || 1;
      const foodCostPct = Number(((plateCost / sellingPrice) * 100).toFixed(1));
      const grossMarginPct = Number((100 - foodCostPct).toFixed(1));
      const targetPct = profile.targetFoodCostPct || 30;

      // Status classification
      let marginStatus = 'HEALTHY';
      if (foodCostPct > targetPct + 6) {
        marginStatus = 'CRITICAL_LEAKAGE';
      } else if (foodCostPct > targetPct) {
        marginStatus = 'WARNING';
      }

      const monthlyVolume = recipe.monthlyVolume || 500;
      const targetPlateCost = sellingPrice * (targetPct / 100);
      const unitCostOverrun = Math.max(0, plateCost - targetPlateCost);
      const monthlyMarginLeakage = Math.round(unitCostOverrun * monthlyVolume);
      const monthlyRevenue = Math.round(sellingPrice * monthlyVolume);
      const monthlyProfit = Math.round((sellingPrice - plateCost - laborPerUnit) * monthlyVolume);

      return {
        ...recipe,
        ingredients: ingDetails,
        metrics: {
          totalIngredientsCost: Number(ingredientsCost.toFixed(2)),
          ingredientPerPortion: Number(ingredientPerPortion.toFixed(2)),
          plateCost: Number(plateCost.toFixed(2)),
          foodCostPct,
          grossMarginPct,
          targetFoodCostPct: targetPct,
          marginStatus,
          monthlyVolume,
          monthlyRevenue,
          monthlyProfit,
          monthlyMarginLeakage
        }
      };
    });

    // Summary calculations
    const totalMonthlyLeakage = calculated.reduce((acc, r) => acc + r.metrics.monthlyMarginLeakage, 0);
    const avgFoodCostPct = calculated.length > 0
      ? Number((calculated.reduce((acc, r) => acc + r.metrics.foodCostPct, 0) / calculated.length).toFixed(1))
      : 0;
    const criticalCount = calculated.filter(r => r.metrics.marginStatus === 'CRITICAL_LEAKAGE').length;
    const warningCount = calculated.filter(r => r.metrics.marginStatus === 'WARNING').length;

    res.json({
      profile,
      recipes: calculated,
      summary: {
        totalDishes: calculated.length,
        avgFoodCostPct,
        targetFoodCostPct: profile.targetFoodCostPct,
        totalMonthlyLeakage,
        criticalDishes: criticalCount,
        warningDishes: warningCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recipes', (req, res) => {
  try {
    const profile = dataStore.getActiveProfile();
    const recipe = {
      ...req.body,
      profileId: profile.id,
      lastAuditDate: new Date().toISOString().split('T')[0]
    };
    const saved = dataStore.saveRecipe(recipe);
    res.json({ success: true, recipe: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/recipes/:id', (req, res) => {
  try {
    dataStore.deleteRecipe(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Gemma AI Invoice Extraction
app.post('/api/invoice/parse', upload.single('invoiceFile'), async (req, res) => {
  try {
    let invoiceText = req.body.rawText || '';

    // If file uploaded, convert to text / simulated OCR
    if (req.file) {
      if (req.file.mimetype.includes('text') || req.file.mimetype.includes('json')) {
        invoiceText = req.file.buffer.toString('utf8');
      } else {
        // Image / PDF upload OCR simulation using filename and headers
        invoiceText = `INVOICE IMAGE SCAN [${req.file.originalname}]\nSYSCO FOOD SERVICES ORDER RECEIPT\nBUTTR-UNSLT-EURO-82%-36#CS  $158.40\nEGGS-PAST-LG-15DZ-180CT     $72.00\nHVY-WHIP-CRM-36%-12/1QT     $54.00\nORG-RASPBERRY-12/6OZ-CLAM   $96.00`;
      }
    }

    if (!invoiceText || invoiceText.trim().length === 0) {
      const data = dataStore.getData();
      invoiceText = data.sampleInvoices[0].rawText;
    }

    const inventory = dataStore.getInventory();
    const gemmaResult = await gemmaService.parseInvoiceWithGemma(invoiceText, inventory);

    // If applyToInventory is requested, update the pantry automatically
    if (req.body.applyToInventory === true || req.body.applyToInventory === 'true') {
      const extracted = gemmaResult.data?.extractedItems || [];
      for (const item of extracted) {
        if (item.matchedInventoryId) {
          const inv = inventory.find(i => i.id === item.matchedInventoryId);
          if (inv) {
            inv.previousUnitCost = inv.unitCost;
            inv.unitCost = item.unitCost;
            inv.packageCost = item.packageCost;
            inv.priceChangePct = item.priceChangePct;
            inv.trend = item.priceChangePct > 2 ? 'up' : (item.priceChangePct < -2 ? 'down' : 'stable');
            inv.lastUpdated = new Date().toISOString().split('T')[0];
            dataStore.updateInventoryItem(inv);
          }
        }
      }
    }

    res.json({
      success: true,
      result: gemmaResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Gemma AI Recipe Optimization
app.post('/api/recipes/:id/optimize', async (req, res) => {
  try {
    const profile = dataStore.getActiveProfile();
    const inventory = dataStore.getInventory();
    const recipes = dataStore.getRecipes();
    const recipe = recipes.find(r => r.id === req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const optimizationPlan = await gemmaService.optimizeRecipeWithGemma(recipe, profile, inventory);
    res.json({
      success: true,
      plan: optimizationPlan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Full Printable Audit Report
app.get('/api/audit-report', (req, res) => {
  try {
    const profile = dataStore.getActiveProfile();
    const inventory = dataStore.getInventory();
    const recipes = dataStore.getRecipes();

    let totalMonthlyRevenue = 0;
    let totalMonthlyProfit = 0;
    let totalMonthlyLeakage = 0;
    const auditedDishes = [];

    recipes.forEach(recipe => {
      let ingCost = 0;
      recipe.ingredients.forEach(ing => {
        const inv = inventory.find(i => i.id === ing.inventoryId);
        ingCost += (inv ? inv.unitCost : 0) * ing.quantity;
      });
      const portionYield = recipe.portionYield || 1;
      const plateCost = (ingCost / portionYield) + (recipe.packagingCostPerUnit || 0);
      const foodCostPct = Number(((plateCost / recipe.sellingPrice) * 100).toFixed(1));
      const targetPct = profile.targetFoodCostPct;
      const targetPlateCost = recipe.sellingPrice * (targetPct / 100);
      const unitOverrun = Math.max(0, plateCost - targetPlateCost);
      const leakage = Math.round(unitOverrun * (recipe.monthlyVolume || 500));
      const revenue = Math.round(recipe.sellingPrice * (recipe.monthlyVolume || 500));
      const profit = Math.round((recipe.sellingPrice - plateCost - (recipe.laborCostPerUnit || 0)) * (recipe.monthlyVolume || 500));

      totalMonthlyRevenue += revenue;
      totalMonthlyProfit += profit;
      totalMonthlyLeakage += leakage;

      auditedDishes.push({
        name: recipe.name,
        category: recipe.category,
        sellingPrice: recipe.sellingPrice,
        plateCost: Number(plateCost.toFixed(2)),
        foodCostPct,
        targetFoodCostPct: targetPct,
        monthlyVolume: recipe.monthlyVolume,
        monthlyRevenue: revenue,
        monthlyProfit: profit,
        monthlyLeakage: leakage,
        urgency: foodCostPct > targetPct + 6 ? 'CRITICAL' : (foodCostPct > targetPct ? 'WARNING' : 'HEALTHY')
      });
    });

    res.json({
      generatedAt: new Date().toISOString(),
      profile,
      summary: {
        totalMonthlyRevenue,
        totalMonthlyProfit,
        totalMonthlyLeakage,
        annualizedLeakage: totalMonthlyLeakage * 12,
        potentialAnnualProfitGain: totalMonthlyLeakage * 12
      },
      auditedDishes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. User Feedback & First Customer Traction Log (Hacktoberfest Bonus Requirement)
app.get('/api/feedback', (req, res) => {
  try {
    const feedbackList = dataStore.getFeedbacks();
    res.json({ feedbacks: feedbackList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/feedback', (req, res) => {
  try {
    const entry = dataStore.addFeedback(req.body);
    res.json({ success: true, feedback: entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Reset Demo Data
app.post('/api/reset', (req, res) => {
  try {
    dataStore.resetToDefault();
    res.json({ success: true, message: 'Data reset to defaults' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sample Invoices
app.get('/api/sample-invoices', (req, res) => {
  const data = dataStore.getData();
  res.json({ sampleInvoices: data.sampleInvoices || [] });
});

/* ==========================================================================
   START SERVER
   ========================================================================== */

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 MenuMargin AI server running on http://localhost:${PORT}`);
  console.log(`🧠 Google Gemma (Open-Weight) AI Engine Ready`);
  console.log(`☁️  Render-ready web architecture`);
  console.log(`==================================================\n`);
});
