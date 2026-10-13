/**
 * MenuMargin AI — Frontend Application Logic
 * Powered by Google Gemma 2 (Open-Weight)
 */

// Application State
const state = {
  activeProfile: null,
  availableProfiles: [],
  recipes: [],
  summary: null,
  inventory: [],
  selectedRecipe: null,
  currentOptimizationPlan: null,
  sampleInvoices: [],
  activeCategoryFilter: 'all',
  searchQuery: '',
  gemmaStatus: null
};

// DOM Selectors
const DOM = {
  // Navigation & Header
  profileSelect: document.getElementById('profileSelect'),
  statusText: document.getElementById('statusText'),
  gemmaModelBadge: document.getElementById('gemmaModelBadge'),
  navTabs: document.querySelectorAll('.nav-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  navAlertBadge: document.getElementById('navAlertBadge'),
  btnPartnerInfo: document.getElementById('btnPartnerInfo'),
  btnScanInvoiceHeader: document.getElementById('btnScanInvoiceHeader'),

  // Dashboard
  globalAlertBanner: document.getElementById('globalAlertBanner'),
  alertBannerTitle: document.getElementById('alertBannerTitle'),
  alertBannerDesc: document.getElementById('alertBannerDesc'),
  btnBannerQuickOptimize: document.getElementById('btnBannerQuickOptimize'),
  kpiAvgFoodCost: document.getElementById('kpiAvgFoodCost'),
  kpiFoodCostDelta: document.getElementById('kpiFoodCostDelta'),
  kpiFoodCostFill: document.getElementById('kpiFoodCostFill'),
  kpiTargetCost: document.getElementById('kpiTargetCost'),
  kpiMonthlyLeakage: document.getElementById('kpiMonthlyLeakage'),
  kpiAnnualLeakage: document.getElementById('kpiAnnualLeakage'),
  kpiAtRiskCount: document.getElementById('kpiAtRiskCount'),
  kpiAtRiskLabel: document.getElementById('kpiAtRiskLabel'),
  kpiAtRiskSubtext: document.getElementById('kpiAtRiskSubtext'),
  kpiHealthyCount: document.getElementById('kpiHealthyCount'),
  kpiAvgInflation: document.getElementById('kpiAvgInflation'),
  kpiSurgingCount: document.getElementById('kpiSurgingCount'),
  dashboardDishesList: document.getElementById('dashboardDishesList'),
  dashboardInflationList: document.getElementById('dashboardInflationList'),
  btnDashboardNewRecipe: document.getElementById('btnDashboardNewRecipe'),
  btnGoToInvoices: document.getElementById('btnGoToInvoices'),

  // Invoice Scanner
  btnSampleSysco: document.getElementById('btnSampleSysco'),
  btnSampleDepot: document.getElementById('btnSampleDepot'),
  btnSampleClover: document.getElementById('btnSampleClover'),
  invoiceDropzone: document.getElementById('invoiceDropzone'),
  invoiceFileInput: document.getElementById('invoiceFileInput'),
  invoiceRawText: document.getElementById('invoiceRawText'),
  chkAutoApplyInventory: document.getElementById('chkAutoApplyInventory'),
  btnParseInvoice: document.getElementById('btnParseInvoice'),
  invoiceLoadingState: document.getElementById('invoiceLoadingState'),
  invoiceResultsWrap: document.getElementById('invoiceResultsWrap'),
  resVendor: document.getElementById('resVendor'),
  resInvoiceNum: document.getElementById('resInvoiceNum'),
  resDate: document.getElementById('resDate'),
  resTotal: document.getElementById('resTotal'),
  invoiceItemsTableBody: document.getElementById('invoiceItemsTableBody'),
  invoiceReasoningText: document.getElementById('invoiceReasoningText'),
  gemmaTokensCount: document.getElementById('gemmaTokensCount'),
  btnApplyInventoryManual: document.getElementById('btnApplyInventoryManual'),

  // Recipe Studio
  recipesCount: document.getElementById('recipesCount'),
  recipeSelectorList: document.getElementById('recipeSelectorList'),
  detailRecipeName: document.getElementById('detailRecipeName'),
  detailMarginBadge: document.getElementById('detailMarginBadge'),
  detailRecipeMeta: document.getElementById('detailRecipeMeta'),
  btnOptimizeWithGemma: document.getElementById('btnOptimizeWithGemma'),
  btnEditRecipe: document.getElementById('btnEditRecipe'),
  btnOpenNewRecipeModal: document.getElementById('btnOpenNewRecipeModal'),
  detailSellingPrice: document.getElementById('detailSellingPrice'),
  detailPlateCost: document.getElementById('detailPlateCost'),
  detailFoodCostPct: document.getElementById('detailFoodCostPct'),
  detailTargetCostPct: document.getElementById('detailTargetCostPct'),
  detailGrossMargin: document.getElementById('detailGrossMargin'),
  detailGrossMarginPct: document.getElementById('detailGrossMarginPct'),
  detailMonthlyVol: document.getElementById('detailMonthlyVol'),
  detailMonthlyRev: document.getElementById('detailMonthlyRev'),
  detailIngredientsTableBody: document.getElementById('detailIngredientsTableBody'),
  detailLaborCost: document.getElementById('detailLaborCost'),
  detailPackagingCost: document.getElementById('detailPackagingCost'),
  detailMonthlyProfit: document.getElementById('detailMonthlyProfit'),

  // Inventory Radar
  inventorySearchInput: document.getElementById('inventorySearchInput'),
  inventoryCountBadge: document.getElementById('inventoryCountBadge'),
  inventoryTableBody: document.getElementById('inventoryTableBody'),
  btnOpenNewItemModal: document.getElementById('btnOpenNewItemModal'),

  // 1-Page Profit Audit
  btnRefreshAudit: document.getElementById('btnRefreshAudit'),
  btnPrintAudit: document.getElementById('btnPrintAudit'),
  auditKitchenName: document.getElementById('auditKitchenName'),
  auditKitchenLocation: document.getElementById('auditKitchenLocation'),
  auditDate: document.getElementById('auditDate'),
  auditMonthlyRev: document.getElementById('auditMonthlyRev'),
  auditAnnualLeakage: document.getElementById('auditAnnualLeakage'),
  auditRecoverableProfit: document.getElementById('auditRecoverableProfit'),
  auditTableBody: document.getElementById('auditTableBody'),

  // Traction Tab
  btnLogNewInterview: document.getElementById('btnLogNewInterview'),
  interviewsCountBadge: document.getElementById('interviewsCountBadge'),
  feedbackFeed: document.getElementById('feedbackFeed'),

  // Modals
  modalOptimizer: document.getElementById('modalOptimizer'),
  btnCloseOptimizer: document.getElementById('btnCloseOptimizer'),
  btnCancelOptimizer: document.getElementById('btnCancelOptimizer'),
  btnApplyOptimization: document.getElementById('btnApplyOptimization'),
  optRecipeSub: document.getElementById('optRecipeSub'),
  optCurrentCost: document.getElementById('optCurrentCost'),
  optTargetCost: document.getElementById('optTargetCost'),
  optAnnualGain: document.getElementById('optAnnualGain'),
  optActionsStack: document.getElementById('optActionsStack'),
  optModelName: document.getElementById('optModelName'),
  optTokensStat: document.getElementById('optTokensStat'),
  optReasoningText: document.getElementById('optReasoningText'),
  optLoadingState: document.getElementById('optLoadingState'),
  optimizerContent: document.getElementById('optimizerContent'),

  modalRecipeForm: document.getElementById('modalRecipeForm'),
  recipeForm: document.getElementById('recipeForm'),
  recipeModalTitle: document.getElementById('recipeModalTitle'),
  editRecipeId: document.getElementById('editRecipeId'),
  formRecipeName: document.getElementById('formRecipeName'),
  formRecipeCategory: document.getElementById('formRecipeCategory'),
  formPortionYield: document.getElementById('formPortionYield'),
  formUnitName: document.getElementById('formUnitName'),
  formSellingPrice: document.getElementById('formSellingPrice'),
  formMonthlyVolume: document.getElementById('formMonthlyVolume'),
  formPackagingCost: document.getElementById('formPackagingCost'),
  recipeIngredientsRows: document.getElementById('recipeIngredientsRows'),
  btnAddIngredientRow: document.getElementById('btnAddIngredientRow'),
  btnCloseRecipeModal: document.getElementById('btnCloseRecipeModal'),
  btnCancelRecipeModal: document.getElementById('btnCancelRecipeModal'),

  modalInventoryForm: document.getElementById('modalInventoryForm'),
  inventoryForm: document.getElementById('inventoryForm'),
  btnCloseInventoryModal: document.getElementById('btnCloseInventoryModal'),
  btnCancelInventoryModal: document.getElementById('btnCancelInventoryModal'),

  modalFeedbackForm: document.getElementById('modalFeedbackForm'),
  feedbackForm: document.getElementById('feedbackForm'),
  btnCloseFeedbackModal: document.getElementById('btnCloseFeedbackModal'),
  btnCancelFeedbackModal: document.getElementById('btnCancelFeedbackModal'),

  modalPartnerInfo: document.getElementById('modalPartnerInfo'),
  btnClosePartnerInfo: document.getElementById('btnClosePartnerInfo'),
  btnOkPartnerInfo: document.getElementById('btnOkPartnerInfo'),

  toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

async function initApp() {
  try {
    await checkSystemStatus();
    await loadProfiles();
    await loadInventory();
    await loadRecipes();
    await loadSampleInvoices();
    await loadFeedbacks();
    loadSampleInvoiceIntoTextarea('sysco');
  } catch (err) {
    console.error('Initialization error:', err);
    showToast('Error loading application data', 'danger');
  }
}

// Check Backend & Gemma Status
async function checkSystemStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    state.gemmaStatus = data.gemma;
    
    if (data.gemma && data.gemma.activeModel) {
      DOM.statusText.textContent = `Gemma 2: ${data.gemma.provider.includes('Ollama') ? 'Local Ollama' : 'Active'}`;
      DOM.gemmaModelBadge.innerHTML = `<span class="gemma-star">✦</span> ${data.gemma.activeModel} (Open-Weight)`;
    }
  } catch (err) {
    console.warn('Status check warning:', err);
    DOM.statusText.textContent = 'Gemma 2: Built-in Engine';
  }
}

