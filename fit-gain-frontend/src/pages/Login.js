import React, { useState } from 'react';
import { TextField, Box, Typography, Container, Button, Alert, Paper, Avatar, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validateInput';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    try {
      await login(email, password);
      navigate('/profile');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <FitnessCenterIcon fontSize="large" />
          </Avatar>
          
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            FIT-GAIN
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Access your gym management dashboard
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              placeholder="your@email.com"
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              fullWidth
              size="large"
              sx={{ 
                py: 1.5, 
                textTransform: 'none', 
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: 1.5
              }}
            >
              Sign In
            </Button>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Link href="#" underline="hover" color="primary.main">
                Forgot password?
              </Link>
              <Link href="/register" underline="hover" color="primary.main">
                Create an account
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
