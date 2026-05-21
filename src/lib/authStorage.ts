import { AuthTokens, User } from "@/lib/types";

const AUTH_KEY = "bookleaf_auth";

function normalizeUser(user: User): User {
  return {
    ...user,
    isAdmin: user.isAdmin ?? user.role === "admin",
  };
}

export function saveAuth(user: User, tokens: AuthTokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, tokens }));
}

export function loadAuth(): { user: User; tokens: AuthTokens } | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(AUTH_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { user: User; tokens: AuthTokens };
    return { user: normalizeUser(parsed.user), tokens: parsed.tokens };
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}
