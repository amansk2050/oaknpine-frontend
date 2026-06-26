/**
 * PineZone Auth Client
 *
 * All authentication calls go directly to the NestJS backend.
 * No API routes on the Next.js frontend.
 *
 * Session token is stored in localStorage and sent as
 * Authorization: Bearer <token> with every request.
 */

const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_BASE_URL) ||
  'http://localhost:4001/api/v1';

/* ─── Token storage (client-side only) ──────────────────────────────────── */
const TOKEN_KEY = 'pz_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/* ─── Core fetch helper ──────────────────────────────────────────────────── */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: { message: string } | null }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        data: null,
        error: {
          message:
            json?.message ||
            json?.error ||
            `Request failed (${res.status})`,
        },
      };
    }

    return { data: json as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message || 'Network error' },
    };
  }
}

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface PineZoneUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  roleType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PineZoneSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  activeOrganizationId: string | null;
}

export interface AuthResult {
  user: PineZoneUser;
  session: PineZoneSession;
  token: string;
}

/* ─── Auth client ────────────────────────────────────────────────────────── */
export const authClient = {
  /* ── Sign Up ─────────────────────────────────────────────────────────── */
  signUp: {
    email: async (credentials: {
      name: string;
      email: string;
      password: string;
    }) => {
      const result = await apiFetch<AuthResult>('/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (result.data?.token) {
        saveToken(result.data.token);
      }
      return result;
    },
  },

  /* ── Sign In ─────────────────────────────────────────────────────────── */
  signIn: {
    email: async (credentials: {
      email: string;
      password: string;
      callbackURL?: string;
    }) => {
      const result = await apiFetch<AuthResult>('/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      if (result.data?.token) {
        saveToken(result.data.token);
      }
      return result;
    },
  },

  /* ── Sign Out ────────────────────────────────────────────────────────── */
  signOut: async () => {
    const result = await apiFetch('/auth/sign-out', { method: 'POST' });
    clearToken();
    return result;
  },

  /* ── Get Session ─────────────────────────────────────────────────────── */
  getSession: async () => {
    if (!getToken()) return { data: null, error: null };
    return apiFetch<{ user: PineZoneUser; session: PineZoneSession }>('/auth/session');
  },

  /* ── useSession React hook ───────────────────────────────────────────── */
  useSession: () => {
    // Lazy import to avoid SSR issues
    const { useState, useEffect } = require('react') as typeof import('react');

    const [session, setSession] = useState<{
      user: PineZoneUser;
      session: PineZoneSession;
    } | null>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
      authClient.getSession().then(({ data }) => {
        setSession(data);
        setIsPending(false);
      });
    }, []);

    return { data: session, isPending };
  },

  /* ── Organization ────────────────────────────────────────────────────── */
  organization: {
    create: async (dto: { name: string; slug: string; phone?: string; email?: string }) => {
      return apiFetch('/auth/organization/create', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    },
    getCurrent: async () => {
      return apiFetch<any>('/auth/organization/current');
    },
    updateCurrent: async (dto: any) => {
      return apiFetch<any>('/auth/organization/current', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },
  },

  /* ── Profile ─────────────────────────────────────────────────────────── */
  profile: {
    update: async (dto: { name?: string; roleType?: string }) => {
      return apiFetch<any>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },
  },

  /* ── Super Admin ─────────────────────────────────────────────────────── */
  superAdmin: {
    getStatistics: async () => {
      return apiFetch<any>('/auth/super-admin/statistics');
    },
    getHomestays: async () => {
      return apiFetch<any[]>('/auth/super-admin/homestays');
    },
    getBookings: async () => {
      return apiFetch<any[]>('/auth/super-admin/bookings');
    },
  },

  /* ── Password Reset ──────────────────────────────────────────────────── */
  requestPasswordReset: async (dto: { email: string; redirectTo?: string }) => {
    return apiFetch('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  resetPassword: async (dto: { token: string; newPassword: string }) => {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },
};

/* ─── Convenience re-exports ─────────────────────────────────────────────── */
export const { signIn, signUp, signOut } = authClient;

/* ─── apiFetch helper for use in other services ──────────────────────────── */
export { apiFetch };
