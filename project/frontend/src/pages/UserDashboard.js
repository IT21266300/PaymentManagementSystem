import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, Badge, CircularProgress, Divider, Button, Card, IconButton, Avatar, Tabs, Tab } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsIcon from '@mui/icons-material/Sports';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ProductCatalog from '../components/ProductCatalog';
import Cart from '../components/Cart';
import UserPaymentForm from '../components/UserPaymentForm';
import TransactionHistory from '../components/TransactionHistory';
import toast, { Toaster } from 'react-hot-toast';

// Theme and styled components
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

const CategoryChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 10,
  backgroundColor: selected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
  color: selected ? '#fff' : theme.palette.primary.main,
  fontWeight: selected ? 'bold' : 'normal',
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.2),
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {
        id: 'u123',
        username: 'JohnDoe',
        membershipTier: 'Premium',
        points: 450,
        isAdmin: false
      };
      
      setUser(storedUser);
      setLoading(false);
      
      // Simulate cart count from localStorage or context
      setCartItemCount(3);
      
      // Simulate recently viewed products
      setRecentlyViewed([
        { id: 'p1', name: 'Protein Powder', price: 29.99, image: '/api/placeholder/60/60' },
        { id: 'p2', name: 'Lifting Gloves', price: 24.99, image: '/api/placeholder/60/60' },
        { id: 'p3', name: 'Gym Towel', price: 12.99, image: '/api/placeholder/60/60' }
      ]);
      
      // Simulate a notification
      setTimeout(() => {
        toast.success('Special discount: 20% off on supplements today!');
      }, 2000);
      
    }, 1000);
  }, []);

  const categories = [
    { id: 'all', label: 'All', icon: <FitnessCenterIcon fontSize="small" /> },
    { id: 'equipment', label: 'Equipment', icon: <SportsIcon fontSize="small" /> },
    { id: 'apparel', label: 'Apparel', icon: <LocalOfferIcon fontSize="small" /> },
    { id: 'nutrition', label: 'Nutrition', icon: <RestaurantIcon fontSize="small" /> }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.isAdmin) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Access Denied: Users Only
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.href = '/login'}>
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      pb: 6
    }}>
      {/* Notification system */}
      <Toaster position="top-right" />
      
      {/* Header */}
      <Box sx={{ 
        backgroundImage: 'linear-gradient(to right, #2196f3, #0d47a1)',
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
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.dark', border: '3px solid white' }}>
              {user.username.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Welcome, {user.username}!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label={`${user.membershipTier} Member`}
                color="secondary"
                size="small"
                sx={{ mr: 1, fontWeight: 'bold' }}
              />
              <Chip 
                icon={<AccountBalanceWalletIcon fontSize="small" />}
                label={`${user.points} Points`}
                variant="outlined"
                size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Grid>
          <Grid item xs />
          <Grid item>
            <IconButton color="inherit" aria-label="cart" sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
              <StyledBadge badgeContent={cartItemCount} color="secondary">
                <ShoppingCartIcon />
              </StyledBadge>
            </IconButton>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ px: 4 }}>
        {/* Tab Navigation */}
        <Paper sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            aria-label="store tabs"
          >
            <Tab icon={<FitnessCenterIcon />} label="Shop" />
            <Tab icon={<ShoppingCartIcon />} label="Cart" />
            <Tab icon={<HistoryIcon />} label="Orders" />
          </Tabs>
        </Paper>

        {/* Main content based on active tab */}
        {activeTab === 0 && (
          <>
            {/* Categories */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
              {categories.map((category) => (
                <CategoryChip
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  clickable
                  selected={selectedCategory === category.label}
                  onClick={() => setSelectedCategory(category.label)}
                />
              ))}
            </Box>

            {/* Recently viewed */}
            <StyledPaper sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#333' }}>
                Recently Viewed
              </Typography>
              <Grid container spacing={2}>
                {recentlyViewed.map(product => (
                  <Grid item xs={12} sm={4} key={product.id}>
                    <Card sx={{ display: 'flex', p: 1, cursor: 'pointer' }}>
                      <Box sx={{ mr: 2 }}>
                        <img src={product.image} alt={product.name} width="60" height="60" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">{product.name}</Typography>
                        <Typography variant="body2" color="primary" fontWeight="bold">${product.price}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </StyledPaper>

            {/* Product Catalog */}
            <StyledPaper>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium', color: '#333' }}>
                {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
              </Typography>
              <ProductCatalog category={selectedCategory !== 'All' ? selectedCategory.toLowerCase() : null} />
            </StyledPaper>
          </>
        )}

        {activeTab === 1 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <StyledPaper>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#333' }}>
                  Your Cart
                </Typography>
                <Cart />
              </StyledPaper>
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledPaper id="payment">
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#333' }}>
                  Payment
                </Typography>
                <UserPaymentForm />
              </StyledPaper>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <StyledPaper>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#333' }}>
              Order History
            </Typography>
            <TransactionHistory />
          </StyledPaper>
        )}
      </Box>
    </Box>
  );
};

export default UserDashboard;