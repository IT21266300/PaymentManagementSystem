import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled AppBar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1976d2',
  boxShadow: theme.shadows[2],
}));

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Fit-Gain
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#fff', color: '#1976d2', mr: 1 }}>
              {user.username[0].toUpperCase()}
            </Avatar>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {user.username} {user.isAdmin ? '(Admin)' : ''}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ textTransform: 'none', borderRadius: 20, px: 2 }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/')} sx={{ textTransform: 'none' }}>
            Login
          </Button>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;