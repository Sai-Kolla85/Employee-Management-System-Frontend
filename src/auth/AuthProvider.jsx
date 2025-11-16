// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const p = localStorage.getItem('profile');
    return p ? JSON.parse(p) : null;
  });

  function loginWithToken(token, role, fullName, email) {
    localStorage.setItem('token', token);
    const profile = { email, fullName, roles: [role] };
    localStorage.setItem('profile', JSON.stringify(profile));
    setUser(profile);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    setUser(null);
  }

  function hasRole(reqRoles) {
    if (!user) return false;
    if (!Array.isArray(reqRoles)) reqRoles = [reqRoles];
    return reqRoles.some(r => user.roles.includes(r) || user.roles.includes('ROLE_ADMIN'));
  }

  return (
    <AuthContext.Provider value={{ user, loginWithToken, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
