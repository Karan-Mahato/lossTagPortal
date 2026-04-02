# JWT Authentication Setup Guide

## Overview
This project now includes JWT (JSON Web Token) authentication for secure user login and API access.

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

This will install the new packages:
- `jsonwebtoken` - For JWT token generation and verification
- `bcryptjs` - For password hashing

### 2. Environment Configuration
Make sure your `backend/.env` contains:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=4000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=7d
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` to a strong random string in production!

### 3. Start the Backend Server
```bash
npm start
# or for development with auto-reload
npm install -g nodemon
nodemon index.js
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Make sure your `frontend/.env` contains:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:4000/api
```

### 3. Start the Frontend Server
```bash
npm run dev
```

## API Endpoints

### Authentication Routes

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "user_name": "username",
  "password": "password"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "user_name": "username",
    "role": "plaza|bank|admin",
    "entity_id": "entity_id"
  }
}
```

#### Verify Token
```
POST /api/auth/verify
Authorization: Bearer jwt_token_here

Response:
{
  "user": {
    "id": "user_id",
    "user_name": "username",
    "role": "plaza|bank|admin",
    "entity_id": "entity_id"
  }
}
```

#### Register (Optional)
```
POST /api/auth/register
Content-Type: application/json

{
  "user_name": "username",
  "password": "password",
  "role": "plaza|bank|admin",
  "entity_id": "entity_id"
}

Response: Same as login
```

## Frontend Usage

### Using the Auth Hook
```jsx
import { useAuth } from '../hooks/useAuth.js';

export function MyComponent() {
  const { user, token, isLoading, error, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async (username, password) => {
    try {
      await login(username, password);
      // User is now logged in
    } catch (err) {
      console.error('Login failed:', err.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.user_name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Using the Auth Service
```jsx
import { authService } from '../lib/authService.js';

// Login
const data = await authService.login('username', 'password');

// Logout
authService.logout();

// Get user
const user = authService.getUser();

// Get token
const token = authService.getToken();

// Check if authenticated
const isAuth = authService.isAuthenticated();
```

### Protected Routes
```jsx
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';

<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## Database Schema Changes

Make sure your `users` table has the following structure:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('plaza', 'bank', 'admin')),
  entity_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (entity_id) REFERENCES toll_plazas(id) ON DELETE CASCADE
  -- OR FOREIGN KEY (entity_id) REFERENCES issuer_banks(id) ON DELETE CASCADE
);
```

## Making Authenticated API Requests

The token is automatically included in the Authorization header:

```jsx
const token = authService.getToken();

const response = await fetch('/api/complaints', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

Or create a helper for making authenticated requests:

```jsx
export async function authenticatedFetch(url, options = {}) {
  const token = authService.getToken();
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}
```

## Token Expiration & Refresh

Tokens expire after the time specified in `JWT_EXPIRY` (default: 7 days).

When a token expires:
1. The `useAuth` hook will detect the invalid token
2. The user will be logged out and redirected to login
3. Create a new `POST /api/auth/refresh` endpoint for refresh tokens (optional)

## Security Best Practices

- ✅ Hash passwords with bcryptjs before storing
- ✅ Use HTTPS in production
- ✅ Store JWT_SECRET in environment variables (never in code)
- ✅ Use secure, long JWT_SECRET in production
- ✅ Validate token expiration
- ✅ Implement rate limiting on auth endpoints
- ✅ Use HTTPS-only cookies instead of localStorage (optional enhancement)

## Troubleshooting

### "Invalid or expired token" error
- Token may have expired (check JWT_EXPIRY)
- JWT_SECRET might differ between frontend/backend
- Token format might be incorrect (should be `Bearer token`)

### Login fails with "Invalid username or password"
- Check that the user exists in the database
- Verify password was hashed correctly during user creation
- Check database connection

### CORS errors
- Make sure `frontend/.env` has correct `VITE_API_URL`
- Backend should have `cors()` middleware enabled

## Next Steps

1. Update existing API routes to use `verifyToken` middleware
2. Seed initial users into the database
3. Implement refresh token mechanism
4. Add logout endpoint
5. Add password reset functionality
6. Implement rate limiting on auth endpoints
