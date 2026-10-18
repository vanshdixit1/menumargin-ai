const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = process.env.DATABASE_PATH || path.join(DATA_DIR, 'menumargin.sqlite');
const SESSION_DAYS = 30;

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner',
    PRIMARY KEY (workspace_id, user_id)
  );
`);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = String(stored).split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return expected.length === actual.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createUser({ email, password, name }) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) throw new Error('Enter a valid email address');
  if (String(password || '').length < 8) throw new Error('Password must be at least 8 characters');
  if (!String(name || '').trim()) throw new Error('Name is required');
  const user = { id: id('usr'), email: normalizedEmail, name: String(name).trim(), createdAt: new Date().toISOString() };
  try {
    db.prepare('INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)').run(
      user.id, user.email, hashPassword(password), user.name, user.createdAt
    );
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) throw new Error('An account with that email already exists');
    throw error;
  }
  return user;
}

function getUserByEmail(email) {
  return db.prepare('SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?').get(normalizeEmail(email));
}

function authenticate(email, password) {
  const user = getUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) throw new Error('Email or password is incorrect');
  return publicUser(user);
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, createdAt: user.created_at || user.createdAt };
}

function createSession(userId) {
  const rawToken = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400000);
  db.prepare('INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id('ses'), userId, crypto.createHash('sha256').update(rawToken).digest('hex'), expires.toISOString(), now.toISOString()
  );
  return { token: rawToken, expiresAt: expires.toISOString() };
}

function getUserBySession(token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.id, u.email, u.name, u.created_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(crypto.createHash('sha256').update(token).digest('hex'), new Date().toISOString());
  return row ? publicUser(row) : null;
}

function revokeSession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(crypto.createHash('sha256').update(token).digest('hex'));
}

function createWorkspace(userId, profile) {
  const workspaceId = profile.id;
  db.prepare('INSERT OR REPLACE INTO workspaces (id, owner_user_id, name, created_at) VALUES (?, ?, ?, ?)').run(
    workspaceId, userId, profile.name, new Date().toISOString()
  );
  db.prepare('INSERT OR REPLACE INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, ?)').run(workspaceId, userId, 'owner');
  return workspaceId;
}

function listWorkspaceIds(userId) {
  return db.prepare('SELECT workspace_id AS id FROM workspace_members WHERE user_id = ?').all(userId).map(row => row.id);
}

function canAccessWorkspace(userId, workspaceId) {
  return Boolean(db.prepare('SELECT 1 FROM workspace_members WHERE user_id = ? AND workspace_id = ?').get(userId, workspaceId));
}

function deleteWorkspace(userId, workspaceId) {
  if (!canAccessWorkspace(userId, workspaceId)) throw new Error('Workspace access denied');
  db.prepare('DELETE FROM workspaces WHERE id = ? AND owner_user_id = ?').run(workspaceId, userId);
}

function cleanupExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString());
}

module.exports = {
  createUser,
  authenticate,
  createSession,
  getUserBySession,
  revokeSession,
  createWorkspace,
  listWorkspaceIds,
  canAccessWorkspace,
  deleteWorkspace,
  cleanupExpiredSessions
};
