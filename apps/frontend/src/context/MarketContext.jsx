import React, { createContext, useState, useEffect } from 'react';
import { MarketModes } from '@open-agri/shared';
import axios from 'axios';

export const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [marketMode, setMarketMode] = useState(() => {
    return localStorage.getItem('marketMode') || MarketModes.B2C;
  });
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  useEffect(() => {
    localStorage.setItem('marketMode', marketMode);
  }, [marketMode]);

  const toggleMarketMode = () => {
    if (user && user.role === 'CUSTOMER') {
      alert('Wholesale B2B features are only available for business accounts. Please sign in with a B2B business account (Farmer, Distributor, or Wholesaler) to access wholesale pricing.');
      return;
    }
    setMarketMode((prev) => (prev === MarketModes.B2C ? MarketModes.B2B : MarketModes.B2C));
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      // API response shape: { status, token, data: { user } }
      const userToken = response.data.token;
      const userData  = response.data.data?.user || response.data.data || {};

      setUser(userData);
      setToken(userToken);

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Auto-switch market mode based on role
      if (['FARMER', 'DISTRIBUTOR', 'WHOLESALER'].includes(userData.role)) {
        setMarketMode(MarketModes.B2B);
      } else {
        setMarketMode(MarketModes.B2C);
      }

      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  const register = async (registerData) => {
    try {
      const response = await axios.post('/api/auth/register', registerData);
      // API response shape: { status, token, data: { user } }
      const userToken = response.data.token;
      const userData  = response.data.data?.user || response.data.data || {};

      setUser(userData);
      setToken(userToken);

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      if (['FARMER', 'DISTRIBUTOR', 'WHOLESALER'].includes(userData.role)) {
        setMarketMode(MarketModes.B2B);
      } else {
        setMarketMode(MarketModes.B2C);
      }

      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMarketMode(MarketModes.B2C);
  };

  // UI styling tokens based on mode
  const isB2B = marketMode === MarketModes.B2B;
  
  const styles = {
    primaryBg: isB2B 
      ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500' 
      : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
    primaryText: isB2B ? 'text-amber-700' : 'text-emerald-700',
    primaryBorder: isB2B ? 'border-amber-600' : 'border-emerald-600',
    badgeBg: isB2B ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
    accentColor: isB2B ? 'amber' : 'emerald',
    navBorder: isB2B ? 'border-amber-500/20' : 'border-emerald-500/20',
    textHighlight: isB2B ? 'text-amber-600' : 'text-emerald-600',
    focusRing: isB2B ? 'focus:ring-amber-500' : 'focus:ring-emerald-500',
  };

  return (
    <MarketContext.Provider value={{
      marketMode,
      setMarketMode,
      toggleMarketMode,
      user,
      token,
      login,
      register,
      logout,
      isB2B,
      styles
    }}>
      {children}
    </MarketContext.Provider>
  );
};
