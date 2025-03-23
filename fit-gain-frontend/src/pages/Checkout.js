import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatCurrency';
import { validateDiscountCode } from '../utils/validateInput';

const Checkout = () => { // Remove { history } prop
  const { user } = useAuth();
  const { loading, error, data, get, post } = useApi();
  const navigate = useNavigate(); // Use navigate hook
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [order, setOrder] = useState({ finalAmount: 100, currency: 'USD' }); // Mock order
  const [discountApplied, setDiscountApplied] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch payment methods on mount
  useEffect(() => {
    if (!user) {
      navigate('/login'); // Use navigate instead of history.push
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        const methods = await get('/api/users/payment-methods');
        setPaymentMethods(methods);
        if (methods.length > 0) {
          const defaultMethod = methods.find(m => m.isDefault) || methods[0];
          setSelectedMethod(defaultMethod._id);
        }
      } catch (err) {
        console.error('Failed to fetch payment methods:', err);
      }
    };

    fetchPaymentMethods();
  }, [user, navigate, get]); // Update dependency array with navigate

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path); // Use navigate instead of history.push
  };

  // Handle discount code application
  const applyDiscount = () => {
    const validation = validateDiscountCode(discountCode);
    if (!validation.isValid) {
      console.error(validation.message);
      return;
    }

    if (discountCode === 'FIT10') {
      setDiscountApplied(order.finalAmount * 0.1); // 10% discount
    } else {
      setDiscountApplied(0);
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method.');
      return;
    }

    try {
      const paymentData = {
        orderId: 'mock-order-id', // Replace with real order ID if available
        paymentMethodId: selectedMethod,
        gateway: paymentMethods.find(m => m._id === selectedMethod)?.methodType === 'paypal' ? 'paypal' : 'stripe', // Mock gateway selection
        amount: order.finalAmount - discountApplied,
      };
      const response = await post('/api/payments/process', paymentData);
      if (response.transaction.status === 'completed') {
        setPaymentSuccess(true);
        setTimeout(() => navigate('/profile'), 2000); // Use navigate instead of history.push
      }
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        {paymentSuccess ? (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment successful! Redirecting to profile...
            </Alert>
          </Box>
        ) : (
          <>
            {/* Order Summary */}
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography>
                Subtotal: {formatCurrency(order.finalAmount, order.currency)}
              </Typography>
              <Typography>
                Discount: {formatCurrency(discountApplied, order.currency)}
              </Typography>
              <Typography variant="h6">
                Total: {formatCurrency(order.finalAmount - discountApplied, order.currency)}
              </Typography>
            </Box>

            {/* Payment Method Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                label="Payment Method"
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method._id} value={method._id}>
                    {method.methodType.replace('_', ' ').toUpperCase()} -{' '}
                    {method.cardNumberLastFour
                      ? `Ending in ${method.cardNumberLastFour}`
                      : `Account ending in ${method.bankAccountNumberLastFour}`}
                    {method.isDefault && ' (Default)'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Discount Code */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  label="Discount Code"
                  fullWidth
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={applyDiscount}
                  disabled={loading}
                >
                  Apply
                </Button>
              </Grid>
            </Grid>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Submit Payment */}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePayment}
              disabled={loading || !selectedMethod}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>

            {/* Add Payment Method Link */}
            <Button
              variant="text"
              color="primary"
              fullWidth
              onClick={() => handleNavigate('/profile')}
              sx={{ mt: 1 }}
            >
              Add a new payment method
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Checkout;