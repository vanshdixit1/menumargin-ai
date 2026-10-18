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
  gemmaStatus: null,
  hasAnimatedDashboard: false,
  selectedInvoiceFile: null
  ,workspaceMode: 'demo',
  user: null,
  authMode: 'register',
  authIntent: null,
  refreshCount: 0
};

function beginDataRefresh() {
  state.refreshCount += 1;
  document.documentElement.classList.add('data-refreshing');
}

function endDataRefresh() {
  state.refreshCount = Math.max(0, state.refreshCount - 1);
  if (state.refreshCount === 0) {
    document.documentElement.classList.remove('data-refreshing');
  }
}

// DOM Selectors
const DOM = {
  // Navigation & Header
  profileSelect: document.getElementById('profileSelect'),
  statusText: document.getElementById('statusText'),
  systemStatusPill: document.getElementById('systemStatusPill'),
  gemmaModelBadge: document.getElementById('gemmaModelBadge'),
  navTabs: document.querySelectorAll('.nav-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  navAlertBadge: document.getElementById('navAlertBadge'),
  btnPartnerInfo: document.getElementById('btnPartnerInfo'),
  btnScanInvoiceHeader: document.getElementById('btnScanInvoiceHeader'),
  btnNewWorkspace: document.getElementById('btnNewWorkspace'),
  btnAccount: document.getElementById('btnAccount'),
  modalAuth: document.getElementById('modalAuth'),
  authForm: document.getElementById('authForm'),
  authName: document.getElementById('authName'),
  authNameGroup: document.getElementById('authNameGroup'),
  authEmail: document.getElementById('authEmail'),
  authPassword: document.getElementById('authPassword'),
  authError: document.getElementById('authError'),
  authTitle: document.getElementById('authTitle'),
  authSubtitle: document.getElementById('authSubtitle'),
  btnCloseAuth: document.getElementById('btnCloseAuth'),
  btnToggleAuthMode: document.getElementById('btnToggleAuthMode'),
  btnSubmitAuth: document.getElementById('btnSubmitAuth'),
  btnThemeToggle: document.getElementById('btnThemeToggle'),
  workspaceWelcome: document.getElementById('workspaceWelcome'),
  btnStartWorkspace: document.getElementById('btnStartWorkspace'),
  btnOpenDemo: document.getElementById('btnOpenDemo'),
  modalWorkspaceSetup: document.getElementById('modalWorkspaceSetup'),
  workspaceSetupForm: document.getElementById('workspaceSetupForm'),
  btnCloseWorkspaceSetup: document.getElementById('btnCloseWorkspaceSetup'),
  btnCancelWorkspaceSetup: document.getElementById('btnCancelWorkspaceSetup'),
  modalWorkspaceSettings: document.getElementById('modalWorkspaceSettings'),
  workspaceSettingsForm: document.getElementById('workspaceSettingsForm'),
  btnCloseWorkspaceSettings: document.getElementById('btnCloseWorkspaceSettings'),
  btnCancelWorkspaceSettings: document.getElementById('btnCancelWorkspaceSettings'),
  btnResetWorkspace: document.getElementById('btnResetWorkspace'),
  btnLogout: document.getElementById('btnLogout'),
  settingsBusinessName: document.getElementById('settingsBusinessName'),
  settingsBusinessType: document.getElementById('settingsBusinessType'),
  settingsLocation: document.getElementById('settingsLocation'),
  settingsTarget: document.getElementById('settingsTarget'),
  workspaceBusinessName: document.getElementById('workspaceBusinessName'),
  workspaceBusinessType: document.getElementById('workspaceBusinessType'),
  workspaceLocation: document.getElementById('workspaceLocation'),
  workspaceTarget: document.getElementById('workspaceTarget'),

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
  recipeMainWorkspace: document.querySelector('.recipe-main-workspace'),
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
  btnImportInventory: document.getElementById('btnImportInventory'),
  inventoryCsvInput: document.getElementById('inventoryCsvInput'),

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
  optErrorState: document.getElementById('optErrorState'),
  optErrorMessage: document.getElementById('optErrorMessage'),
  btnRetryOptimizer: document.getElementById('btnRetryOptimizer'),
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

  commandPalette: document.getElementById('commandPalette'),
  commandPaletteInput: document.getElementById('commandPaletteInput'),
  commandPaletteResults: document.getElementById('commandPaletteResults'),
  toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

async function initApp() {
  try {
    initTheme();
    await loadAuthState();
    await checkSystemStatus();
    await loadProfiles();
    await loadInventory();
    await loadRecipes();
    await loadSampleInvoices();
    await loadFeedbacks();
    loadSampleInvoiceIntoTextarea('sysco');
    // Stagger-reveal KPI cards after data is ready
    revealKPICards();
    showWorkspaceWelcomeIfNeeded();
  } catch (err) {
    console.error('Initialization error:', err);
    showToast('Error loading application data', 'danger');
  }
}

async function loadAuthState() {
  try {
    const response = await fetch('/api/auth/me');
    const data = await readJsonResponse(response, 'Account loading');
    state.user = data.user || null;
    updateAccountButton();
  } catch (error) {
    console.warn('Account state unavailable:', error);
  }
}

function updateAccountButton() {
  if (DOM.btnAccount) DOM.btnAccount.textContent = state.user ? state.user.name : 'Sign in';
}

function openAuthModal(mode = 'register', intent = null) {
  state.authMode = mode;
  state.authIntent = intent;
  DOM.authError.classList.add('hidden');
  DOM.authForm.reset();
  DOM.authNameGroup.classList.toggle('hidden', mode === 'login');
  DOM.authTitle.textContent = mode === 'login' ? 'Sign in to MenuMargin' : 'Create your free account';
  DOM.authSubtitle.textContent = mode === 'login' ? 'Access your private business workspaces.' : 'Your business data stays separated by workspace.';
  DOM.btnSubmitAuth.textContent = mode === 'login' ? 'Sign in' : 'Create free account';
  DOM.btnToggleAuthMode.textContent = mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in';
  openModal(DOM.modalAuth);
  DOM.authEmail.focus();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  DOM.authError.classList.add('hidden');
  try {
    const endpoint = state.authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: DOM.authName.value.trim(),
        email: DOM.authEmail.value.trim(),
        password: DOM.authPassword.value
      })
    });
    const data = await readJsonResponse(response, 'Account authentication');
    state.user = data.user;
    updateAccountButton();
    closeModal(DOM.modalAuth);
    showToast(`Welcome, ${state.user.name}.`, 'success');
    if (state.authIntent === 'workspace') {
      openModal(DOM.modalWorkspaceSetup);
      DOM.workspaceBusinessName.focus();
    }

  } catch (error) {
    DOM.authError.textContent = error.message;
    DOM.authError.classList.remove('hidden');
  }

}

function openWorkspaceSettings() {
  const profile = state.activeProfile;
  if (!state.user) {
    showToast('Sign in to manage your workspaces.', 'warning');
    return;
  }
  const demo = !profile || ['bakery', 'cafe', 'foodtruck'].includes(profile.id);
  DOM.settingsBusinessName.value = profile.name || '';
  DOM.settingsBusinessType.value = profile.type || '';
  DOM.settingsLocation.value = profile.location || '';
  DOM.settingsTarget.value = profile.targetFoodCostPct || 28;
  DOM.workspaceSettingsForm.querySelector('input').disabled = demo;
  DOM.settingsBusinessType.disabled = demo;
  DOM.settingsLocation.disabled = demo;
  DOM.settingsTarget.disabled = demo;
  DOM.workspaceSettingsForm.querySelector('button[type="submit"]').disabled = demo;
  DOM.btnResetWorkspace.disabled = demo;
  openModal(DOM.modalWorkspaceSettings);
}

