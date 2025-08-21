import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // .js uzantısı OLMAMALI
import { CustomThemeProvider } from './ThemeContext'; // .js uzantısı OLMAMALI

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </React.StrictMode>
);