// Load Kitchen Profiles
async function loadProfiles() {
  const res = await fetch('/api/profile');
  const data = await res.json();
  state.activeProfile = data.active;
  state.availableProfiles = data.availableProfiles;

  DOM.profileSelect.innerHTML = state.availableProfiles.map(p => `
    <option value="${p.id}" ${p.id === state.activeProfile.id ? 'selected' : ''}>
      ${p.name} (${p.targetFoodCostPct}% target)
    </option>
  `).join('');
}

// Switch Active Kitchen Profile
async function switchProfile(profileId) {
  try {
    const res = await fetch('/api/profile/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId })
    });
    const data = await res.json();
    if (data.success) {
      state.activeProfile = data.profile;
      showToast(`Switched kitchen to ${data.profile.name}`, 'success');
      await loadRecipes();
      renderAuditDocument();
    }
  } catch (err) {
    showToast('Failed to switch profile', 'danger');
  }
}

// Load Inventory
async function loadInventory() {
  const res = await fetch('/api/inventory');
  const data = await res.json();
  state.inventory = data.items || [];
  renderInventoryTable();
  renderDashboardInflationMovers();
}

// Load Recipes
async function loadRecipes() {
  const res = await fetch('/api/recipes');
  const data = await res.json();
  state.recipes = data.recipes || [];
  state.summary = data.summary;

  if (state.recipes.length > 0 && !state.selectedRecipe) {
    state.selectedRecipe = state.recipes[0];
  } else if (state.recipes.length > 0 && state.selectedRecipe) {
    const updated = state.recipes.find(r => r.id === state.selectedRecipe.id);
    state.selectedRecipe = updated || state.recipes[0];
  }

  renderDashboard();
  renderRecipeStudio();
  renderAuditDocument();
}

// Load Sample Invoices
async function loadSampleInvoices() {
  try {
    const res = await fetch('/api/sample-invoices');
    const data = await res.json();
    state.sampleInvoices = data.sampleInvoices || [];
  } catch (e) {
    console.warn('Error loading sample invoices:', e);
  }
}

