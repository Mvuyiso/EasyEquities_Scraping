import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  Box
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard({ selectedAccount }) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedAccount) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/dashboard/${selectedAccount.id}/`);
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedAccount]);

  if (!selectedAccount) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">
          Please select an account to view the dashboard
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

  // Prepare data for pie chart
  const holdingsData = {
    labels: dashboardData?.holdings.map(h => h.name) || [],
    datasets: [
      {
        data: dashboardData?.holdings.map(h => parseFloat(h.current_value.substring(1).replace(/,/g, ''))) || [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC249', '#EA5545', '#F46A9B', '#EF9B20'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <Typography variant="h4" gutterBottom>
        Dashboard: {selectedAccount.name}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                <AccountBalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Total Portfolio Value
              </Typography>
              <Typography variant="h4" component="div">
                {dashboardData?.total_value || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                {dashboardData?.total_profit_loss_value.startsWith('-') ? (
                  <TrendingDownIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
                ) : (
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
                )}
                Total Profit/Loss
              </Typography>
              <Typography 
                variant="h4" 
                component="div"
                color={dashboardData?.total_profit_loss_value.startsWith('-') ? 'error.main' : 'success.main'}
              >
                {dashboardData?.total_profit_loss_value || 'N/A'}
              </Typography>
              <Typography 
                variant="body1"
                color={dashboardData?.total_profit_loss_percentage < 0 ? 'error.main' : 'success.main'}
              >
                {dashboardData?.total_profit_loss_percentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="card">
            <CardContent>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                Total Holdings
              </Typography>
              <Typography variant="h4" component="div">
                {dashboardData?.holdings.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Allocation */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardHeader title="Portfolio Allocation" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {dashboardData?.holdings.length > 0 ? (
                  <Pie data={holdingsData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Typography variant="body1" align="center">
                    No holdings data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card className="card">
            <CardHeader title="Top Performers" />
            <CardContent>
              {dashboardData?.top_performers.length > 0 ? (
                dashboardData.top_performers.map((holding, index) => (
                  <Box key={index} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">{holding.name}</Typography>
                    <Typography 
                      variant="body1" 
                      color={holding.profit_loss_percentage < 0 ? 'error.main' : 'success.main'}
                    >
                      {holding.profit_loss_percentage}%
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body1" align="center">
                  No performance data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;