async function saveWorkspaceSettings(event) {
  event.preventDefault();
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: DOM.settingsBusinessName.value.trim(),
        type: DOM.settingsBusinessType.value.trim(),
        location: DOM.settingsLocation.value.trim(),
        targetFoodCostPct: Number(DOM.settingsTarget.value)
      })
    });
    const data = await readJsonResponse(response, 'Workspace settings update');
    state.activeProfile = data.profile;
    closeModal(DOM.modalWorkspaceSettings);
    await loadProfiles();
    await loadRecipes();
    showToast('Workspace settings updated.', 'success');
  } catch (error) {
    showToast(error.message || 'Could not update workspace settings', 'danger');
  }
}

async function resetWorkspaceData() {
  if (!window.confirm('Reset this workspace? Its ingredients and dishes will be removed.')) return;
  try {
    const response = await fetch('/api/profile/reset', { method: 'POST' });
    await readJsonResponse(response, 'Workspace reset');
    closeModal(DOM.modalWorkspaceSettings);
    await Promise.all([loadInventory(), loadRecipes()]);
    showToast('Workspace data reset.', 'success');
  } catch (error) {
    showToast(error.message || 'Could not reset workspace', 'danger');
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  state.user = null;
  localStorage.removeItem('menumargin_workspace_mode');
  updateAccountButton();
  closeModal(DOM.modalWorkspaceSettings);
  showToast('Signed out.', 'success');
  window.location.href = '/?demo=1';
}

/* Staggered KPI card entrance reveal */
function revealKPICards() {
  const cards = document.querySelectorAll('.kpi-card');
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('card-revealed'), 80 + i * 70);
  });
}

// Check Backend & Gemma Status
async function checkSystemStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await readJsonResponse(res, 'Status check');
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
  const data = await readJsonResponse(res, 'Profile loading');
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
  const previousProfile = state.activeProfile;
  try {
    const res = await fetch('/api/profile/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId })
    });
    const data = await readJsonResponse(res, 'Kitchen switch');
    if (data.success) {
      state.activeProfile = data.profile;
      showToast(`Switched kitchen to ${data.profile.name}`, 'success');
      await Promise.all([loadInventory(), loadRecipes()]);
      renderAuditDocument();
    }
  } catch (err) {
    state.activeProfile = previousProfile;
    if (previousProfile) DOM.profileSelect.value = previousProfile.id;
    console.error('Kitchen switch failed:', err);
    showToast('Failed to switch profile', 'danger');
  }
}

// Load Inventory
async function loadInventory() {
  showInventorySkeleton();
  beginDataRefresh();
  try {
    const res = await fetch('/api/inventory');
    if (!res.ok) throw new Error(`Inventory request failed (${res.status})`);
    const data = await readJsonResponse(res, 'Inventory loading');
    state.inventory = data.items || [];
    renderInventoryTable();
    renderDashboardInflationMovers();
  } catch (error) {
    console.error(error);
    state.inventory = [];
    DOM.inventoryTableBody.innerHTML = `
      <tr><td colspan="8">${renderInlineError('Wholesale pantry unavailable.', 'Retry', 'loadInventory()')}</td></tr>
    `;
    DOM.dashboardInflationList.innerHTML = renderInlineError('Inflation signals are unavailable right now.', 'Retry', 'loadInventory()');
    showToast('Could not load wholesale pantry data', 'danger');
  } finally {
    endDataRefresh();
  }
}

function showInventorySkeleton() {
  if (DOM.inventoryTableBody) {
    DOM.inventoryTableBody.innerHTML = Array(5).fill(0).map(() => `
      <tr class="skeleton-row" style="display:table-row;">
        <td><div class="skeleton-line w-40 skeleton-shimmer"></div><div class="skeleton-line h-8 w-25 skeleton-shimmer" style="margin-top:4px;"></div></td>
        <td><div class="skeleton-line w-25 skeleton-shimmer"></div></td>
        <td><div class="skeleton-line w-25 skeleton-shimmer"></div></td>
        <td><div class="skeleton-line w-15 skeleton-shimmer"></div></td>
        <td><div class="skeleton-line w-15 skeleton-shimmer"></div></td>
        <td><div class="skeleton-line h-20 skeleton-shimmer"></div></td>
        <td><div class="skeleton-line w-15 skeleton-shimmer"></div></td>
        <td><div class="skeleton-line w-25 skeleton-shimmer"></div></td>
      </tr>
    `).join('');
  }
}

// Load Recipes
async function loadRecipes() {
  showDishListSkeleton();
  beginDataRefresh();
  try {
    const res = await fetch('/api/recipes');
    if (!res.ok) throw new Error(`Recipe request failed (${res.status})`);
    const data = await readJsonResponse(res, 'Recipe loading');
    state.recipes = data.recipes || [];
    state.summary = data.summary;

    if (state.recipes.length === 0) {
      state.selectedRecipe = null;
    } else if (!state.selectedRecipe) {
      state.selectedRecipe = state.recipes[0];
    } else {
      const updated = state.recipes.find(r => r.id === state.selectedRecipe.id);
      state.selectedRecipe = updated || state.recipes[0];
    }

    renderDashboard();
    renderRecipeStudio();
    renderAuditDocument();
  } catch (error) {
    console.error(error);
    state.recipes = [];
    state.summary = null;
    DOM.dashboardDishesList.innerHTML = renderInlineError('Menu margin data is unavailable right now.', 'Retry', 'loadRecipes()');
    DOM.recipeSelectorList.innerHTML = renderInlineError('Recipes could not be loaded.', 'Retry', 'loadRecipes()');
    showToast('Could not load recipe data', 'danger');
  } finally {
    endDataRefresh();
  }
}

function renderInlineError(message, actionLabel, action) {
  return `
    <div class="inline-state error-state" role="alert">
      <strong>${message}</strong>
      <button class="btn btn-outline btn-xs" type="button" onclick="${action}">${actionLabel}</button>
    </div>
  `;
}

function showDishListSkeleton() {
  if (DOM.dashboardDishesList) {
    DOM.dashboardDishesList.innerHTML = Array(3).fill(0).map(() => `
      <div class="dish-row-card" style="animation:none; opacity:1;">
        <div class="dish-info" style="flex:1;">
          <div class="dish-name-row" style="margin-bottom:0.5rem;">
            <div class="skeleton-line w-40 skeleton-shimmer"></div>
          </div>
          <div class="dish-sub-metrics">
            <div class="skeleton-line h-8 w-25 skeleton-shimmer"></div>
            <div class="skeleton-line h-8 w-25 skeleton-shimmer"></div>
          </div>
        </div>
        <div class="skeleton-line h-20 skeleton-shimmer" style="width:60px;"></div>
      </div>
    `).join('');
  }
}

// Load Sample Invoices
async function loadSampleInvoices() {
  try {
    const res = await fetch('/api/sample-invoices');
    const data = await readJsonResponse(res, 'Sample invoice loading');
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

/* ---- Shared formatting utilities ---- */
const sharedFormatters = window.MenuMarginFormatters;

async function readJsonResponse(response, operation) {
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`${operation} returned invalid JSON (${response.status})`);
  }
  if (!response.ok) {
    throw new Error(data?.error || `${operation} failed (${response.status})`);
  }
  return data;
}

function formatCurrency(n, decimals = 0) {
  return sharedFormatters.formatCurrency(n, { decimals });
}

