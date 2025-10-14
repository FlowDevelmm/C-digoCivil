import React, { createContext, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';

const lightColors = {
  background: '#ffffff',
  text: '#0b1630',
  textSecondary: '#4a5668',
  primary: '#0a5da1',
  card: '#f2f2f2',
  border: '#d8e9f8',
  icon: '#0a5da1',
  danger: '#ff4d4d',
};

const darkColors = {
  background: '#121212',
  text: '#E0E0E0',
  textSecondary: '#A9B7C9',
  primary: '#64B5F6',
  card: '#1E1E1E',
  border: '#273443',
  icon: '#64B5F6',
  danger: '#ff4d4d',
};

const ThemeContext = createContext({
  isDarkMode: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
