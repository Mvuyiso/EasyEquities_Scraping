import React, { useState, useEffect } from 'react';
import { 
  NavLink,
  useLocation 
} from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as HoldingsIcon,
  Receipt as TransactionsIcon,
  AttachMoney as ProfitLossIcon,
  BarChart as StockChartsIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 240;

function Navigation({ selectedAccount, setSelectedAccount }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
useEffect(() => {
  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/api/accounts/');
      if (response.status === 200) {
        setAccounts(response.data);
        if (response.data.length > 0 && !selectedAccount) {
          setSelectedAccount(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Accounts load failed:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.data);
      }
    }
  };

  fetchAccounts();
}, [selectedAccount, setSelectedAccount]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAccountChange = (event) => {
    const accountId = event.target.value;
    const account = accounts.find(acc => acc.id === accountId);
    setSelectedAccount(account);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Accounts', icon: <AccountBalanceIcon />, path: '/accounts' },
    { text: 'Holdings', icon: <HoldingsIcon />, path: '/holdings' },
    { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
    { text: 'Profit/Loss', icon: <ProfitLossIcon />, path: '/profit-loss' },
    { text: 'Stock Charts', icon: <StockChartsIcon />, path: '/stock-charts' }
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Easy Equities
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={NavLink}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Investment Dashboard
          </Typography>
          {accounts.length > 0 && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="account-select-label" sx={{ color: 'white' }}>Account</InputLabel>
              <Select
                labelId="account-select-label"
                id="account-select"
                value={selectedAccount?.id || ''}
                label="Account"
                onChange={handleAccountChange}
                sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}

export default Navigation;