function formatPercent(n, decimals = 1) {
  return sharedFormatters.formatPercent(n, { decimals });
}

function formatNumber(n, decimals = 1) {
  return sharedFormatters.formatNumber(n, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatDelta(n, suffix = '%') {
  return sharedFormatters.formatDelta(n, suffix);
}

/* ---- Count-up animation for KPI numbers ---- */
function countUp(el, targetVal, prefix = '', suffix = '', duration = 600) {
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = prefix + formatNumber(targetVal) + suffix;
    return;
  }
  const start = 0;
  const startTime = performance.now();
  function frame(now) {
    const pct = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
    const current = start + (targetVal - start) * ease;
    el.textContent = prefix + formatNumber(current) + suffix;
    if (pct < 1) requestAnimationFrame(frame);
    else el.textContent = prefix + formatNumber(targetVal) + suffix;
  }
  requestAnimationFrame(frame);
}

function countUpInt(el, targetVal, prefix = '', suffix = '', duration = 500) {
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = prefix + Math.round(targetVal) + suffix;
    return;
  }
  const startTime = performance.now();
  function frame(now) {
    const pct = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - pct, 3);
    el.textContent = prefix + Math.round(targetVal * ease) + suffix;
    if (pct < 1) requestAnimationFrame(frame);
    else el.textContent = prefix + targetVal + suffix;
  }
  requestAnimationFrame(frame);
}

