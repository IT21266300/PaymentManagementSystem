import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Avatar, 
  Chip, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider, 
  IconButton,
  Tabs,
  Tab,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import AdminPaymentTable from '../components/AdminPaymentTable';
import TransactionHistory from '../components/TransactionHistory';
import { PieChart, LineChart } from 'recharts';
import AdminRefundPanel from '../components/AdminRefundPanel';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
  backgroundColor: '#fff',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
  },
}));

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  borderRadius: 16,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
  background: color === 'primary' 
    ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)' 
    : color === 'success' 
      ? 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)' 
      : color === 'warning'
        ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
        : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
  color: 'white',
  height: '100%'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  boxShadow: theme.shadows[2],
  textTransform: 'none',
  fontWeight: 'bold',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    today: 0,
    monthly: 0,
    pendingPayments: 0,
    totalProducts: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {
        id: 'a123',
        username: 'AdminUser',
        isAdmin: true,
        lastLogin: '2025-03-24T08:30:45Z'
      };
      
      setUser(storedUser);
      
      // Simulate statistics
      setStats({
        today: 2456.78,
        monthly: 34980.50,
        pendingPayments: 12,
        totalProducts: 387
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Access Denied: Admin Only
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.href = '/login'}>
          Back to Login
        </Button>
      </Box>
    );
  }

  // Format date for last login
  let formattedLastLogin = "Unknown";
  try {
    if (user.lastLogin) {
      const lastLogin = new Date(user.lastLogin);
      formattedLastLogin = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(lastLogin);
    }
  } catch (error) {
    console.error("Error formatting last login date:", error);
    // Continue with default value
  }

  return (
    <Box sx={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      pb: 6
    }}>
      {/* Header */}
      <Box sx={{ 
        backgroundImage: 'linear-gradient(to right, #3f51b5, #1a237e)',
        color: 'white',
        p: 4,
        mb: 4,
        boxShadow: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', 
          top: -15, 
          right: -15, 
          width: 200, 
          height: 200, 
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar sx={{ 
              width: 64, 
              height: 64, 
              bgcolor: '#1a237e', 
              border: '3px solid white',
              color: 'white'
            }}>
              <SupervisorAccountIcon fontSize="large" />
            </Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label="Administrator"
                color="secondary"
                size="small"
                sx={{ mr: 1, fontWeight: 'bold' }}
              />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Last login: {formattedLastLogin}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs />
          <Grid item>
            <IconButton
              color="inherit"
              aria-label="more options"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              onClick={handleMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2, minWidth: 180 }
              }}
            >
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Add New Product</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Manage Users</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Export Reports</ListItemText>
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 4 }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="primary">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Today's Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                      ${stats.today.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +12% from yesterday
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="success">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Monthly Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                      ${stats.monthly.toLocaleString()}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <PaymentIcon />
                  </Avatar>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +8% from last month
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="warning">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Pending Payments
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                      {stats.pendingPayments}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <MoneyOffIcon />
                  </Avatar>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Requires attention
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard color="error">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                      Total Products
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                      {stats.totalProducts}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                    <InventoryIcon />
                  </Avatar>
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  12 low in stock
                </Typography>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <ActionButton variant="contained" startIcon={<AddIcon />}>
            Add Product
          </ActionButton>
          <ActionButton variant="contained" color="success" startIcon={<ReceiptIcon />}>
            Generate Report
          </ActionButton>
          <ActionButton variant="contained" color="secondary" startIcon={<PeopleIcon />}>
            View Members
          </ActionButton>
        </Box>

        {/* Recent Alert */}
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
          There are 3 payments requiring review and 12 products low in stock
        </Alert>

        {/* Tab Navigation */}
        <Paper sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            aria-label="admin tabs"
          >
            <Tab icon={<PaymentIcon />} label="Payments" />
            <Tab icon={<ShoppingBasketIcon />} label="Transactions" />
            <Tab icon={<MoneyOffIcon />} label="Refunds" />
          </Tabs>
        </Paper>

        {/* Main content based on active tab */}
        {activeTab === 0 && (
          <StyledPaper elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#333' }}>
                Payment Management
              </Typography>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                Export
              </Button>
            </Box>
            <AdminPaymentTable />
          </StyledPaper>
        )}

        {activeTab === 1 && (
          <StyledPaper elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#333' }}>
                Transaction History
              </Typography>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                Export
              </Button>
            </Box>
            <TransactionHistory />
          </StyledPaper>
        )}

{activeTab === 2 && (
  <StyledPaper elevation={3}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#333' }}>
        Refund Management & Reports
      </Typography>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<DownloadIcon />}
        onClick={() => alert('Export functionality would go here')}
      >
        Export Report
      </Button>
    </Box>
    <AdminRefundPanel />
  </StyledPaper>
)}
      </Box>
    </Box>
  );
};

export default AdminDashboard;