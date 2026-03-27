/**
 * Local email/password auth using localStorage + Web Crypto (SHA-256).
 * No external auth service required.
 */

const USERS_KEY = 'gp_users';
const SESSION_KEY = 'gp_session';

export interface LocalUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface SessionUser {
  id: string;
  username: string;
  email: string;
}

// ── Crypto helpers ────────────────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<SessionUser> {
  const users = loadUsers();

  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('auth/email-already-in-use');
  }
  if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('auth/username-taken');
  }

  const passwordHash = await sha256(password);
  const newUser: LocalUser = {
    id: uuid(),
    username,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: Date.now(),
  };

  saveUsers([...users, newUser]);

  const session: SessionUser = { id: newUser.id, username: newUser.username, email: newUser.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) throw new Error('auth/user-not-found');

  const hash = await sha256(password);
  if (hash !== user.passwordHash) throw new Error('auth/wrong-password');

  const session: SessionUser = { id: user.id, username: user.username, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
