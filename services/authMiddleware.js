const authStore = require('./authStore');

function readCookie(header, name) {
  const value = String(header || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : null;
}

function getToken(req) {
  const authorization = String(req.headers.authorization || '');
  if (authorization.startsWith('Bearer ')) return authorization.slice(7);
  return readCookie(req.headers.cookie, 'mm_session');
}

function optionalAuth(req, res, next) {
  req.user = authStore.getUserBySession(getToken(req));
  next();
}

function requireAuth(req, res, next) {
  req.user = authStore.getUserBySession(getToken(req));
  if (!req.user) return res.status(401).json({ error: 'Sign in to access your workspace', code: 'AUTH_REQUIRED' });
  next();
}

function sessionCookie(token, expiresAt) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `mm_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor((new Date(expiresAt) - Date.now()) / 1000)}${secure}`;
}

function clearSessionCookie() {
  return 'mm_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

module.exports = { optionalAuth, requireAuth, getToken, sessionCookie, clearSessionCookie };
