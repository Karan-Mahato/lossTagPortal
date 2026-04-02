const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Custom event to notify auth changes
const AUTH_CHANGE_EVENT = 'AUTH_CHANGE';

export const authService = {
  /**
   * Login with username and password
   */
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('fastag_user', JSON.stringify(data.user));
    
    // Fire custom event to notify App of auth change
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: data.user }));
    console.log('📢 AUTH_CHANGE event fired');
    
    return data;
  },

  /**
   * Verify if token is still valid
   */
  async verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Token verification failed');

      return await response.json();
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('fastag_user');
      return null;
    }
  },

  /**
   * Register a new user
   */
  async register(username, password, role, entityId) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: username,
        password,
        role,
        entity_id: entityId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('fastag_user', JSON.stringify(data.user));
    
    // Fire custom event to notify App of auth change
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: data.user }));
    
    return data;
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('fastag_user');
    
    // Fire custom event to notify App of logout
    window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: null }));
  },

  /**
   * Get stored user
   */
  getUser() {
    const user = localStorage.getItem('fastag_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Subscribe to auth changes
   */
  onAuthChange(callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener(AUTH_CHANGE_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