// Render Dashboard Tab
function renderDashboard() {
  if (!state.summary || !state.activeProfile) return;

  const summary = state.summary;
  const profile = state.activeProfile;
  const critical = summary.criticalDishes;
  const warning = summary.warningDishes;

  // Count-up KPI values once for the initial dashboard load.
  if (!state.hasAnimatedDashboard) {
    countUp(DOM.kpiAvgFoodCost, summary.avgFoodCostPct, '', '%');
    countUpInt(DOM.kpiMonthlyLeakage, summary.totalMonthlyLeakage, '$');
    countUpInt(DOM.kpiAtRiskCount, critical + warning);
    state.hasAnimatedDashboard = true;
  } else {
    DOM.kpiAvgFoodCost.textContent = formatPercent(summary.avgFoodCostPct);
    DOM.kpiMonthlyLeakage.textContent = formatCurrency(summary.totalMonthlyLeakage);
    DOM.kpiAtRiskCount.textContent = String(critical + warning);
  }

  const delta = summary.avgFoodCostPct - profile.targetFoodCostPct;
  DOM.kpiFoodCostDelta.textContent = formatDelta(delta) + (delta > 0 ? ' over' : ' under');
  DOM.kpiFoodCostDelta.style.color = delta > 0 ? 'var(--rose-400)' : 'var(--emerald-400)';

  // Progress bar fill + target marker
  const targetPct = profile.targetFoodCostPct;
  const fillWidth = Math.min(100, Math.max(10, (summary.avgFoodCostPct / 50) * 100));
  const targetPosWidth = Math.min(100, (targetPct / 50) * 100);
  DOM.kpiFoodCostFill.style.width = `${Math.min(fillWidth, targetPosWidth)}%`;
  // Add/update target marker
  const progressBar = DOM.kpiFoodCostFill.parentElement;
  let overage = progressBar.querySelector('.kpi-progress-overage');
  if (!overage) {
    overage = document.createElement('div');
    overage.className = 'kpi-progress-overage';
    progressBar.appendChild(overage);
  }
  overage.style.left = `${Math.min(fillWidth, targetPosWidth)}%`;
  overage.style.width = `${Math.max(0, fillWidth - targetPosWidth)}%`;
  overage.setAttribute('aria-hidden', 'true');
  let marker = progressBar.querySelector('.kpi-progress-target');
  if (!marker) {
    marker = document.createElement('div');
    marker.className = 'kpi-progress-target';
    progressBar.appendChild(marker);
  }
  marker.style.left = `${targetPosWidth}%`;
  marker.title = `Target: ${targetPct}%`;

  DOM.kpiTargetCost.textContent = formatPercent(profile.targetFoodCostPct);

  DOM.kpiAnnualLeakage.textContent = `-${formatCurrency(summary.totalMonthlyLeakage * 12)} / yr`;

  DOM.navAlertBadge.textContent = critical + warning;
  DOM.navAlertBadge.dataset.count = critical + warning;
  DOM.kpiHealthyCount.textContent = `${summary.totalDishes - (critical + warning)} Healthy dishes`;

  // Inflation KPI — fixed sign formatting
  const avgInfl = parseFloat(calculateAverageInflation());
  DOM.kpiAvgInflation.textContent = formatDelta(avgInfl);

  // Global Alert Banner
  const worstDish = [...state.recipes].sort((a, b) => b.metrics.foodCostPct - a.metrics.foodCostPct)[0];
  if (worstDish && worstDish.metrics.marginStatus !== 'HEALTHY') {
    DOM.globalAlertBanner.style.display = 'flex';
    DOM.alertBannerTitle.textContent = `Margin Leakage Detected: ${worstDish.name}`;
    DOM.alertBannerDesc.innerHTML = `Current food cost has surged to <strong>${worstDish.metrics.foodCostPct}%</strong> (target: ${profile.targetFoodCostPct}%). Unrecovered cost overrun is leaking <strong>${formatCurrency(worstDish.metrics.monthlyMarginLeakage * 12)}/year</strong>.`;
    DOM.btnBannerQuickOptimize.onclick = () => openOptimizerModal(worstDish.id);
  } else {
    DOM.globalAlertBanner.style.display = 'none';
  }

  // Render Dishes List in Dashboard — with status colour stripe
  if (state.recipes.length === 0) {
    DOM.dashboardDishesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">◎</div>
        <div class="empty-state-title">No menu dishes yet</div>
        <div class="empty-state-desc">Add a dish to see plate cost, risk, and potential recovery.</div>
        <button class="btn btn-primary btn-sm mt-3" type="button" onclick="openRecipeModal()">Add your first dish</button>
      </div>
    `;
    return;
  }

  DOM.dashboardDishesList.innerHTML = state.recipes.map((recipe, idx) => {
    const m = recipe.metrics;
    const statusKey = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'critical' : (m.marginStatus === 'WARNING' ? 'warning' : 'healthy');
    const badgeText = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'Critical Overrun' : (m.marginStatus === 'WARNING' ? 'Warning' : 'Healthy Target');
    const badgeClass = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'badge-danger' : (m.marginStatus === 'WARNING' ? 'badge-warning' : 'badge-success');

    return `
      <div class="dish-row-card status-${statusKey}" style="animation-delay:${idx * 50}ms">
        <div class="dish-info">
          <div class="dish-name-row">
            <span class="dish-name">${recipe.name}</span>
            <span class="dish-cat-pill">${recipe.category}</span>
            <span class="kpi-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="dish-sub-metrics">
            <span>Retail: <strong>${formatCurrency(recipe.sellingPrice, 2)}</strong></span>
            <span>COGS: <strong>${formatCurrency(m.plateCost, 2)}</strong></span>
            <span>Sales: <strong>${m.monthlyVolume}/mo</strong></span>
            ${m.monthlyMarginLeakage > 0 ? `<span class="text-rose" style="font-weight:700;">Leakage: -${formatCurrency(m.monthlyMarginLeakage)}/mo</span>` : '<span class="text-emerald font-semibold">Optimal Margin</span>'}
          </div>
          ${m.primaryCostDriver ? `
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.35rem;">
              <span class="badge badge-neutral" style="font-size:0.65rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-right:4px;">Primary Driver</span>
              <strong style="color:var(--brand-primary);">${m.primaryCostDriver.name}</strong> (${m.primaryCostDriver.sharePct}% of plate cost)
            </div>
          ` : ''}
        </div>
        <div class="dish-cost-gauge">
          <div class="cost-pct-val ${statusKey}">${m.foodCostPct}%</div>
          <div class="cost-pct-target">Target: ${m.targetFoodCostPct}%</div>
          <div class="dish-cost-track" aria-label="Food cost ${formatPercent(m.foodCostPct)} against target ${formatPercent(m.targetFoodCostPct)}">
            <span class="dish-cost-track-fill ${statusKey}" style="width:${Math.min(100, (m.foodCostPct / Math.max(m.targetFoodCostPct * 1.75, 50)) * 100)}%"></span>
            <span class="dish-cost-track-target" style="left:${Math.min(100, (m.targetFoodCostPct / Math.max(m.targetFoodCostPct * 1.75, 50)) * 100)}%"></span>
          </div>
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

  // Fixed sign: use formatDelta helper, never +-
  const avgInfl = parseFloat(calculateAverageInflation());
  DOM.kpiAvgInflation.textContent = formatDelta(avgInfl);
  DOM.kpiSurgingCount.textContent = `${sorted.length} Surging Items`;

  if (sorted.length === 0) {
    DOM.dashboardInflationList.innerHTML = `
      <div class="empty-state compact">
        <div class="empty-state-icon" aria-hidden="true">↗</div>
        <div class="empty-state-title">No active price spikes</div>
        <div class="empty-state-desc">Upload a supplier invoice to refresh your inflation radar.</div>
      </div>
    `;
    return;
  }

  DOM.dashboardInflationList.innerHTML = sorted.map(item => `
    <div class="spike-item">
      <div class="spike-info">
        <h4>${item.name}</h4>
        <span>${item.supplier} • Now ${formatCurrency(item.unitCost, 3)} / ${item.unit} (was ${formatCurrency(item.previousUnitCost || item.unitCost, 3)})</span>
      </div>
      <div class="spike-badge">${formatDelta(item.priceChangePct)}</div>
    </div>
  `).join('');
}

function calculateAverageInflation() {
  if (state.inventory.length === 0) return '0.0';
  const total = state.inventory.reduce((acc, i) => acc + (i.priceChangePct || 0), 0);
  return formatPercent(total / state.inventory.length).replace('%', '');
}

// Render Recipe Studio
function renderRecipeStudio() {
  DOM.recipesCount.textContent = state.recipes.length;

  // Sidebar list
  DOM.recipeSelectorList.innerHTML = state.recipes.length === 0
    ? `<div class="empty-state compact"><div class="empty-state-title">No recipes yet</div><div class="empty-state-desc">Build your first dish from the wholesale pantry.</div></div>`
    : state.recipes.map(r => {
    const isSelected = state.selectedRecipe && state.selectedRecipe.id === r.id;
    const badgeClass = r.metrics.marginStatus === 'CRITICAL_LEAKAGE' ? 'badge-danger' : (r.metrics.marginStatus === 'WARNING' ? 'badge-warning' : 'badge-success');
    return `
      <div class="recipe-select-card ${isSelected ? 'active' : ''}" onclick="selectRecipe('${r.id}')">
        <div class="card-top-row">
          <span class="card-dish-name">${r.name}</span>
          <span class="kpi-badge ${badgeClass}">${formatPercent(r.metrics.foodCostPct)}</span>
        </div>
        <div class="card-cost-metric">
          ${formatCurrency(r.sellingPrice, 2)} retail • ${formatCurrency(r.metrics.plateCost, 2)} cost
        </div>
        ${r.metrics.monthlyMarginLeakage > 0 ? `
          <div style="font-size:0.72rem; color:var(--rose-500); font-weight:700; margin-top:0.2rem;">
            -$${r.metrics.monthlyMarginLeakage}/mo leakage
          </div>
        ` : ''}
      </div>
    `;
    }).join('');

  if (!state.selectedRecipe && state.recipes.length > 0) {
    state.selectedRecipe = state.recipes[0];
  }

  const recipe = state.selectedRecipe;
  if (!recipe) {
    DOM.recipeMainWorkspace?.classList.add('hidden');
    return;
  }
  DOM.recipeMainWorkspace?.classList.remove('hidden');

  const m = recipe.metrics;
  DOM.detailRecipeName.textContent = recipe.name;
  DOM.detailRecipeMeta.textContent = `Yield: ${recipe.portionYield} ${recipe.unitName} • ${recipe.category} • Audited: ${recipe.lastAuditDate || 'Today'}`;

  const badgeClass = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'badge-danger' : (m.marginStatus === 'WARNING' ? 'badge-warning' : 'badge-success');
  const badgeLabel = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'Critical Margin Leakage' : (m.marginStatus === 'WARNING' ? 'Above Target Warning' : 'Healthy Food Cost');
  DOM.detailMarginBadge.className = `badge badge-pill ${badgeClass}`;
  DOM.detailMarginBadge.textContent = badgeLabel;

  DOM.detailSellingPrice.textContent = formatCurrency(recipe.sellingPrice, 2);
  DOM.detailPlateCost.textContent = formatCurrency(m.plateCost, 2);
  DOM.detailFoodCostPct.textContent = formatPercent(m.foodCostPct);
  DOM.detailFoodCostPct.style.color = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'var(--rose-400)' : (m.marginStatus === 'WARNING' ? 'var(--amber-400)' : 'var(--emerald-400)');
  DOM.detailTargetCostPct.textContent = formatPercent(m.targetFoodCostPct);

  const grossMargin = recipe.sellingPrice - m.plateCost;
  DOM.detailGrossMargin.textContent = formatCurrency(grossMargin, 2);
  DOM.detailGrossMarginPct.textContent = `${formatPercent(m.grossMarginPct)} gross margin`;
  DOM.detailMonthlyVol.textContent = `${m.monthlyVolume} ${recipe.unitName}`;
  DOM.detailMonthlyRev.textContent = `${formatCurrency(m.monthlyRevenue)} / mo`;

  DOM.detailLaborCost.textContent = formatCurrency(recipe.laborCostPerUnit || 0, 2);
  DOM.detailPackagingCost.textContent = formatCurrency(recipe.packagingCostPerUnit || 0, 2);
  DOM.detailMonthlyProfit.textContent = `${formatCurrency(m.monthlyProfit)} / mo`;

  // Crisp Executive Action Banner
  const banner = document.getElementById('recipeActionBanner');
  if (banner) {
    if (m.marginStatus !== 'HEALTHY') {
      banner.style.display = 'block';
      banner.style.background = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)';
      banner.style.borderColor = m.marginStatus === 'CRITICAL_LEAKAGE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
      banner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
          <div>
            <div style="font-size:0.85rem; font-weight:800; color:${m.marginStatus === 'CRITICAL_LEAKAGE' ? 'var(--rose-500)' : 'var(--amber-500)'};">
              Executive Diagnosis: Leaking ${formatCurrency(m.monthlyMarginLeakage)}/month (${formatCurrency(m.monthlyMarginLeakage * 12)}/year)
            </div>
            <div style="font-size:0.8rem; color:var(--text-primary); margin-top:0.25rem;">
              <strong>Recommended Action:</strong> ${m.actionRecommendation}
            </div>
            ${m.primaryCostDriver ? `
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.35rem;">
                Key Cost Driver: <strong>${m.primaryCostDriver.name}</strong> accounts for <strong>${m.primaryCostDriver.sharePct}%</strong> of total plate cost.
              </div>
            ` : ''}
          </div>
          <button class="btn btn-primary btn-sm" onclick="openOptimizerModal('${recipe.id}')" style="white-space:nowrap;">
            ✦ Optimize Dish
          </button>
        </div>
      `;
    } else {
      banner.style.display = 'block';
      banner.style.background = 'rgba(16, 185, 129, 0.08)';
      banner.style.borderColor = 'rgba(16, 185, 129, 0.25)';
      banner.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <div style="font-size:0.82rem; color:#34d399; font-weight:600;">
            ✓ Margin Target Met: Food cost is running at healthy ${m.foodCostPct}% (target: ${m.targetFoodCostPct}%).
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">
            Driver: ${m.primaryCostDriver?.name || 'Balanced formulation'}
          </span>
        </div>
      `;
    }
  }

  // Render Ingredients table
  const yieldCount = recipe.portionYield || 1;
  DOM.detailIngredientsTableBody.innerHTML = recipe.ingredients.map(ing => {
    const costPerPortion = ing.lineCost / yieldCount;
    const deltaPillClass = (ing.priceChangePct || 0) > 5 ? 'up' : ((ing.priceChangePct || 0) < -2 ? 'down' : 'stable');
    return `
      <tr>
        <td><strong>${ing.name}</strong></td>
        <td>${ing.quantity} ${ing.unit}</td>
        <td>${formatCurrency(ing.unitCost, 3)} / ${ing.unit}</td>
        <td>${formatCurrency(ing.lineCost, 3)}</td>
        <td>${formatCurrency(costPerPortion, 3)}</td>
        <td><span class="delta-pill ${deltaPillClass}">${formatDelta(ing.priceChangePct || 0)}</span></td>
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

  if (filtered.length === 0) {
    DOM.inventoryTableBody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state compact">
          <div class="empty-state-icon" aria-hidden="true">◌</div>
          <div class="empty-state-title">${state.inventory.length ? 'No matching ingredients' : 'Your wholesale pantry is empty'}</div>
          <div class="empty-state-desc">${state.inventory.length ? 'Try another search or category.' : 'Add your first supplier item to start tracking inflation.'}</div>
        </div>
      </td></tr>
    `;
    return;
  }

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
        <td>${item.packageQuantity} ${item.packageUnit} (${formatCurrency(item.packageCost, 2)})</td>
        <td><strong class="text-primary">${formatCurrency(item.unitCost, 3)}</strong> / ${item.unit}</td>
        <td>${formatCurrency(item.previousUnitCost, 3)} / ${item.unit}</td>
        <td><span class="delta-pill ${deltaClass}">${formatDelta(item.priceChangePct)}</span></td>
        <td>${item.lastUpdated}</td>
        <td>
          <button class="btn btn-outline btn-xs" onclick="viewItemHistory('${item.id}')" title="View Time-Series Price History & Linked Recipes">History</button>
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
  DOM.auditMonthlyRev.textContent = formatCurrency(totalMonthlyRev);
  DOM.auditAnnualLeakage.textContent = formatCurrency(summary.totalMonthlyLeakage * 12);
  DOM.auditRecoverableProfit.textContent = `+${formatCurrency(summary.totalMonthlyLeakage)} / mo`;

  DOM.auditTableBody.innerHTML = state.recipes.map(r => {
    const m = r.metrics;
    const isOver = m.foodCostPct > m.targetFoodCostPct;
    return `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.category}</td>
        <td>${formatCurrency(r.sellingPrice, 2)}</td>
        <td>${formatCurrency(m.plateCost, 2)}</td>
        <td style="color: ${isOver ? '#dc2626' : '#059669'}; font-weight: 700;">${formatPercent(m.foodCostPct)}</td>
        <td>${formatPercent(m.targetFoodCostPct)}</td>
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

  if (feedbacks.length === 0) {
    DOM.feedbackFeed.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" aria-hidden="true">◷</div>
        <div class="empty-state-title">No owner interviews logged</div>
        <div class="empty-state-desc">Capture the next conversation to keep traction evidence close to the product.</div>
        <button class="btn btn-primary btn-sm mt-3" type="button" onclick="openFeedbackForm()">Log first interview</button>
      </div>
    `;
    return;
  }

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
async function handleInventoryCsvImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const csv = await file.text();
    const response = await fetch('/api/inventory/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv })
    });
    const result = await readJsonResponse(response, 'Inventory CSV import');
    showToast(`${result.importedCount} ingredients imported.`, 'success');
    await Promise.all([loadInventory(), loadRecipes()]);
  } catch (error) {
    showToast(error.message || 'Could not import CSV', 'danger');
  } finally {
    event.target.value = '';
  }
}

