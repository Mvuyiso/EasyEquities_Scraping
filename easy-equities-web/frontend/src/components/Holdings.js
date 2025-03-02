import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TableSortLabel,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import axios from 'axios';

function Holdings({ selectedAccount }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!selectedAccount) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/holdings/${selectedAccount.id}/`);
        setHoldings(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching holdings:', err);
        setError('Failed to load holdings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [selectedAccount]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (!selectedAccount) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">
          Please select an account to view holdings
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Filter holdings based on search term
  const filteredHoldings = holdings.filter(holding => 
    holding.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort holdings
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    let aValue, bValue;
    
    if (orderBy === 'name') {
      aValue = a.name;
      bValue = b.name;
    } else if (orderBy === 'purchase_value') {
      aValue = parseFloat(a.purchase_value.substring(1).replace(/,/g, ''));
      bValue = parseFloat(b.purchase_value.substring(1).replace(/,/g, ''));
    } else if (orderBy === 'current_value') {
      aValue = parseFloat(a.current_value.substring(1).replace(/,/g, ''));
      bValue = parseFloat(b.current_value.substring(1).replace(/,/g, ''));
    } else if (orderBy === 'profit_loss') {
      const aProfit = parseFloat(a.current_value.substring(1).replace(/,/g, '')) - 
                     parseFloat(a.purchase_value.substring(1).replace(/,/g, ''));
      const bProfit = parseFloat(b.current_value.substring(1).replace(/,/g, '')) - 
                     parseFloat(b.purchase_value.substring(1).replace(/,/g, ''));
      aValue = aProfit;
      bValue = bProfit;
    } else if (orderBy === 'profit_loss_percentage') {
      const aPurchase = parseFloat(a.purchase_value.substring(1).replace(/,/g, ''));
      const aCurrent = parseFloat(a.current_value.substring(1).replace(/,/g, ''));
      const bPurchase = parseFloat(b.purchase_value.substring(1).replace(/,/g, ''));
      const bCurrent = parseFloat(b.current_value.substring(1).replace(/,/g, ''));
      
      aValue = aPurchase === 0 ? 0 : ((aCurrent - aPurchase) / aPurchase) * 100;
      bValue = bPurchase === 0 ? 0 : ((bCurrent - bPurchase) / bPurchase) * 100;
    }
    
    return order === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
  });

  return (
    <div className="holdings-container">
      <Typography variant="h4" gutterBottom>
        Holdings: {selectedAccount.name}
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search holdings..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      {sortedHoldings.length === 0 ? (
        <Typography variant="body1">
          No holdings found for this account.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'purchase_value'}
                    direction={orderBy === 'purchase_value' ? order : 'asc'}
                    onClick={() => handleRequestSort('purchase_value')}
                  >
                    Purchase Value
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'current_value'}
                    direction={orderBy === 'current_value' ? order : 'asc'}
                    onClick={() => handleRequestSort('current_value')}
                  >
                    Current Value
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'profit_loss'}
                    direction={orderBy === 'profit_loss' ? order : 'asc'}
                    onClick={() => handleRequestSort('profit_loss')}
                  >
                    Profit/Loss
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'profit_loss_percentage'}
                    direction={orderBy === 'profit_loss_percentage' ? order : 'asc'}
                    onClick={() => handleRequestSort('profit_loss_percentage')}
                  >
                    Profit/Loss %
                  </TableSortLabel>
                </TableCell>
                {holdings[0].shares && <TableCell>Shares</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedHoldings.map((holding, index) => {
                const purchaseValue = parseFloat(holding.purchase_value.substring(1).replace(/,/g, ''));
                const currentValue = parseFloat(holding.current_value.substring(1).replace(/,/g, ''));
                const profitLoss = currentValue - purchaseValue;
                const profitLossPercentage = purchaseValue === 0 ? 0 : (profitLoss / purchaseValue) * 100;
                const currency = holding.purchase_value[0];
                
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {holding.img && (
                          <Avatar 
                            src={holding.img} 
                            alt={holding.name}
                            sx={{ width: 30, height: 30, mr: 1 }}
                          />
                        )}
                        {holding.name}
                      </Box>
                    </TableCell>
                    <TableCell>{holding.purchase_value}</TableCell>
                    <TableCell>{holding.current_value}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {profitLoss >= 0 ? (
                          <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                        ) : (
                          <TrendingDownIcon sx={{ color: 'error.main', mr: 1 }} />
                        )}
                        <Typography
                          color={profitLoss >= 0 ? 'success.main' : 'error.main'}
                        >
                          {profitLoss >= 0 ? '+' : ''}{currency}{profitLoss.toFixed(2)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${profitLossPercentage >= 0 ? '+' : ''}${profitLossPercentage.toFixed(2)}%`}
                        color={profitLossPercentage >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    {holding.shares && <TableCell>{holding.shares}</TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default Holdings;