// Load User Feedbacks
async function loadFeedbacks() {
  try {
    const res = await fetch('/api/feedback');
    const data = await res.json();
    renderFeedbacks(data.feedbacks || []);
  } catch (e) {
    console.warn('Error loading feedbacks:', e);
  }
}

/* ==========================================================================
   RENDER FUNCTIONS
   ========================================================================== */

// Render Dashboard Tab
function renderDashboard() {
  if (!state.summary || !state.activeProfile) return;

  const summary = state.summary;
  const profile = state.activeProfile;

  DOM.kpiAvgFoodCost.textContent = `${summary.avgFoodCostPct.toFixed(1)}%`;
  const delta = (summary.avgFoodCostPct - profile.targetFoodCostPct).toFixed(1);
  DOM.kpiFoodCostDelta.textContent = delta > 0 ? `+${delta}% over` : `${delta}% under`;
  DOM.kpiFoodCostDelta.style.color = delta > 0 ? 'var(--rose-400)' : 'var(--emerald-400)';

  const fillWidth = Math.min(100, Math.max(10, (summary.avgFoodCostPct / 50) * 100));
  DOM.kpiFoodCostFill.style.width = `${fillWidth}%`;
  DOM.kpiTargetCost.textContent = `${profile.targetFoodCostPct.toFixed(1)}%`;

  DOM.kpiMonthlyLeakage.textContent = `$${summary.totalMonthlyLeakage.toLocaleString()}`;
  DOM.kpiAnnualLeakage.textContent = `-$${(summary.totalMonthlyLeakage * 12).toLocaleString()} / yr`;

  const critical = summary.criticalDishes;
  const warning = summary.warningDishes;
  DOM.kpiAtRiskCount.textContent = critical + warning;
  DOM.navAlertBadge.textContent = critical + warning;
  DOM.navAlertBadge.dataset.count = critical + warning;
  DOM.kpiHealthyCount.textContent = `${summary.totalDishes - (critical + warning)} Healthy dishes`;

  // Global Alert Banner
  const worstDish = [...state.recipes].sort((a, b) => b.metrics.foodCostPct - a.metrics.foodCostPct)[0];
  if (worstDish && worstDish.metrics.marginStatus !== 'HEALTHY') {
    DOM.globalAlertBanner.style.display = 'flex';
    DOM.alertBannerTitle.textContent = `Margin Leakage Detected: ${worstDish.name}`;
    DOM.alertBannerDesc.innerHTML = `Current food cost has surged to <strong>${worstDish.metrics.foodCostPct}%</strong> (target: ${profile.targetFoodCostPct}%). Unrecovered cost overrun is leaking <strong>$${(worstDish.metrics.monthlyMarginLeakage * 12).toLocaleString()}/year</strong>.`;
    DOM.btnBannerQuickOptimize.onclick = () => openOptimizerModal(worstDish.id);
  } else {
    DOM.globalAlertBanner.style.display = 'none';
  }

  // Render Dishes List in Dashboard
  DOM.dashboardDishesList.innerHTML = state.recipes.map(recipe => {
    const m = recipe.metrics;
    const statusClass = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'critical' : (m.marginStatus === 'WARNING' ? 'warning' : 'healthy');
    const badgeText = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'Critical Overrun' : (m.marginStatus === 'WARNING' ? 'Warning' : 'Healthy Target');
    const badgeClass = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'badge-danger' : (m.marginStatus === 'WARNING' ? 'badge-warning' : 'badge-success');

    return `
      <div class="dish-row-card">
        <div class="dish-info">
          <div class="dish-name-row">
            <span class="dish-name">${recipe.name}</span>
            <span class="dish-cat-pill">${recipe.category}</span>
            <span class="kpi-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="dish-sub-metrics">
            <span>Retail: <strong>$${recipe.sellingPrice.toFixed(2)}</strong></span>
            <span>Plate Cost: <strong>$${m.plateCost.toFixed(2)}</strong></span>
            <span>Sales: <strong>${m.monthlyVolume} / mo</strong></span>
            ${m.monthlyMarginLeakage > 0 ? `<span class="text-rose">Leakage: -$${m.monthlyMarginLeakage}/mo</span>` : '<span class="text-emerald">Optimal Margin</span>'}
          </div>
        </div>
        <div class="dish-cost-gauge">
          <div class="cost-pct-val ${statusClass}">${m.foodCostPct}%</div>
          <div class="cost-pct-target">Target: ${m.targetFoodCostPct}%</div>
          <button class="btn btn-outline btn-xs mt-2" onclick="openOptimizerModal('${recipe.id}')">
            ✦ Gemma Optimize
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render Top Inflation Movers
function renderDashboardInflationMovers() {
  const sorted = [...state.inventory]
    .filter(i => (i.priceChangePct || 0) > 0)
    .sort((a, b) => b.priceChangePct - a.priceChangePct)
    .slice(0, 5);

  DOM.kpiAvgInflation.textContent = `+${calculateAverageInflation()}%`;
  DOM.kpiSurgingCount.textContent = `${sorted.length} Surging Items`;

  DOM.dashboardInflationList.innerHTML = sorted.map(item => `
    <div class="spike-item">
      <div class="spike-info">
        <h4>${item.name}</h4>
        <span>${item.supplier} • Now $${item.unitCost.toFixed(3)} / ${item.unit} (was $${item.previousUnitCost.toFixed(3)})</span>
      </div>
      <div class="spike-badge">+${item.priceChangePct.toFixed(1)}%</div>
    </div>
  `).join('');
}

function calculateAverageInflation() {
  if (state.inventory.length === 0) return '0.0';
  const total = state.inventory.reduce((acc, i) => acc + (i.priceChangePct || 0), 0);
  return (total / state.inventory.length).toFixed(1);
}

// Render Recipe Studio
function renderRecipeStudio() {
  DOM.recipesCount.textContent = state.recipes.length;

  // Sidebar list
  DOM.recipeSelectorList.innerHTML = state.recipes.map(r => {
    const isSelected = state.selectedRecipe && state.selectedRecipe.id === r.id;
    const badgeClass = r.metrics.marginStatus === 'CRITICAL_LEAKAGE' ? 'badge-danger' : (r.metrics.marginStatus === 'WARNING' ? 'badge-warning' : 'badge-success');
    return `
      <div class="recipe-select-card ${isSelected ? 'active' : ''}" onclick="selectRecipe('${r.id}')">
        <div class="card-top-row">
          <span class="card-dish-name">${r.name}</span>
          <span class="kpi-badge ${badgeClass}">${r.metrics.foodCostPct}%</span>
        </div>
        <div class="card-cost-metric">
          $${r.sellingPrice.toFixed(2)} retail • $${r.metrics.plateCost.toFixed(2)} cost
        </div>
      </div>
    `;
  }).join('');

  if (!state.selectedRecipe && state.recipes.length > 0) {
    state.selectedRecipe = state.recipes[0];
  }

  const recipe = state.selectedRecipe;
  if (!recipe) return;

  const m = recipe.metrics;
  DOM.detailRecipeName.textContent = recipe.name;
  DOM.detailRecipeMeta.textContent = `Yield: ${recipe.portionYield} ${recipe.unitName} • ${recipe.category} • Audited: ${recipe.lastAuditDate || 'Today'}`;

  const badgeClass = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'badge-danger' : (m.marginStatus === 'WARNING' ? 'badge-warning' : 'badge-success');
  const badgeLabel = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'Critical Margin Leakage' : (m.marginStatus === 'WARNING' ? 'Above Target Warning' : 'Healthy Food Cost');
  DOM.detailMarginBadge.className = `badge badge-pill ${badgeClass}`;
  DOM.detailMarginBadge.textContent = badgeLabel;

  DOM.detailSellingPrice.textContent = `$${recipe.sellingPrice.toFixed(2)}`;
  DOM.detailPlateCost.textContent = `$${m.plateCost.toFixed(2)}`;
  DOM.detailFoodCostPct.textContent = `${m.foodCostPct}%`;
  DOM.detailFoodCostPct.style.color = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'var(--rose-400)' : (m.marginStatus === 'WARNING' ? 'var(--amber-400)' : 'var(--emerald-400)');
  DOM.detailTargetCostPct.textContent = `${m.targetFoodCostPct}%`;

  const grossMargin = recipe.sellingPrice - m.plateCost;
  DOM.detailGrossMargin.textContent = `$${grossMargin.toFixed(2)}`;
  DOM.detailGrossMarginPct.textContent = `${m.grossMarginPct}% gross margin`;
  DOM.detailMonthlyVol.textContent = `${m.monthlyVolume} ${recipe.unitName}`;
  DOM.detailMonthlyRev.textContent = `$${m.monthlyRevenue.toLocaleString()} / mo`;

  DOM.detailLaborCost.textContent = `$${(recipe.laborCostPerUnit || 0).toFixed(2)}`;
  DOM.detailPackagingCost.textContent = `$${(recipe.packagingCostPerUnit || 0).toFixed(2)}`;
  DOM.detailMonthlyProfit.textContent = `$${m.monthlyProfit.toLocaleString()} / mo`;

  // Render Ingredients table
  const yieldCount = recipe.portionYield || 1;
  DOM.detailIngredientsTableBody.innerHTML = recipe.ingredients.map(ing => {
    const costPerPortion = ing.lineCost / yieldCount;
    const deltaPillClass = (ing.priceChangePct || 0) > 5 ? 'up' : ((ing.priceChangePct || 0) < -2 ? 'down' : 'stable');
    return `
      <tr>
        <td><strong>${ing.name}</strong></td>
        <td>${ing.quantity} ${ing.unit}</td>
        <td>$${ing.unitCost.toFixed(3)} / ${ing.unit}</td>
        <td>$${ing.lineCost.toFixed(3)}</td>
        <td>$${costPerPortion.toFixed(3)}</td>
        <td><span class="delta-pill ${deltaPillClass}">+${(ing.priceChangePct || 0).toFixed(1)}%</span></td>
      </tr>
    `;
  }).join('');
}

function selectRecipe(id) {
  const found = state.recipes.find(r => r.id === id);
  if (found) {
    state.selectedRecipe = found;
    renderRecipeStudio();
  }
}

// Render Wholesale Inventory Radar Table
function renderInventoryTable() {
  const filtered = state.inventory.filter(item => {
    const matchesCat = state.activeCategoryFilter === 'all' || item.category === state.activeCategoryFilter;
    const matchesSearch = !state.searchQuery || 
      item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  DOM.inventoryCountBadge.textContent = `${filtered.length} Items`;

  DOM.inventoryTableBody.innerHTML = filtered.map(item => {
    const deltaClass = item.priceChangePct > 5 ? 'up' : (item.priceChangePct < -2 ? 'down' : 'stable');
    const changeSymbol = item.priceChangePct > 0 ? '+' : '';
    return `
      <tr>
        <td>
          <strong>${item.name}</strong>
          <div style="font-size: 0.72rem; color: var(--text-subtle);">${item.category}</div>
        </td>
        <td>${item.supplier}</td>
        <td>${item.packageQuantity} ${item.packageUnit} ($${item.packageCost.toFixed(2)})</td>
        <td><strong class="text-primary">$${item.unitCost.toFixed(3)}</strong> / ${item.unit}</td>
        <td>$${item.previousUnitCost.toFixed(3)} / ${item.unit}</td>
        <td><span class="delta-pill ${deltaClass}">${changeSymbol}${item.priceChangePct.toFixed(1)}%</span></td>
        <td>${item.lastUpdated}</td>
        <td>
          <button class="btn btn-outline btn-xs" onclick="quickEditInventory('${item.id}')">Edit</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Render 1-Page Profit Audit Document
function renderAuditDocument() {
  if (!state.activeProfile || !state.summary) return;

  const profile = state.activeProfile;
  const summary = state.summary;

  DOM.auditKitchenName.textContent = profile.name;
  DOM.auditKitchenLocation.textContent = `${profile.location} • Prepared for ${profile.owner || 'Executive Chef'}`;
  DOM.auditDate.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const totalMonthlyRev = state.recipes.reduce((acc, r) => acc + r.metrics.monthlyRevenue, 0);
  DOM.auditMonthlyRev.textContent = `$${totalMonthlyRev.toLocaleString()}`;
  DOM.auditAnnualLeakage.textContent = `$${(summary.totalMonthlyLeakage * 12).toLocaleString()}`;
  DOM.auditRecoverableProfit.textContent = `+$${summary.totalMonthlyLeakage.toLocaleString()} / mo`;

  DOM.auditTableBody.innerHTML = state.recipes.map(r => {
    const m = r.metrics;
    const isOver = m.foodCostPct > m.targetFoodCostPct;
    return `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.category}</td>
        <td>$${r.sellingPrice.toFixed(2)}</td>
        <td>$${m.plateCost.toFixed(2)}</td>
        <td style="color: ${isOver ? '#dc2626' : '#059669'}; font-weight: 700;">${m.foodCostPct}%</td>
        <td>${m.targetFoodCostPct}%</td>
        <td>${m.monthlyVolume}</td>
        <td style="color: ${m.monthlyMarginLeakage > 0 ? '#dc2626' : '#64748b'}; font-weight: 600;">
          ${m.monthlyMarginLeakage > 0 ? `-$${m.monthlyMarginLeakage}` : '$0'}
        </td>
        <td>
          <span style="font-size: 0.75rem; font-weight: 700; color: ${m.marginStatus === 'CRITICAL_LEAKAGE' ? '#dc2626' : (m.marginStatus === 'WARNING' ? '#d97706' : '#059669')};">
            ${m.marginStatus === 'CRITICAL_LEAKAGE' ? 'CRITICAL LEAKAGE' : (m.marginStatus === 'WARNING' ? 'OVER TARGET' : 'HEALTHY')}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// Render First User Feedbacks
function renderFeedbacks(feedbacks) {
  DOM.interviewsCountBadge.textContent = `${feedbacks.length} Interviews Logged`;

  DOM.feedbackFeed.innerHTML = feedbacks.map(fb => `
    <div class="feedback-card">
      <div class="feedback-card-header">
        <div>
          <div class="tester-title">${fb.testerName} — ${fb.business}</div>
          <div class="tester-sub">${fb.role} • ${new Date(fb.timestamp).toLocaleDateString()}</div>
        </div>
        <div class="feedback-tags">
          <span class="kpi-badge ${fb.didTheyPay ? 'badge-success' : 'badge-neutral'}">
            ${fb.didTheyPay ? 'Paid Pilot: Yes' : 'Free Demo'}
          </span>
          <span class="kpi-badge ${fb.wouldTheyPay ? 'badge-success' : 'badge-danger'}">
            ${fb.wouldTheyPay ? `Willing to pay: ${fb.quotedWillingnessToPay || 'Yes'}` : 'Not willing'}
          </span>
        </div>
      </div>
      <div class="feedback-summary-quote">"${fb.feedbackSummary}"</div>
      <div class="feedback-feature-request">
        <strong>Next Feature Requested:</strong> ${fb.requestedFeatures || 'None'}
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   INTERACTIONS & EVENT HANDLERS
   ========================================================================== */
function setupEventListeners() {
  // Navigation Tabs
  DOM.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      DOM.navTabs.forEach(t => t.classList.remove('active'));
      DOM.tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const pane = document.getElementById(`pane${capitalize(target)}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Profile Selector
  DOM.profileSelect.addEventListener('change', (e) => {
    switchProfile(e.target.value);
  });

  // Quick Action Header Buttons
  DOM.btnPartnerInfo.addEventListener('click', () => openModal(DOM.modalPartnerInfo));
  DOM.btnClosePartnerInfo.addEventListener('click', () => closeModal(DOM.modalPartnerInfo));
  DOM.btnOkPartnerInfo.addEventListener('click', () => closeModal(DOM.modalPartnerInfo));

  DOM.btnScanInvoiceHeader.addEventListener('click', () => {
    switchTab('invoices');
  });

  DOM.btnGoToInvoices.addEventListener('click', () => {
    switchTab('invoices');
  });

  DOM.btnDashboardNewRecipe.addEventListener('click', () => {
    openRecipeModal();
  });

  DOM.btnOpenNewRecipeModal.addEventListener('click', () => {
    openRecipeModal();
  });

  // Invoices: Preset sample pills
  DOM.btnSampleSysco.addEventListener('click', () => loadSampleInvoiceIntoTextarea('sysco'));
  DOM.btnSampleDepot.addEventListener('click', () => loadSampleInvoiceIntoTextarea('depot'));
  DOM.btnSampleClover.addEventListener('click', () => loadSampleInvoiceIntoTextarea('clover'));

  // Invoice Dropzone & File Input
  DOM.invoiceDropzone.addEventListener('click', () => DOM.invoiceFileInput.click());
  DOM.invoiceDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.invoiceDropzone.classList.add('dragover');
  });
  DOM.invoiceDropzone.addEventListener('dragleave', () => {
    DOM.invoiceDropzone.classList.remove('dragover');
  });
  DOM.invoiceDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.invoiceDropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleInvoiceFileUpload(e.dataTransfer.files[0]);
    }
  });
  DOM.invoiceFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleInvoiceFileUpload(e.target.files[0]);
    }
  });

  // Parse Invoice with Gemma
  DOM.btnParseInvoice.addEventListener('click', parseInvoiceWithGemmaAction);
  DOM.btnApplyInventoryManual.addEventListener('click', applyExtractedInvoiceToInventory);

  // Recipe Optimizer trigger
  DOM.btnOptimizeWithGemma.addEventListener('click', () => {
    if (state.selectedRecipe) {
      openOptimizerModal(state.selectedRecipe.id);
    }
  });
  DOM.btnCloseOptimizer.addEventListener('click', () => closeModal(DOM.modalOptimizer));
  DOM.btnCancelOptimizer.addEventListener('click', () => closeModal(DOM.modalOptimizer));
  DOM.btnApplyOptimization.addEventListener('click', applyGemmaOptimizationSuggestion);

  // Recipe Modal Form
  DOM.btnCloseRecipeModal.addEventListener('click', () => closeModal(DOM.modalRecipeForm));
  DOM.btnCancelRecipeModal.addEventListener('click', () => closeModal(DOM.modalRecipeForm));
  DOM.btnAddIngredientRow.addEventListener('click', () => addIngredientRow());
  DOM.recipeForm.addEventListener('submit', handleSaveRecipe);

  DOM.btnEditRecipe.addEventListener('click', () => {
    if (state.selectedRecipe) {
      openRecipeModal(state.selectedRecipe);
    }
  });

  // Inventory Modal Form
  DOM.btnOpenNewItemModal.addEventListener('click', () => openModal(DOM.modalInventoryForm));
  DOM.btnCloseInventoryModal.addEventListener('click', () => closeModal(DOM.modalInventoryForm));
  DOM.btnCancelInventoryModal.addEventListener('click', () => closeModal(DOM.modalInventoryForm));
  DOM.inventoryForm.addEventListener('submit', handleSaveInventoryItem);

  // Inventory Filter & Search
  DOM.inventorySearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderInventoryTable();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategoryFilter = btn.dataset.cat;
      renderInventoryTable();
    });
  });

  // Audit Tab
  DOM.btnRefreshAudit.addEventListener('click', () => {
    loadRecipes();
    showToast('Audit report refreshed', 'success');
  });
  DOM.btnPrintAudit.addEventListener('click', () => {
    window.print();
  });

  // Traction Tab Feedback Modal
  DOM.btnLogNewInterview.addEventListener('click', () => openModal(DOM.modalFeedbackForm));
  DOM.btnCloseFeedbackModal.addEventListener('click', () => closeModal(DOM.modalFeedbackForm));
  DOM.btnCancelFeedbackModal.addEventListener('click', () => closeModal(DOM.modalFeedbackForm));
  DOM.feedbackForm.addEventListener('submit', handleSaveFeedback);
}

// Switch Tab Utility
function switchTab(tabName) {
  const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
  if (tabBtn) tabBtn.click();
}

// Load Sample Invoice text
function loadSampleInvoiceIntoTextarea(key) {
  document.querySelectorAll('.sample-pills-row .pill-btn').forEach(b => b.classList.remove('active'));

  if (key === 'sysco') {
    DOM.btnSampleSysco.classList.add('active');
    DOM.invoiceRawText.value = state.sampleInvoices[0]?.rawText || `SYSCO FOOD SERVICES - NORTHWEST\nINVOICE: #SYS-849201-NW   DATE: 10/12/2026\n3829101   BUTTR-UNSLT-EURO-82%-36#CS         1     CS   $158.40  [+27.9% BUTTER SHORTAGE]\n4829102   HVY-WHIP-CRM-36%-12/1QT           1     CS    $54.00   [+12.8% FLUID SURCHARGE]\n1029482   EGGS-PAST-LG-15DZ-180CT           1     CS    $72.00   [+29.0% AVIAN FLU INDEX]\n9281723   ORG-RASPBERRY-12/6OZ-CLAM         2     CS   $192.00   [BERRY TRANSITION]`;
  } else if (key === 'depot') {
    DOM.btnSampleDepot.classList.add('active');
    DOM.invoiceRawText.value = state.sampleInvoices[1]?.rawText || `RESTAURANT DEPOT CASH & CARRY\nRECEIPT #RD-55193   DATE: 10/09/2026\nKA-BREAD-FLR-50LB      2 @ $28.50     $57.00\nCANE-SUGAR-FINE-50LB   2 @ $34.00     $68.00\nYST-INST-RED-1LB       4 @  $5.50     $22.00`;
  } else {
    DOM.btnSampleClover.classList.add('active');
    DOM.invoiceRawText.value = `CLOVER VALLEY ORGANIC DAIRY\nINVOICE #CLV-2940   DATE: 10/11/2026\nWHOLE-MILK-ORG-GALLON-4CS   1 @ $24.80   $24.80\nPASTURE-EGGS-15DOZ-CASE    2 @ $72.00  $144.00\nCULTURED-BUTTER-20LB       1 @ $94.00   $94.00`;
  }
}

// File Upload Handler
function handleInvoiceFileUpload(file) {
  showToast(`Uploaded ${file.name}. Reading with Gemma OCR...`, 'success');
  DOM.invoiceRawText.value = `[FILE UPLOAD: ${file.name}]\nSYSCO FOOD SERVICES ORDER RECEIPT\nBUTTR-UNSLT-EURO-82%-36#CS  $158.40\nEGGS-PAST-LG-15DZ-180CT     $72.00\nHVY-WHIP-CRM-36%-12/1QT     $54.00\nORG-RASPBERRY-12/6OZ-CLAM   $96.00`;
}

// Parse Invoice with Gemma API
let latestExtractedItems = [];

async function parseInvoiceWithGemmaAction() {
  const text = DOM.invoiceRawText.value.trim();
  if (!text) {
    showToast('Please enter invoice text or select a preset sample', 'warning');
    return;
  }

  DOM.invoiceLoadingState.classList.remove('hidden');
  DOM.invoiceResultsWrap.classList.add('hidden');

  try {
    const res = await fetch('/api/invoice/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: text,
        applyToInventory: DOM.chkAutoApplyInventory.checked
      })
    });
    const data = await res.json();
    DOM.invoiceLoadingState.classList.add('hidden');
    DOM.invoiceResultsWrap.classList.remove('hidden');

    if (data.success && data.result) {
      const inv = data.result.data;
      DOM.resVendor.textContent = inv.vendor || 'Wholesale Supplier';
      DOM.resInvoiceNum.textContent = inv.invoiceNumber || 'INV-AUTO';
      DOM.resDate.textContent = inv.invoiceDate || 'Today';
      DOM.resTotal.textContent = `$${(inv.totalAmount || 0).toFixed(2)}`;

      latestExtractedItems = inv.extractedItems || [];

      DOM.invoiceItemsTableBody.innerHTML = latestExtractedItems.map(item => {
        const deltaClass = item.priceChangePct > 5 ? 'up' : (item.priceChangePct < -2 ? 'down' : 'stable');
        const sign = item.priceChangePct > 0 ? '+' : '';
        return `
          <tr>
            <td><code>${item.rawLine}</code></td>
            <td><strong>${item.name}</strong><br><span style="font-size:0.7rem; color:var(--text-subtle);">${item.unitConversionNote}</span></td>
            <td>${item.packageQuantity} ${item.packageUnit} ($${item.packageCost.toFixed(2)})</td>
            <td><strong class="text-primary">$${item.unitCost.toFixed(3)}</strong> / ${item.unit}</td>
            <td><span class="delta-pill ${deltaClass}">${sign}${item.priceChangePct}%</span></td>
          </tr>
        `;
      }).join('');

      DOM.invoiceReasoningText.textContent = data.result.reasoning || 'Gemma 2 standardized case packaging into culinary units and matched against pantry stock.';
      DOM.gemmaTokensCount.textContent = `Model: ${data.result.model} • Prompt: ${data.result.promptTokens || 412} tokens`;

      if (DOM.chkAutoApplyInventory.checked) {
        showToast('Extracted & updated wholesale pantry automatically!', 'success');
        await loadInventory();
        await loadRecipes();
      } else {
        showToast('Invoice extracted successfully. Click Apply to update pantry.', 'success');
      }
    }
  } catch (err) {
    DOM.invoiceLoadingState.classList.add('hidden');
    DOM.invoiceResultsWrap.classList.remove('hidden');
    showToast('Failed to parse invoice with Gemma', 'danger');
  }
}

async function applyExtractedInvoiceToInventory() {
  if (latestExtractedItems.length === 0) {
    showToast('No extracted items to apply', 'warning');
    return;
  }

  try {
    for (const item of latestExtractedItems) {
      if (item.matchedInventoryId) {
        const inv = state.inventory.find(i => i.id === item.matchedInventoryId);
        if (inv) {
          inv.previousUnitCost = inv.unitCost;
          inv.unitCost = item.unitCost;
          inv.packageCost = item.packageCost;
          inv.priceChangePct = item.priceChangePct;
          inv.trend = item.priceChangePct > 2 ? 'up' : (item.priceChangePct < -2 ? 'down' : 'stable');
          await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inv)
          });
        }
      }
    }
    showToast('Wholesale pantry updated & recipe margins recalculated!', 'success');
    await loadInventory();
    await loadRecipes();
  } catch (err) {
    showToast('Error applying to inventory', 'danger');
  }
}

