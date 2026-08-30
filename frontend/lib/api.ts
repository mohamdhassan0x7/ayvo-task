// Base URL for the NestJS backend.
// Server-side code (route handlers, server components) should use API_URL.
// Client-side code should use NEXT_PUBLIC_API_URL.
export const API_URL = process.env.API_URL ?? 'http://localhost:3001';
export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
