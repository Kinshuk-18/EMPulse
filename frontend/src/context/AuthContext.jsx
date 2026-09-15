import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Hackathon dev note: Managing 3-tier RBAC session state for the demo.
// Stores user email (@empulse), role (admin/nodal/institute), and assigned scope.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [scope, setScope] = useState(null);
  const [district, setDistrict] = useState(null);
  const [instituteName, setInstituteName] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Quick session restoration from localStorage so browser refresh doesn't log the judge out!
    const savedToken = localStorage.getItem('token') || localStorage.getItem('access_token');
    const savedRole = localStorage.getItem('role');
    const savedUser = localStorage.getItem('user');
    const savedScope = localStorage.getItem('scope');
    const savedDistrict = localStorage.getItem('district');
    const savedInstitute = localStorage.getItem('institute_name');

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
    // Handling flexible payloads so whether the API returns object or individual args, it won't crash
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
      finalScope = userData.scope || (userData.role === 'nodal' ? 'Bhopal' : userData.role === 'institute' ? 'Government ITI Bhopal' : 'Global');
      finalDistrict = userData.district || (userData.role === 'nodal' ? 'Bhopal' : null);
      finalInstitute = userData.institute_name || (userData.role === 'institute' ? 'Government ITI Bhopal' : null);
    }

    // Eradicate any legacy .io references in user email
    if (typeof finalUser === 'string') {
      finalUser = finalUser.replace('.io', '');
    }

    setUser(finalUser);
    setRole(finalRole);
    setScope(finalScope);
    setDistrict(finalDistrict);
    setInstituteName(finalInstitute);
    setToken(finalToken);

    // Save everything to localStorage for fast persistence
    if (finalUser) localStorage.setItem('user', finalUser);
    if (finalRole) localStorage.setItem('role', finalRole);
    if (finalScope) localStorage.setItem('scope', finalScope);
    if (finalDistrict) localStorage.setItem('district', finalDistrict);
    if (finalInstitute) localStorage.setItem('institute_name', finalInstitute);
    if (finalToken) {
      localStorage.setItem('token', finalToken);
      localStorage.setItem('access_token', finalToken);
    }
  };

  const logout = () => {
    // Reset state & wipe localStorage on logout
    setUser(null);
    setRole(null);
    setScope(null);
    setDistrict(null);
    setInstituteName(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('scope');
    localStorage.removeItem('district');
    localStorage.removeItem('institute_name');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
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
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
