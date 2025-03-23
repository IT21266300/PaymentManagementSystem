import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminPaymentTable from '../components/AdminPaymentTable';
import TransactionHistory from '../components/TransactionHistory';

// Styled Paper for sections
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[4],
  backgroundColor: '#fff',
}));

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.isAdmin) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Access Denied: Admin Only
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
        Admin Dashboard
      </Typography>
      <Grid container spacing={4}>
        {/* Payment Management Section */}
        <Grid item xs={12}>
          <StyledPaper elevation={3}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 'medium', color: '#333' }}
            >
              Payment Management
            </Typography>
            <AdminPaymentTable />
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

export default AdminDashboard;