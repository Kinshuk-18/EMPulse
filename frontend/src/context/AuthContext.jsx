import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Hacking together the 3-tier RBAC session state.
// SECURITY FIX: switched from localStorage to sessionStorage so the session
// automatically dies when the tab closes — no more phantom logins persisting
// across days when someone forgets to sign out.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [scope, setScope] = useState(null);
  const [district, setDistrict] = useState(null);
  const [instituteName, setInstituteName] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restoring session from sessionStorage — refresh within the same tab works,
    // but a brand-new tab or reopening the browser correctly forces re-auth.
    // localStorage was replaced here intentionally: session-scoped auth is the
    // correct posture for a government portal handling PII data.
    const savedToken =
      sessionStorage.getItem('token') || sessionStorage.getItem('access_token');
    const savedRole = sessionStorage.getItem('role');
    const savedUser = sessionStorage.getItem('user');
    const savedScope = sessionStorage.getItem('scope');
    const savedDistrict = sessionStorage.getItem('district');
    const savedInstitute = sessionStorage.getItem('institute_name');

    if (savedToken && savedRole && savedUser) {
      setToken(savedToken);
      setRole(savedRole);
      setUser(savedUser);
      setScope(savedScope || 'Global');
      setDistrict(savedDistrict);
      setInstituteName(savedInstitute);
    }
    setLoading(false);
  }, []);

  const login = (userData, userRole, userToken, userScope) => {
    // Handling flexible payloads — whether the backend returns an object
    // or individual args, this won't crash. Needed this after the login
    // endpoint response shape changed mid-sprint.
    let finalUser = userData;
    let finalRole = userRole;
    let finalToken = userToken;
    let finalScope = userScope || 'Global';
    let finalDistrict = null;
    let finalInstitute = null;

    if (typeof userData === 'object' && userData !== null) {
      finalUser = userData.username || userData.email || 'user@empulse';
      finalRole = userData.role;
      finalToken = userData.access_token || userData.token;
      finalScope =
        userData.scope ||
        (userData.role === 'nodal'
          ? 'Bhopal'
          : userData.role === 'institute'
          ? 'Government ITI Bhopal'
          : 'Global');
      finalDistrict =
        userData.district || (userData.role === 'nodal' ? 'Bhopal' : null);
      finalInstitute =
        userData.institute_name ||
        (userData.role === 'institute' ? 'Government ITI Bhopal' : null);
    }

    // Strip any legacy .io domain artifacts from user strings
    if (typeof finalUser === 'string') {
      finalUser = finalUser.replace('.io', '');
    }

    setUser(finalUser);
    setRole(finalRole);
    setScope(finalScope);
    setDistrict(finalDistrict);
    setInstituteName(finalInstitute);
    setToken(finalToken);

    // Persist to sessionStorage only — this is the entire security fix.
    // Data lives for the lifetime of this browser tab, nothing more.
    if (finalUser) sessionStorage.setItem('user', finalUser);
    if (finalRole) sessionStorage.setItem('role', finalRole);
    if (finalScope) sessionStorage.setItem('scope', finalScope);
    if (finalDistrict) sessionStorage.setItem('district', finalDistrict);
    if (finalInstitute) sessionStorage.setItem('institute_name', finalInstitute);
    if (finalToken) {
      sessionStorage.setItem('token', finalToken);
      sessionStorage.setItem('access_token', finalToken);
    }

    // Defensively nuke any old localStorage keys left from the previous version
    // so returning users aren't magically re-authenticated by stale data.
    const legacyKeys = ['user', 'role', 'scope', 'district', 'institute_name', 'token', 'access_token'];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  };

  const logout = () => {
    // Wipe React state
    setUser(null);
    setRole(null);
    setScope(null);
    setDistrict(null);
    setInstituteName(null);
    setToken(null);

    // Wipe sessionStorage — belt AND suspenders to guarantee clean state
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('scope');
    sessionStorage.removeItem('district');
    sessionStorage.removeItem('institute_name');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');

    // Also sweep localStorage in case any old session data is lurking there
    const legacyKeys = ['user', 'role', 'scope', 'district', 'institute_name', 'token', 'access_token'];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        scope,
        district,
        instituteName,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