function setupEventListeners() {
  setupCommandPalette();
  DOM.btnStartWorkspace.addEventListener('click', () => {
    if (!state.user) {
      openAuthModal('register', 'workspace');
      return;
    }
    closeWorkspaceWelcome();
    openModal(DOM.modalWorkspaceSetup);
    DOM.workspaceBusinessName.focus();
  });
  DOM.btnOpenDemo.addEventListener('click', () => {
    localStorage.setItem('menumargin_workspace_mode', 'demo');
    closeWorkspaceWelcome();
    showToast('Demo workspace opened. Explore the full bakery workflow.', 'success');
  });
  DOM.btnNewWorkspace.addEventListener('click', () => {
    if (!state.user) {
      openAuthModal('register', 'workspace');
      return;
    }
    openModal(DOM.modalWorkspaceSetup);
    DOM.workspaceBusinessName.focus();
  });
  DOM.btnCloseWorkspaceSetup.addEventListener('click', () => closeModal(DOM.modalWorkspaceSetup));
  DOM.btnCancelWorkspaceSetup.addEventListener('click', () => closeModal(DOM.modalWorkspaceSetup));
  DOM.workspaceSetupForm.addEventListener('submit', createWorkspace);
  DOM.btnImportInventory.addEventListener('click', () => DOM.inventoryCsvInput.click());
  DOM.inventoryCsvInput.addEventListener('change', handleInventoryCsvImport);
  DOM.btnAccount.addEventListener('click', () => {
    if (state.user) {
      openWorkspaceSettings();
      return;
    }
    openAuthModal('login');
  });
  DOM.btnCloseAuth.addEventListener('click', () => closeModal(DOM.modalAuth));
  DOM.btnToggleAuthMode.addEventListener('click', () => openAuthModal(state.authMode === 'login' ? 'register' : 'login', state.authIntent));
  DOM.authForm.addEventListener('submit', handleAuthSubmit);
  DOM.btnCloseWorkspaceSettings.addEventListener('click', () => closeModal(DOM.modalWorkspaceSettings));
  DOM.btnCancelWorkspaceSettings.addEventListener('click', () => closeModal(DOM.modalWorkspaceSettings));
  DOM.workspaceSettingsForm.addEventListener('submit', saveWorkspaceSettings);
  DOM.btnResetWorkspace.addEventListener('click', resetWorkspaceData);
  DOM.btnLogout.addEventListener('click', logout);

  // Navigation Tabs
  DOM.navTabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
    tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      DOM.navTabs.forEach(t => t.classList.remove('active'));
      DOM.tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      DOM.navTabs.forEach(t => {
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        t.setAttribute('tabindex', t === tab ? '0' : '-1');
      });
      const pane = document.getElementById(`pane${capitalize(target)}`);
      if (pane) pane.classList.add('active');
    });
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const index = Array.from(DOM.navTabs).indexOf(tab);
      const nextIndex = event.key === 'ArrowRight'
        ? (index + 1) % DOM.navTabs.length
        : (index - 1 + DOM.navTabs.length) % DOM.navTabs.length;
      DOM.navTabs[nextIndex].focus();
      DOM.navTabs[nextIndex].click();
    });
  });

  // Profile Selector
  DOM.profileSelect.addEventListener('change', (e) => {
    switchProfile(e.target.value);
  });

  if (DOM.systemStatusPill) {
    DOM.systemStatusPill.setAttribute('role', 'button');
    DOM.systemStatusPill.setAttribute('tabindex', '0');
    DOM.systemStatusPill.addEventListener('click', toggleGemmaDetails);
    DOM.systemStatusPill.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleGemmaDetails();
      }

    });
  }

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
  DOM.btnRetryOptimizer.addEventListener('click', () => {
    if (state.selectedRecipe) openOptimizerModal(state.selectedRecipe.id);
  });

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

  // Item History & DAG Modal
  const modalItemHistory = document.getElementById('modalItemHistory');
  const btnCloseHistoryModal = document.getElementById('btnCloseHistoryModal');
  const btnDismissHistoryModal = document.getElementById('btnDismissHistoryModal');
  if (btnCloseHistoryModal) btnCloseHistoryModal.addEventListener('click', () => closeModal(modalItemHistory));
  if (btnDismissHistoryModal) btnDismissHistoryModal.addEventListener('click', () => closeModal(modalItemHistory));

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

  // Global Modal Accessibility: Escape key and backdrop dismissal
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
      return;
    }
    if (e.key === 'Escape') {
      if (DOM.commandPalette && !DOM.commandPalette.classList.contains('hidden')) {
        closeCommandPalette();
        return;
      }
      const openModals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
      openModals.forEach(modal => closeModal(modal));
    }

  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });
}

