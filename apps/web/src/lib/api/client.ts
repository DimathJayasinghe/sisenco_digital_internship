import axios from 'axios';

/**
 * Shared axios instance. Requests go to the same-origin `/api/v1` path (proxied
 * to the API by next.config rewrites), and `withCredentials` ensures the
 * HttpOnly auth cookie is sent on every request.
 */
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