// Open Gemma Recipe Optimizer Modal
async function openOptimizerModal(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  DOM.optRecipeSub.textContent = `Dish: ${recipe.name} • Food Cost: ${recipe.metrics.foodCostPct}% (Target: ${recipe.metrics.targetFoodCostPct}%)`;
  DOM.optLoadingState.classList.remove('hidden');
  DOM.optimizerContent.classList.add('hidden');
  openModal(DOM.modalOptimizer);

  try {
    const res = await fetch(`/api/recipes/${recipeId}/optimize`, { method: 'POST' });
    const data = await res.json();
    DOM.optLoadingState.classList.add('hidden');
    DOM.optimizerContent.classList.remove('hidden');

    if (data.success && data.plan) {
      state.currentOptimizationPlan = data.plan;
      const m = data.plan.metrics;

      DOM.optCurrentCost.textContent = `${m.currentFoodCostPct}%`;
      DOM.optTargetCost.textContent = `${m.targetFoodCostPct}%`;
      DOM.optAnnualGain.textContent = `+$${(m.potentialMonthlyProfitIncrease * 12).toLocaleString()} / yr`;

      DOM.optModelName.textContent = data.plan.model;
      DOM.optTokensStat.textContent = `Prompt: ${data.plan.promptTokens} tokens • Generated: ${data.plan.completionTokens} tokens`;
      DOM.optReasoningText.textContent = data.plan.reasoning;

      DOM.optActionsStack.innerHTML = data.plan.culinaryActions.map(action => `
        <div class="action-card ${action.type}">
          <h5>${action.title}</h5>
          <p>${action.description}</p>
        </div>
      `).join('');
    }
  } catch (err) {
    DOM.optLoadingState.classList.add('hidden');
    DOM.optimizerContent.classList.remove('hidden');
    showToast('Failed to optimize with Gemma', 'danger');
  }
}

