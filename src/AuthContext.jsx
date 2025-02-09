// src/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// Create context
export const AuthContext = createContext();

// AuthProvider wraps the app and provides shared auth state
export const AuthProvider = ({ children }) => {
  const [responseMessage, setResponseMessage] = useState(localStorage.getItem('responseMessage') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || ''); // Initialize from localStorage

  // Function to log out
  const logout = () => {
    setResponseMessage('');
    setUsername('');
    localStorage.removeItem('responseMessage');
    localStorage.removeItem('username');
  };

  // Sync responseMessage and username with localStorage
  useEffect(() => {
    if (responseMessage) {
      localStorage.setItem('responseMessage', responseMessage);
    }
    if (username) {
      localStorage.setItem('username', username); // Sync username to localStorage
    }
  }, [responseMessage, username]);

  return (
    <AuthContext.Provider value={{ responseMessage, setResponseMessage, username, setUsername, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
