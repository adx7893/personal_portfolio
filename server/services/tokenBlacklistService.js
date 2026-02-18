// In-memory revoked token store.
// For production multi-instance deployments, replace with Redis.
const revokedTokens = new Map();

export const revokeToken = (token, exp) => {
  if (!token) return;
  const expiryMs = Number(exp) > 0 ? Number(exp) * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
  revokedTokens.set(token, expiryMs);
};

export const isTokenRevoked = (token) => {
  if (!token) return false;
  const expiryMs = revokedTokens.get(token);
  if (!expiryMs) return false;

  if (expiryMs <= Date.now()) {
    revokedTokens.delete(token);
    return false;
  }

  return true;
};

export const cleanupRevokedTokens = () => {
  const now = Date.now();
  for (const [token, expiryMs] of revokedTokens.entries()) {
    if (expiryMs <= now) {
      revokedTokens.delete(token);
    }
  }
  return revokedTokens.size;
};

setInterval(cleanupRevokedTokens, 60 * 60 * 1000);
