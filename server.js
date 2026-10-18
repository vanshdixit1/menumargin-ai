const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const dataStore = require('./services/dataStore');
const gemmaService = require('./services/gemmaService');
const authStore = require('./services/authStore');
const { optionalAuth, requireAuth, getToken, sessionCookie, clearSessionCookie } = require('./services/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup upload handling
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(optionalAuth);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

function requestedWorkspace(req) {
  const cookie = String(req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith('mm_workspace='));
  return cookie ? decodeURIComponent(cookie.slice('mm_workspace='.length)) : null;
}

function selectRequestWorkspace(req) {
  if (!req.user) {
    dataStore.setActiveProfile('bakery');
    return 'bakery';
  }
  const ids = authStore.listWorkspaceIds(req.user.id);
  const candidate = requestedWorkspace(req);
  const profileId = candidate && authStore.canAccessWorkspace(req.user.id, candidate) ? candidate : ids[0];
  if (profileId) dataStore.setActiveProfile(profileId);
  return profileId || 'bakery';
}

function setWorkspaceCookie(res, profileId) {
  res.setHeader('Set-Cookie', `mm_workspace=${encodeURIComponent(profileId)}; Path=/; SameSite=Lax`);
}

// Authentication and account lifecycle
app.get('/api/auth/me', (req, res) => {
  res.json({ authenticated: Boolean(req.user), user: req.user, workspaceIds: req.user ? authStore.listWorkspaceIds(req.user.id) : [] });
});

app.post('/api/auth/register', (req, res) => {
  try {
    const user = authStore.createUser(req.body);
    const session = authStore.createSession(user.id);
    res.setHeader('Set-Cookie', sessionCookie(session.token, session.expiresAt));
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const user = authStore.authenticate(req.body.email, req.body.password);
    const session = authStore.createSession(user.id);
    res.setHeader('Set-Cookie', sessionCookie(session.token, session.expiresAt));
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  authStore.revokeSession(getToken(req));
  res.setHeader('Set-Cookie', clearSessionCookie());
  res.json({ success: true });
});

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
    const activeId = selectRequestWorkspace(req);
    const data = dataStore.getData();
    const active = dataStore.getActiveProfile();
    const allowed = req.user ? new Set(['bakery', 'cafe', 'foodtruck', ...authStore.listWorkspaceIds(req.user.id)]) : new Set(['bakery', 'cafe', 'foodtruck']);
    res.json({
      active,
      availableProfiles: Object.values(data.profiles).filter(profile => allowed.has(profile.id)),
      workspaceId: activeId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile/select', requireAuth, (req, res) => {
  try {
    const { profileId } = req.body;
    if (!['bakery', 'cafe', 'foodtruck'].includes(profileId) && !authStore.canAccessWorkspace(req.user.id, profileId)) {
      return res.status(403).json({ error: 'You do not have access to this workspace' });
    }
    const selected = dataStore.setActiveProfile(profileId);
    setWorkspaceCookie(res, profileId);
    res.json({ success: true, profile: selected });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/profile', (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Create an account before creating a workspace', code: 'AUTH_REQUIRED' });
    const profile = dataStore.createProfile(req.body);
    authStore.createWorkspace(req.user.id, profile);
    setWorkspaceCookie(res, profile.id);
    res.status(201).json({ success: true, profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/profile', requireAuth, (req, res) => {
  try {
    const profileId = selectRequestWorkspace(req);
    if (!authStore.canAccessWorkspace(req.user.id, profileId)) return res.status(403).json({ error: 'Workspace access denied' });
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

app.post('/api/profile/reset', requireAuth, (req, res) => {
  try {
    const profileId = selectRequestWorkspace(req);
    if (!authStore.canAccessWorkspace(req.user.id, profileId)) return res.status(403).json({ error: 'Workspace access denied' });
    const data = dataStore.getData();
    data.inventory = data.inventory.filter(item => item.profileId !== profileId);
    data.recipes = data.recipes.filter(recipe => recipe.profileId !== profileId);
    dataStore.saveData(data);
    res.json({ success: true, profileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/profile', requireAuth, (req, res) => {
  try {
    const profileId = selectRequestWorkspace(req);
    if (!authStore.canAccessWorkspace(req.user.id, profileId)) return res.status(403).json({ error: 'Workspace access denied' });
    dataStore.deleteProfile(profileId);
    authStore.deleteWorkspace(req.user.id, profileId);
    setWorkspaceCookie(res, 'bakery');
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Wholesale Inventory & Price History
app.get('/api/inventory', (req, res) => {
  try {
    selectRequestWorkspace(req);
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
    if (!req.user) return res.status(401).json({ error: 'Sign in required', code: 'AUTH_REQUIRED' });
    selectRequestWorkspace(req);
    const item = req.body;
    if (!item.id) item.id = 'inv-' + Date.now();
    item.lastUpdated = new Date().toISOString().split('T')[0];
    const saved = dataStore.updateInventoryItem(item);
    res.json({ success: true, item: saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory/import', requireAuth, (req, res) => {
  try {
    const csv = String(req.body.csv || '');
    const lines = csv.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return res.status(400).json({ error: 'CSV must include a header row and at least one ingredient' });
    const headers = lines.shift().split(',').map(value => value.trim().toLowerCase());
    const allowed = ['name', 'category', 'supplier', 'packagequantity', 'packageunit', 'packagecost', 'unitcost', 'unit'];
    const missing = ['name', 'unitcost', 'unit'].filter(field => !headers.includes(field));
    if (missing.length) return res.status(400).json({ error: `CSV is missing required columns: ${missing.join(', ')}` });
    selectRequestWorkspace(req);
    const imported = [];
    for (const line of lines) {
      const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
      const item = {
        id: `inv-${Date.now()}-${imported.length}`,
        name: row.name,
        category: row.category || 'General',
        supplier: row.supplier || 'General Supplier',
        packageQuantity: Number(row.packagequantity || 1),
        packageUnit: row.packageunit || row.unit,
        packageCost: Number(row.packagecost || row.unitcost),
        unitCost: Number(row.unitcost),
        unit: row.unit
      };
      const saved = dataStore.updateInventoryItem(item);
      imported.push(saved);
    }
    res.status(201).json({ success: true, importedCount: imported.length, items: imported });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3b. Inventory Item Time-Series History & Dependency Query
app.get('/api/inventory/:id/history', (req, res) => {
  try {
    const item = dataStore.getInventoryItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: `Inventory item ${req.params.id} not found` });
    }
    const dependentRecipeIds = dataStore.getDependentRecipes(req.params.id);
    const allRecipes = dataStore.getAllRecipes();
    const dependentRecipes = allRecipes.filter(r => dependentRecipeIds.includes(r.id));

    res.json({
      item,
      priceHistory: item.priceHistory || [],
      dependentRecipes: dependentRecipes.map(r => ({ id: r.id, name: r.name, category: r.category }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3c. Dependency Graph Query
app.get('/api/dependencies', (req, res) => {
  try {
    const inventory = dataStore.getInventory();
    const graph = {};
    inventory.forEach(item => {
      graph[item.id] = {
        name: item.name,
        dependentRecipeIds: dataStore.getDependentRecipes(item.id)
      };
    });
    res.json({ graph });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3d. Dimensional Unit Conversion Endpoint
app.get('/api/convert-unit', (req, res) => {
  try {
    const { qty, from, to, density } = req.query;
    const converted = dataStore.unitConverter.convert(Number(qty) || 1, from, to, density);
    res.json({
      quantity: Number(qty) || 1,
      fromUnit: from,
      toUnit: to,
      convertedQuantity: Number(converted.toFixed(4))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Recipes with Real-Time COGS & Margin Metrics (OOP Abstraction)
app.get('/api/recipes', (req, res) => {
  try {
    selectRequestWorkspace(req);
    const profile = dataStore.getActiveProfile();
    const inventory = dataStore.getInventory();
    const recipeEntities = dataStore.getRecipeEntities();

    // Delegate calculation to Recipe domain entities
    const calculated = recipeEntities.map(r => r.toDetailedDTO(profile.targetFoodCostPct, inventory));

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
    if (!req.user) return res.status(401).json({ error: 'Sign in required', code: 'AUTH_REQUIRED' });
    selectRequestWorkspace(req);
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
    if (!req.user) return res.status(401).json({ error: 'Sign in required', code: 'AUTH_REQUIRED' });
    selectRequestWorkspace(req);
    dataStore.deleteRecipe(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Gemma AI Invoice Extraction
app.post('/api/invoice/parse', upload.single('invoiceFile'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Sign in required', code: 'AUTH_REQUIRED' });
    selectRequestWorkspace(req);
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

    // If applyToInventory is requested, update the pantry automatically with time-series history
    if (req.body.applyToInventory === true || req.body.applyToInventory === 'true') {
      const extracted = gemmaResult.data?.extractedItems || [];
      const invoiceMeta = {
        invoiceId: gemmaResult.data?.invoiceNumber || 'INV-SCAN',
        note: `Verified Delivery from ${gemmaResult.data?.vendor || 'Supplier'}`
      };
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
            dataStore.updateInventoryItem(inv, invoiceMeta);
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
    if (!req.user) return res.status(401).json({ error: 'Sign in required', code: 'AUTH_REQUIRED' });
    selectRequestWorkspace(req);
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

// 7. Full Printable Audit Report (Delegates to MarginAudit Aggregate)
app.get('/api/audit-report', (req, res) => {
  try {
    selectRequestWorkspace(req);
    const audit = dataStore.createMarginAudit();
    if (req.query.format === 'crisp' || req.query.crisp === 'true') {
      return res.json(audit.toCrispExecutiveSummary());
    }
    const report = audit.toDetailedReport();
    res.json({
      generatedAt: new Date().toISOString(),
      profile: report.profile,
      summary: {
        totalMonthlyRevenue: report.summary.totalMonthlyRevenue,
        totalMonthlyProfit: report.summary.totalMonthlyProfit,
        totalMonthlyLeakage: report.summary.totalMonthlyLeakage,
        annualizedLeakage: report.summary.annualLeakage,
        potentialAnnualProfitGain: report.summary.annualLeakage
      },
      auditedDishes: report.auditedDishes,
      executiveSummary: audit.toCrispExecutiveSummary()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7b. Crisp Executive Overview (Clean, High-Signal Intelligence)
app.get('/api/crisp-overview', (req, res) => {
  try {
    selectRequestWorkspace(req);
    const audit = dataStore.createMarginAudit();
    res.json({
      executiveAudit: audit.toCrispExecutiveSummary(),
      crispInventory: dataStore.getCrispInventorySummary(),
      crispRecipes: dataStore.getCrispRecipesSummary()
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

app.post('/api/feedback', requireAuth, (req, res) => {
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
    if (req.user || req.query.demo !== '1') return res.status(403).json({ error: 'Demo reset requires ?demo=1 and no signed-in account' });
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
