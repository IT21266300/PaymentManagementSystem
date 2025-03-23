import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ProductCatalog from '../components/ProductCatalog';
import Cart from '../components/Cart';
import UserPaymentForm from '../components/UserPaymentForm';
import TransactionHistory from '../components/TransactionHistory';

// Styled Paper for sections
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[4],
  backgroundColor: '#fff',
}));

const UserDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.isAdmin) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Access Denied: Users Only
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontWeight: 'bold', color: '#1976d2', mb: 4 }}
      >
        Welcome, {user.username}!
      </Typography>
      <Grid container spacing={4}>
        {/* Product Catalog Section */}
        <Grid item xs={12}>
          <StyledPaper elevation={3}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 'medium', color: '#333' }}
            >
              Browse Products
            </Typography>
            <ProductCatalog />
          </StyledPaper>
        </Grid>
        {/* Cart Section */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 'medium', color: '#333' }}
            >
              Your Cart
            </Typography>
            <Cart />
          </StyledPaper>
        </Grid>
        {/* Payment Form Section */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3} id="payment">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 'medium', color: '#333' }}
            >
              Make a Payment
            </Typography>
            <UserPaymentForm />
          </StyledPaper>
        </Grid>
        {/* Transaction History Section */}
        <Grid item xs={12}>
          <StyledPaper elevation={3}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 'medium', color: '#333' }}
            >
              Transaction History
            </Typography>
            <TransactionHistory />
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;