function getCommandItems() {
  const tabCommands = Array.from(DOM.navTabs).map(tab => ({
    label: tab.querySelector('.tab-label')?.textContent.trim() || tab.dataset.tab,
    detail: 'Navigate',
    action: () => tab.click()
  }));
  const dishCommands = state.recipes.map(recipe => ({
    label: recipe.name,
    detail: 'Open dish in Recipe Studio',
    action: () => {
      switchTab('recipes');
      selectRecipe(recipe.id);
    }
  }));
  return [
    ...tabCommands,
    ...dishCommands,
    { label: 'Scan invoice', detail: 'Open Invoice Scanner', action: () => switchTab('invoices') },
    { label: 'Toggle theme', detail: 'Switch light and dark mode', action: () => DOM.btnThemeToggle.click() }
  ];
}

function renderCommandResults(query = '') {
  const normalized = query.trim().toLowerCase();
  const results = getCommandItems().filter(item =>
    !normalized || `${item.label} ${item.detail}`.toLowerCase().includes(normalized)
  );
  DOM.commandPaletteResults.innerHTML = results.length
    ? results.map((item, index) => `
      <button class="command-palette-item${index === 0 ? ' selected' : ''}" type="button" data-command-index="${index}">
        <span>${item.label}</span><small>${item.detail}</small>
      </button>
    `).join('')
    : '<div class="command-palette-empty">No matching actions</div>';
  DOM.commandPaletteResults.querySelectorAll('.command-palette-item').forEach((button, index) => {
    button.addEventListener('click', () => {
      results[index].action();
      closeCommandPalette();
    });
  });
}

function setupCommandPalette() {
  if (!DOM.commandPaletteInput) return;
  DOM.commandPaletteInput.addEventListener('input', () => renderCommandResults(DOM.commandPaletteInput.value));
  DOM.commandPaletteInput.addEventListener('keydown', (event) => {
    const items = Array.from(DOM.commandPaletteResults.querySelectorAll('.command-palette-item'));
    if (event.key === 'Enter') {
      event.preventDefault();
      items.find(item => item.classList.contains('selected'))?.click();
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!items.length) return;
      const current = items.findIndex(item => item.classList.contains('selected'));
      const next = event.key === 'ArrowDown'
        ? (current + 1) % items.length
        : (current - 1 + items.length) % items.length;
      items.forEach(item => item.classList.remove('selected'));
      items[next].classList.add('selected');
      items[next].scrollIntoView({ block: 'nearest' });
    }
  });
  DOM.commandPalette.addEventListener('click', (event) => {
    if (event.target === DOM.commandPalette) closeCommandPalette();
  });
}

function openCommandPalette() {
  if (!DOM.commandPalette) return;
  DOM.commandPalette.classList.remove('hidden');
  DOM.commandPaletteInput.value = '';
  renderCommandResults();
  DOM.commandPaletteInput.focus();
}

function closeCommandPalette() {
  DOM.commandPalette?.classList.add('hidden');
}

function showWorkspaceWelcomeIfNeeded() {
  const params = new URLSearchParams(window.location.search);
  const storedMode = localStorage.getItem('menumargin_workspace_mode');
  if (params.get('demo') === '1' || storedMode === 'demo' || storedMode === 'custom') return;
  DOM.workspaceWelcome.classList.remove('hidden');
}

function closeWorkspaceWelcome() {
  DOM.workspaceWelcome.classList.add('hidden');
}

async function createWorkspace(event) {
  event.preventDefault();
  const name = DOM.workspaceBusinessName.value.trim();
  const type = DOM.workspaceBusinessType.value;
  const location = DOM.workspaceLocation.value.trim() || 'Local';
  const targetFoodCostPct = Number(DOM.workspaceTarget.value);
  if (!name || !Number.isFinite(targetFoodCostPct) || targetFoodCostPct < 1 || targetFoodCostPct > 100) {
    showToast('Add a business name and a target between 1% and 100%.', 'warning');
    return;
  }
  const id = `workspace-${Date.now()}`;
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        type,
        location,
        owner: 'Business owner',
        targetFoodCostPct
      })
    });
    const data = await readJsonResponse(response, 'Workspace creation');
    localStorage.setItem('menumargin_workspace_mode', 'custom');
    closeModal(DOM.modalWorkspaceSetup);
    state.activeProfile = data.profile;
    await loadProfiles();
    await Promise.all([loadInventory(), loadRecipes()]);
    showToast(`${name} workspace created. Add your first ingredient to begin.`, 'success');
    switchTab('inventory');
  } catch (error) {
    console.error('Workspace creation failed:', error);
    showToast(error.message || 'Could not create workspace', 'danger');
  }
}

// Switch Tab Utility
function switchTab(tabName) {
  const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
  if (tabBtn) tabBtn.click();
}

