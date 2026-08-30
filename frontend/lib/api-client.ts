// Base URL for the NestJS backend.
// Server-side code (route handlers, server components) should use API_URL.
// Client-side code (hooks, SWR) should use PUBLIC_API_URL.
export const API_URL = process.env.API_URL ?? 'http://localhost:3001';
export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info: unknown) {
    super(message);
    this.status = status;
    this.info = info;
  }
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const info = await res.json().catch(() => undefined);
    throw new ApiError('An error occurred while fetching the data.', res.status, info);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// Shared fetcher used as the default SWR fetcher (see app/providers.tsx) and
// reusable directly from client components. `path` is joined onto
// PUBLIC_API_URL, e.g. api('/users').
export function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(PUBLIC_API_URL, path, init);
}

// Same as `api`, but hits the backend over the server-side URL (the docker
// network name when running via compose). Use this from server components /
// route handlers instead of `api`.
export function serverApi<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(API_URL, path, { cache: 'no-store', ...init });
}
