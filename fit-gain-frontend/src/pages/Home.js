import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const Home = ({ history }) => {
  const { user, logout } = useAuth();

  // Handle navigation
  const handleNavigate = (path) => {
    history.push(path);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        {/* Welcome Message */}
        <Typography variant="h3" gutterBottom>
          Welcome to Fit-gain
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
          {user
            ? `Hello, ${user.role === 'admin' ? 'Admin' : 'User'}! Manage your payments with ease.`
            : 'Please log in to access your payment management features.'}
        </Typography>

        {/* Action Buttons */}
        <Grid container spacing={3} justifyContent="center">
          {!user && (
            <Grid item xs={12} sm={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Get Started
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleNavigate('/login')}
                >
                  Login
                </Button>
              </Paper>
            </Grid>
          )}

          {user && (
            <>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Your Profile
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleNavigate('/profile')}
                  >
                    Manage Profile
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Make a Payment
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleNavigate('/checkout')}
                  >
                    Checkout
                  </Button>
                </Paper>
              </Grid>

              {user.role === 'admin' && (
                <Grid item xs={12} sm={4}>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Admin Dashboard
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => handleNavigate('/admin')}
                    >
                      Dashboard
                    </Button>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Sign Out
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;