// Load Sample Invoice text
function loadSampleInvoiceIntoTextarea(key) {
  state.selectedInvoiceFile = null;
  if (DOM.invoiceFileInput) DOM.invoiceFileInput.value = '';
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
  state.selectedInvoiceFile = file;
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
    const requestBody = state.selectedInvoiceFile
      ? (() => {
          const formData = new FormData();
          formData.append('invoiceFile', state.selectedInvoiceFile);
          formData.append('applyToInventory', String(DOM.chkAutoApplyInventory.checked));
          return formData;
        })()
      : JSON.stringify({
          rawText: text,
          applyToInventory: DOM.chkAutoApplyInventory.checked
        });
    const res = await fetch('/api/invoice/parse', {
      method: 'POST',
      ...(state.selectedInvoiceFile ? {} : { headers: { 'Content-Type': 'application/json' } }),
      body: requestBody
    });
    const data = await readJsonResponse(res, 'Invoice parsing');
    DOM.invoiceLoadingState.classList.add('hidden');
    if (!data.success || !data.result?.data) {
      throw new Error('Invoice parsing returned no extracted result');
    }
    DOM.invoiceResultsWrap.classList.remove('hidden');

    {
      const inv = data.result.data;
      DOM.resVendor.textContent = inv.vendor || 'Wholesale Supplier';
      DOM.resInvoiceNum.textContent = inv.invoiceNumber || 'INV-AUTO';
      DOM.resDate.textContent = inv.invoiceDate || 'Today';
      DOM.resTotal.textContent = formatCurrency(inv.totalAmount || 0, 2);

      latestExtractedItems = inv.extractedItems || [];
      state.selectedInvoiceFile = null;
      DOM.invoiceFileInput.value = '';

      DOM.invoiceItemsTableBody.innerHTML = latestExtractedItems.map(item => {
        const deltaClass = item.priceChangePct > 5 ? 'up' : (item.priceChangePct < -2 ? 'down' : 'stable');
        const sign = item.priceChangePct > 0 ? '+' : '';
        return `
          <tr>
            <td><code>${item.rawLine}</code></td>
            <td><strong>${item.name}</strong><br><span style="font-size:0.7rem; color:var(--text-subtle);">${item.unitConversionNote}</span></td>
            <td>${item.packageQuantity} ${item.packageUnit} (${formatCurrency(item.packageCost, 2)})</td>
            <td><strong class="text-primary">${formatCurrency(item.unitCost, 3)}</strong> / ${item.unit}</td>
            <td><span class="delta-pill ${deltaClass}">${formatDelta(item.priceChangePct)}</span></td>
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
    DOM.invoiceResultsWrap.classList.add('hidden');
    console.error('Invoice parsing failed:', err);
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
          const saveResponse = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inv)
          });
          await readJsonResponse(saveResponse, 'Inventory update');
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
  DOM.optErrorState.classList.add('hidden');
  DOM.optimizerContent.classList.add('hidden');
  state.currentOptimizationPlan = null;
  DOM.btnApplyOptimization.disabled = true;
  // Shimmer the optimize button while loading
  if (DOM.btnOptimizeWithGemma) DOM.btnOptimizeWithGemma.classList.add('loading-sparkle');
  openModal(DOM.modalOptimizer);

  try {
    const res = await fetch(`/api/recipes/${recipeId}/optimize`, { method: 'POST' });
    const data = await readJsonResponse(res, 'Recipe optimization');
    if (!data.success || !data.plan) {
      throw new Error('Recipe optimization returned no plan');
    }
    DOM.optLoadingState.classList.add('hidden');
    DOM.optimizerContent.classList.remove('hidden');
    if (DOM.btnOptimizeWithGemma) DOM.btnOptimizeWithGemma.classList.remove('loading-sparkle');

    {
      state.currentOptimizationPlan = data.plan;
      const m = data.plan.metrics;

      DOM.optCurrentCost.textContent = `${m.currentFoodCostPct}%`;
      DOM.optTargetCost.textContent = `${m.targetFoodCostPct}%`;
      DOM.optAnnualGain.textContent = `+${formatCurrency(m.potentialMonthlyProfitIncrease * 12)} / yr`;

      DOM.optModelName.textContent = data.plan.model;
      DOM.optTokensStat.textContent = `Prompt: ${data.plan.promptTokens} tokens • Generated: ${data.plan.completionTokens} tokens`;
      DOM.optReasoningText.textContent = data.plan.reasoning;

      DOM.optActionsStack.innerHTML = data.plan.culinaryActions.map(action => `
        <div class="action-card ${action.type}">
          <h5>${action.title}</h5>
          <p>${action.description}</p>
        </div>
      `).join('');
      DOM.btnApplyOptimization.disabled = false;
    }
  } catch (err) {
    DOM.optLoadingState.classList.add('hidden');
    DOM.optimizerContent.classList.add('hidden');
    DOM.optErrorMessage.textContent = err instanceof TypeError && err.message === 'Failed to fetch'
      ? 'The MenuMargin server is unavailable. Start the server and retry.'
      : (err.message || 'Gemma could not complete this optimization.');
    DOM.optErrorState.classList.remove('hidden');
    DOM.btnApplyOptimization.disabled = true;
    if (DOM.btnOptimizeWithGemma) DOM.btnOptimizeWithGemma.classList.remove('loading-sparkle');
    console.error('Recipe optimization failed:', err);
    showToast('Failed to optimize with Gemma', 'danger');
  }
}

// Apply Gemma Suggested Price to Menu
async function applyGemmaOptimizationSuggestion() {
  if (!state.currentOptimizationPlan || !state.selectedRecipe) {
    showToast('Run Gemma optimization before applying a price suggestion', 'warning');
    return;
  }

  const suggestedPrice = state.currentOptimizationPlan.metrics.suggestedPrice;
  const recipe = { ...state.selectedRecipe, sellingPrice: suggestedPrice };

  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe)
    });
    const data = await readJsonResponse(res, 'Optimization update');
    if (data.success) {
      showToast(`Updated menu selling price to ${formatCurrency(suggestedPrice, 2)}!`, 'success');
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
          ${i.name} (${formatCurrency(i.unitCost, 3)}/${i.unit})
        </option>
      `).join('')}
    </select>
  `;

  row.innerHTML = `
    ${selectHtml}
    <input type="number" step="0.01" min="0.01" class="form-input ing-qty" value="${quantity}" required placeholder="Qty">
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
    const data = await readJsonResponse(res, 'Recipe save');
    if (data.success) {
      showToast('Recipe saved successfully!', 'success');
      closeModal(DOM.modalRecipeForm);
      await loadRecipes();
    }
  } catch (err) {
    console.error('Recipe save failed:', err);
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

// Quick inline edit for inventory price (replaces browser prompt)
function quickEditInventory(id) {
  const item = state.inventory.find(i => i.id === id);
  if (!item) return;

  // Find the row in the table
  const rows = DOM.inventoryTableBody.querySelectorAll('tr');
  let targetRow = null;
  rows.forEach(row => {
    if (row.dataset.itemId === id) targetRow = row;
  });

  // Remove any existing inline panel
  const existing = document.querySelector('.inline-edit-panel');
  if (existing) existing.remove();

  // Create inline panel below the row
  const panel = document.createElement('tr');
  panel.className = 'inline-edit-panel-row';
  panel.innerHTML = `
    <td colspan="8" style="padding: 0 0.95rem 0.75rem;">
      <div class="inline-edit-panel">
        <span class="inline-edit-label">Update unit cost for <strong>${item.name}</strong> ($ / ${item.unit})</span>
        <input type="number" step="0.001" min="0.001" class="inline-edit-input" id="inlineEditInput_${id}" value="${item.unitCost}">
        <button class="btn btn-primary btn-sm" id="inlineEditSave_${id}">Save</button>
        <button class="btn btn-secondary btn-sm" id="inlineEditCancel_${id}">Cancel</button>
      </div>
    </td>
  `;

  if (targetRow) {
    targetRow.insertAdjacentElement('afterend', panel);
  } else {
    DOM.inventoryTableBody.appendChild(panel);
  }

  const input = document.getElementById(`inlineEditInput_${id}`);
  if (input) setTimeout(() => { input.focus(); input.select(); }, 40);

  document.getElementById(`inlineEditCancel_${id}`)?.addEventListener('click', () => panel.remove());

  document.getElementById(`inlineEditSave_${id}`)?.addEventListener('click', async () => {
    const newPrice = parseFloat(input.value);
    if (!newPrice || isNaN(newPrice) || newPrice <= 0) {
      showToast('Enter a valid price', 'warning');
      return;
    }
    const oldCost = item.unitCost;
    item.previousUnitCost = oldCost;
    item.unitCost = newPrice;
    item.priceChangePct = Number((((newPrice - oldCost) / oldCost) * 100).toFixed(1));
    item.trend = item.priceChangePct > 2 ? 'up' : (item.priceChangePct < -2 ? 'down' : 'stable');

    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      panel.remove();
      showToast(`Updated ${item.name} to ${formatCurrency(newPrice, 3)} / ${item.unit}`, 'success');
      await loadInventory();
      await loadRecipes();
    } catch (e) {
      showToast('Failed to update price', 'danger');
    }
  });
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
   THEME, MODAL & TOAST HELPERS
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('menumargin_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(theme);

  if (DOM.btnThemeToggle) {
    DOM.btnThemeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme === 'light');
  try {
    localStorage.setItem('menumargin_theme', theme);
  } catch (e) {}

  if (DOM.btnThemeToggle) {
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    DOM.btnThemeToggle.setAttribute('title', label);
    DOM.btnThemeToggle.setAttribute('aria-label', label);
  }

}

function toggleGemmaDetails() {
  if (!DOM.systemStatusPill) return;
  let popover = document.getElementById('gemmaStatusPopover');
  if (!popover) {
    const status = state.gemmaStatus || {};
    popover = document.createElement('div');
    popover.id = 'gemmaStatusPopover';
    popover.className = 'gemma-status-popover';
    popover.setAttribute('role', 'status');
    popover.innerHTML = `
      <strong>${status.activeModel || 'Gemma 2 open-weight engine'}</strong>
      <span>${status.provider || 'Built-in reasoning pipeline'}</span>
      <small>Private culinary reasoning is ready.</small>
    `;
    DOM.systemStatusPill.parentElement.appendChild(popover);
  }
  popover.classList.toggle('visible');
}

function openModal(modalEl) {
  if (modalEl) {
    modalEl.classList.remove('hidden');
    document.body.classList.add('modal-open');
    const firstInput = modalEl.querySelector('input:not([type="hidden"]), select, textarea, button:not(.modal-close)');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 60);
    }
  }
}

