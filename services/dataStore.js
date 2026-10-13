const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const DEFAULT_DATA_FILE = path.join(DATA_DIR, 'defaultData.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = fs.readFileSync(DEFAULT_DATA_FILE, 'utf8');
    fs.writeFileSync(DATA_FILE, defaultData, 'utf8');
  }
}

function getData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data file, falling back to default:', err);
    const defaultData = fs.readFileSync(DEFAULT_DATA_FILE, 'utf8');
    return JSON.parse(defaultData);
  }
}

function saveData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

function getActiveProfile() {
  const data = getData();
  return data.profiles[data.activeProfileId] || data.profiles.bakery;
}

function setActiveProfile(profileId) {
  const data = getData();
  if (data.profiles[profileId]) {
    data.activeProfileId = profileId;
    saveData(data);
    return data.profiles[profileId];
  }
  throw new Error(`Profile ${profileId} not found`);
}

function getInventory() {
  const data = getData();
  return data.inventory || [];
}

function updateInventoryItem(item) {
  const data = getData();
  const index = data.inventory.findIndex(i => i.id === item.id);
  if (index >= 0) {
    data.inventory[index] = { ...data.inventory[index], ...item };
  } else {
    data.inventory.push(item);
  }
  saveData(data);
  return item;
}

function getRecipes(profileId) {
  const data = getData();
  const pid = profileId || data.activeProfileId;
  return (data.recipes || []).filter(r => r.profileId === pid);
}

function getAllRecipes() {
  const data = getData();
  return data.recipes || [];
}

function saveRecipe(recipe) {
  const data = getData();
  const index = data.recipes.findIndex(r => r.id === recipe.id);
  if (index >= 0) {
    data.recipes[index] = { ...data.recipes[index], ...recipe };
  } else {
    if (!recipe.id) recipe.id = 'rec-' + Date.now();
    data.recipes.push(recipe);
  }
  saveData(data);
  return recipe;
}

function deleteRecipe(id) {
  const data = getData();
  data.recipes = data.recipes.filter(r => r.id !== id);
  saveData(data);
  return true;
}

function addFeedback(feedback) {
  const data = getData();
  if (!data.userFeedbackLog) data.userFeedbackLog = [];
  const entry = {
    id: 'fb-' + Date.now(),
    timestamp: new Date().toISOString(),
    ...feedback
  };
  data.userFeedbackLog.unshift(entry);
  saveData(data);
  return entry;
}

function getFeedbacks() {
  const data = getData();
  return data.userFeedbackLog || [];
}

function resetToDefault() {
  const defaultData = fs.readFileSync(DEFAULT_DATA_FILE, 'utf8');
  fs.writeFileSync(DATA_FILE, defaultData, 'utf8');
  return JSON.parse(defaultData);
}

module.exports = {
  getData,
  saveData,
  getActiveProfile,
  setActiveProfile,
  getInventory,
  updateInventoryItem,
  getRecipes,
  getAllRecipes,
  saveRecipe,
  deleteRecipe,
  addFeedback,
  getFeedbacks,
  resetToDefault
};
