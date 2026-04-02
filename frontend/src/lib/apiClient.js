import { authService } from './authService.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Make authenticated HTTP request with automatic token injection
 * Handles token expiration and re-login prompts
 */
export async function authenticatedFetch(endpoint, options = {}) {
  const token = authService.getToken();

  if (!token && !endpoint.includes('/auth/')) {
    throw new Error('No authentication token. Please log in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token expiration
  if (response.status === 403) {
    authService.logout();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET request helper
 */
export function apiGet(endpoint, options = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request helper
 */
export function apiPost(endpoint, data = {}, options = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export function apiPut(endpoint, data = {}, options = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request helper
 */
export function apiPatch(endpoint, data = {}, options = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export function apiDelete(endpoint, options = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

export default {
  authenticatedFetch,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
};
