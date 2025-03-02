import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Components
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Holdings from './components/Holdings';
import Transactions from './components/Transactions';
import ProfitLoss from './components/ProfitLoss';
import StockCharts from './components/StockCharts';
import Navigation from './components/Navigation';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Navigation selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Routes>
            <Route path="/" element={<Dashboard selectedAccount={selectedAccount} />} />
            <Route path="/accounts" element={<Accounts setSelectedAccount={setSelectedAccount} />} />
            <Route path="/holdings" element={<Holdings selectedAccount={selectedAccount} />} />
            <Route path="/transactions" element={<Transactions selectedAccount={selectedAccount} />} />
            <Route path="/profit-loss" element={<ProfitLoss selectedAccount={selectedAccount} />} />
            <Route path="/stock-charts" element={<StockCharts />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
