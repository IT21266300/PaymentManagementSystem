import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import * as authService from '../services/authService';

export const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser({ token: response.token, role: response.role });
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, login, logout };
};