function closeModal(modalEl) {
  if (modalEl) {
    modalEl.classList.add('hidden');
    const hasRemainingModals = document.querySelectorAll('.modal-backdrop:not(.hidden)').length > 0;
    if (!hasRemainingModals) {
      document.body.classList.remove('modal-open');
    }
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : (type === 'danger'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`);
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-progress" aria-hidden="true"></span>
  `;
  DOM.toastContainer.appendChild(toast);
  // Keep the progress hairline in sync with the auto-dismiss timer.
  const lifetime = 3200;
  toast.style.setProperty('--toast-life', `${lifetime}ms`);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 220);
  }, lifetime);
}

function capitalize(s) {
  return s && s[0].toUpperCase() + s.slice(1);
}

// Global scope access for HTML onclick handlers
window.openOptimizerModal = openOptimizerModal;
window.selectRecipe = selectRecipe;
window.quickEditInventory = quickEditInventory;
window.viewItemHistory = viewItemHistory;
window.openFeedbackForm = () => openModal(DOM.modalFeedbackForm);

// View Time-Series Price History & Dependency Graph for an Item
async function viewItemHistory(itemId) {
  try {
    const res = await fetch(`/api/inventory/${itemId}/history`);
    const data = await res.json();
    if (!data.item) {
      showToast('Could not load item history', 'danger');
      return;
    }

    const modal = document.getElementById('modalItemHistory');
    document.getElementById('historyModalItemName').textContent = `${data.item.name}`;
    document.getElementById('historyModalSub').textContent = `Supplier: ${data.item.supplier} • Category: ${data.item.category}`;
    document.getElementById('historyCurrentCost').textContent = `${formatCurrency(data.item.unitCost, 3)} / ${data.item.unit}`;

    const delta = data.item.priceChangePct || 0;
    const deltaEl = document.getElementById('historyInflationDelta');
    deltaEl.textContent = formatDelta(delta);
    deltaEl.style.color = delta > 5 ? '#ef4444' : (delta < -2 ? '#10b981' : '#94a3b8');

    const depList = data.dependentRecipes || [];
    document.getElementById('historyLinkedCount').textContent = `${depList.length} Dishes`;

    const tbody = document.getElementById('historyTableBody');
    const historyList = data.priceHistory || [];
    if (historyList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-subtle);">No historical snapshots recorded yet.</td></tr>`;
    } else {
      tbody.innerHTML = historyList.map(h => {
        const hChange = h.priceChangePct || 0;
        const hTrendClass = hChange > 2 ? 'up' : (hChange < -2 ? 'down' : 'stable');
        return `
          <tr>
            <td><strong>${h.date}</strong></td>
            <td>${h.supplier || 'Primary Supplier'}</td>
            <td style="font-weight:700; color:var(--primary);">${formatCurrency(h.unitCost || 0, 3)}</td>
            <td>${h.packageCost ? formatCurrency(h.packageCost, 2) : '—'}</td>
            <td>
              <span class="delta-pill ${hTrendClass}">
                ${formatDelta(hChange)}
              </span>
            </td>
            <td style="font-size:0.75rem; color:var(--text-muted);">${h.note || 'Recorded Invoice'}</td>
          </tr>
        `;
      }).join('');
    }

    const depContainer = document.getElementById('historyDependentRecipesList');
    if (depList.length === 0) {
      depContainer.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">No dishes in this profile currently depend on this ingredient.</span>`;
    } else {
      depContainer.innerHTML = depList.map(r => `
        <span class="badge-pill" style="background:var(--brand-primary-subtle); color:var(--brand-primary); font-size:0.78rem; padding: 0.35rem 0.65rem; border-radius:var(--radius-sm); border: 1px solid var(--border-default);">
          ${r.name} <em style="font-size:0.7rem; opacity:0.8;">(${r.category})</em>
        </span>
      `).join('');
    }

    // Dimensional equivalents
    const u = (data.item.unit || '').toLowerCase();
    const cost = data.item.unitCost;
    let eqText = '';
    if (u === 'oz') {
      eqText = `1 oz = 28.35 g (${formatCurrency(cost / 28.3495, 4)}/g) • 1 lb = 16 oz (${formatCurrency(cost * 16, 2)}/lb) • 1 kg = 35.27 oz (${formatCurrency(cost * 35.274, 2)}/kg)`;
    } else if (u === 'fl oz') {
      eqText = `1 fl oz = 29.57 ml (${formatCurrency(cost / 29.57, 4)}/ml) • 1 quart = 32 fl oz (${formatCurrency(cost * 32, 2)}/qt) • 1 gallon = 128 fl oz (${formatCurrency(cost * 128, 2)}/gal)`;
    } else if (u === 'egg') {
      eqText = `1 egg = ${formatCurrency(cost, 3)} • 1 dozen (12 eggs) = ${formatCurrency(cost * 12, 2)} • 1 flat (30 eggs) = ${formatCurrency(cost * 30, 2)} • 1 case (180 eggs) = ${formatCurrency(cost * 180, 2)}`;
    } else {
      eqText = `Standard prep unit: ${data.item.unit} (${formatCurrency(cost, 3)} / unit). Normalized via dimensional culinary math.`;
    }
    document.getElementById('historyUnitEquivalents').textContent = eqText;

    openModal(modal);
  } catch (err) {
    showToast('Failed to load item price history', 'danger');
  }
}