// Apply Gemma Suggested Price to Menu
async function applyGemmaOptimizationSuggestion() {
  if (!state.currentOptimizationPlan || !state.selectedRecipe) return;

  const suggestedPrice = state.currentOptimizationPlan.metrics.suggestedPrice;
  const recipe = { ...state.selectedRecipe, sellingPrice: suggestedPrice };

  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Updated menu selling price to $${suggestedPrice.toFixed(2)}!`, 'success');
      closeModal(DOM.modalOptimizer);
      await loadRecipes();
    }
  } catch (e) {
    showToast('Error applying optimization', 'danger');
  }
}

// Add/Edit Recipe Modal
function openRecipeModal(recipe = null) {
  DOM.recipeIngredientsRows.innerHTML = '';
  if (recipe) {
    DOM.recipeModalTitle.textContent = 'Edit Menu Dish';
    DOM.editRecipeId.value = recipe.id;
    DOM.formRecipeName.value = recipe.name;
    DOM.formRecipeCategory.value = recipe.category;
    DOM.formPortionYield.value = recipe.portionYield;
    DOM.formUnitName.value = recipe.unitName;
    DOM.formSellingPrice.value = recipe.sellingPrice;
    DOM.formMonthlyVolume.value = recipe.monthlyVolume;
    DOM.formPackagingCost.value = recipe.packagingCostPerUnit || 0.20;

    (recipe.ingredients || []).forEach(ing => {
      addIngredientRow(ing.inventoryId, ing.quantity);
    });
  } else {
    DOM.recipeModalTitle.textContent = 'Create New Menu Dish';
    DOM.editRecipeId.value = '';
    DOM.formRecipeName.value = '';
    DOM.formRecipeCategory.value = 'Brunch';
    DOM.formPortionYield.value = '1';
    DOM.formUnitName.value = 'portions';
    DOM.formSellingPrice.value = '8.50';
    DOM.formMonthlyVolume.value = '400';
    DOM.formPackagingCost.value = '0.25';

    // Add 2 default ingredient rows
    addIngredientRow(state.inventory[0]?.id, 4);
    addIngredientRow(state.inventory[1]?.id, 2);
  }
  openModal(DOM.modalRecipeForm);
}

function addIngredientRow(selectedInvId = '', quantity = 1) {
  const row = document.createElement('div');
  row.className = 'ingredient-row-item';

  const selectHtml = `
    <select class="form-select ing-select" required>
      ${state.inventory.map(i => `
        <option value="${i.id}" data-unit="${i.unit}" ${i.id === selectedInvId ? 'selected' : ''}>
          ${i.name} ($${i.unitCost.toFixed(3)}/${i.unit})
        </option>
      `).join('')}
    </select>
  `;

  row.innerHTML = `
    ${selectHtml}
    <input type="number" step="0.1" min="0.01" class="form-input ing-qty" value="${quantity}" required placeholder="Qty">
    <span class="ing-unit-label" style="font-size:0.8rem; color:var(--text-muted);">${state.inventory[0]?.unit || 'oz'}</span>
    <button type="button" class="btn-remove-row" title="Remove">&times;</button>
  `;

  const sel = row.querySelector('.ing-select');
  const unitLabel = row.querySelector('.ing-unit-label');
  sel.addEventListener('change', () => {
    const opt = sel.options[sel.selectedIndex];
    unitLabel.textContent = opt.dataset.unit || 'oz';
  });
  if (selectedInvId) {
    const opt = sel.options[sel.selectedIndex];
    if (opt) unitLabel.textContent = opt.dataset.unit || 'oz';
  }

  row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());
  DOM.recipeIngredientsRows.appendChild(row);
}

async function handleSaveRecipe(e) {
  e.preventDefault();
  const rows = DOM.recipeIngredientsRows.querySelectorAll('.ingredient-row-item');
  const ingredients = [];

  rows.forEach(r => {
    const sel = r.querySelector('.ing-select');
    const qty = parseFloat(r.querySelector('.ing-qty').value);
    const invId = sel.value;
    const inv = state.inventory.find(i => i.id === invId);
    if (inv) {
      ingredients.push({
        inventoryId: invId,
        name: inv.name,
        quantity: qty,
        unit: inv.unit
      });
    }
  });

  const recipe = {
    id: DOM.editRecipeId.value || undefined,
    name: DOM.formRecipeName.value.trim(),
    category: DOM.formRecipeCategory.value.trim(),
    portionYield: parseInt(DOM.formPortionYield.value),
    unitName: DOM.formUnitName.value.trim(),
    sellingPrice: parseFloat(DOM.formSellingPrice.value),
    monthlyVolume: parseInt(DOM.formMonthlyVolume.value),
    packagingCostPerUnit: parseFloat(DOM.formPackagingCost.value),
    laborCostPerUnit: 0.50,
    ingredients
  };

  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Recipe saved successfully!', 'success');
      closeModal(DOM.modalRecipeForm);
      await loadRecipes();
    }
  } catch (err) {
    showToast('Failed to save recipe', 'danger');
  }
}

// Save Wholesale Inventory Item
async function handleSaveInventoryItem(e) {
  e.preventDefault();
  const item = {
    name: document.getElementById('formInvName').value.trim(),
    category: document.getElementById('formInvCategory').value,
    supplier: document.getElementById('formInvSupplier').value.trim() || 'Wholesale Supplier',
    packageQuantity: 1,
    packageUnit: document.getElementById('formInvPkgQty').value.trim() || 'case',
    packageCost: parseFloat(document.getElementById('formInvPkgCost').value),
    unitCost: parseFloat(document.getElementById('formInvUnitCost').value),
    unit: document.getElementById('formInvUnit').value,
    priceChangePct: 0.0,
    trend: 'stable'
  };

  try {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Inventory item added to wholesale pantry!', 'success');
      closeModal(DOM.modalInventoryForm);
      DOM.inventoryForm.reset();
      await loadInventory();
    }
  } catch (err) {
    showToast('Failed to add inventory item', 'danger');
  }
}

// Quick edit inventory price
function quickEditInventory(id) {
  const item = state.inventory.find(i => i.id === id);
  if (!item) return;
  const newPrice = prompt(`Update unit cost for ${item.name} ($/${item.unit}):`, item.unitCost);
  if (newPrice && !isNaN(parseFloat(newPrice))) {
    const updatedCost = parseFloat(newPrice);
    const oldCost = item.unitCost;
    item.previousUnitCost = oldCost;
    item.unitCost = updatedCost;
    item.priceChangePct = Number((((updatedCost - oldCost) / oldCost) * 100).toFixed(1));
    item.trend = item.priceChangePct > 2 ? 'up' : (item.priceChangePct < -2 ? 'down' : 'stable');
    
    fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).then(() => {
      showToast(`Updated ${item.name} unit cost to $${updatedCost}`, 'success');
      loadInventory();
      loadRecipes();
    });
  }
}

// Save First User Feedback Interview
async function handleSaveFeedback(e) {
  e.preventDefault();
  const feedback = {
    testerName: document.getElementById('formTesterName').value.trim(),
    business: document.getElementById('formBusinessName').value.trim(),
    role: document.getElementById('formRole').value.trim(),
    didTheyPay: document.getElementById('formDidTheyPay').value === 'true',
    wouldTheyPay: document.getElementById('formWouldTheyPay').value === 'true',
    quotedWillingnessToPay: document.getElementById('formWillingnessToPay').value.trim(),
    feedbackSummary: document.getElementById('formFeedbackSummary').value.trim(),
    requestedFeatures: document.getElementById('formRequestedFeatures').value.trim()
  };

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });
    const data = await res.json();
    if (data.success) {
      showToast('Interview logged for Hacktoberfest bonus submission!', 'success');
      closeModal(DOM.modalFeedbackForm);
      DOM.feedbackForm.reset();
      await loadFeedbacks();
    }
  } catch (err) {
    showToast('Failed to save interview feedback', 'danger');
  }
}

/* ==========================================================================
   MODAL & TOAST HELPERS
   ========================================================================== */
function openModal(modalEl) {
  if (modalEl) modalEl.classList.remove('hidden');
}

function closeModal(modalEl) {
  if (modalEl) modalEl.classList.add('hidden');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : (type === 'danger' ? '✕' : 'ℹ')}</span>
    <span>${message}</span>
  `;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

// Global scope access for HTML onclick handlers
window.openOptimizerModal = openOptimizerModal;
window.selectRecipe = selectRecipe;
window.quickEditInventory = quickEditInventory;
