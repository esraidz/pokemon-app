import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          primary: {
            main: isDarkMode ? '#90caf9' : '#1976d2', // Mavi tonlar
          },
          secondary: {
            main: isDarkMode ? '#f48fb1' : '#dc004e', // Pembe/kırmızı tonlar
          },
          background: {
            default: isDarkMode ? '#1a202c' : '#f0f2f5', // Genel arka plan
            paper: isDarkMode ? '#2d3748' : '#ffffff', // Kartlar, dialoglar, AppBar
          },
          text: {
            primary: isDarkMode ? '#e2e8f0' : '#2d3748', // Ana metin rengi
            secondary: isDarkMode ? '#a0aec0' : '#718096', // İkincil metin rengi
          },
          // Yeni: Karşılaştırma sonuçları için özel renkler
          success: {
            main: '#4caf50', // Yeşil
          },
          error: {
            main: '#f44336', // Kırmızı
          },
          warning: {
            main: '#ff9800', // Turuncu
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                boxShadow: isDarkMode ? '0px 8px 25px rgba(0,0,0,0.7)' : '0px 4px 15px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#3a4b62' : '#f0f0f0',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? '#4a5568' : '#e0e0e0',
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#5a6b82' : '#d0d0d0',
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
                boxShadow: isDarkMode ? '0px 2px 4px -1px rgba(0,0,0,0.5), 0px 4px 5px 0px rgba(0,0,0,0.35), 0px 1px 10px 0px rgba(0,0,0,0.3)' : '0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.05)',
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                transition: 'color 0.3s ease-in-out',
              },
            },
          },
          MuiSkeleton: {
            styleOverrides: {
              root: {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease-in-out',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& fieldset': {
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                  transition: 'border-color 0.3s ease-in-out',
                },
                '&:hover fieldset': {
                  borderColor: isDarkMode ? '#90caf9' : '#1976d2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? '#90caf9' : '#1976d2',
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? '#e2e8f0' : '#2d3748',
                  transition: 'color 0.3s ease-in-out',
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                color: isDarkMode ? '#a0aec0' : '#718096',
                transition: 'color 0.3s ease-in-out',
              },
            },
          },
          MuiAutocomplete: {
            styleOverrides: {
              paper: { // Dropdown menüsünün arka planı (Autocomplete için)
                backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                transition: 'background-color 0.3s ease-in-out',
              },
              option: { // Dropdown seçeneklerinin rengi (Autocomplete için)
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#3a4b62' : '#f0f0f0',
                },
              },
            },
          },
          // Yeni: Dialog stilleri (Karşılaştırma modalı için)
          MuiDialog: {
            styleOverrides: {
              paper: { // Dialog içeriğinin arka planı
                backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
                boxShadow: isDarkMode ? '0px 11px 15px -7px rgba(0,0,0,0.8), 0px 24px 38px 3px rgba(0,0,0,0.56), 0px 9px 46px 8px rgba(0,0,0,0.48)' : '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
              },
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                color: isDarkMode ? '#e2e8f0' : '#2d3748',
                transition: 'color 0.3s ease-in-out',
              },
            },
          },
          MuiDialogContentText: {
            styleOverrides: {
              root: {
                color: isDarkMode ? '#a0aec0' : '#718096',
                transition: 'color 0.3s ease-in-out',
              },
            },
          },
        },
      }),
    [isDarkMode]
  );

  const contextValue = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
