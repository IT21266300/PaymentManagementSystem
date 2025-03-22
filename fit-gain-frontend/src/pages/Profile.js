import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import * as userService from '../services/userService';
import PaymentMethodCard from '../components/payment/PaymentMethodCard';
import TransactionList from '../components/payment/TransactionList';
import { validatePaymentMethod, validateBillingAddress } from '../utils/validateInput';

const Profile = ({ history }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingAddress, setBillingAddress] = useState({});
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMethod, setNewMethod] = useState({ methodType: '', cardNumberLastFour: '', bankAccountNumberLastFour: '', isDefault: false });

  useEffect(() => {
    if (!user) {
      history.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileData = await userService.getProfile();
        setProfile(profileData);
        setPaymentMethods(profileData.paymentMethods || []);
        setBillingAddress(profileData.billingAddress || {});
      } catch (error) {
        console.error('Failed to fetch profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, history]);

  const handleAddPaymentMethod = async () => {
    const validation = validatePaymentMethod(newMethod);
    if (!validation.isValid) {
      console.error(validation.message);
      return;
    }
  
    try {
      const response = await userService.addPaymentMethod(newMethod);
      setPaymentMethods([...paymentMethods, response.paymentMethod]);
      setOpenAddDialog(false);
      setNewMethod({ methodType: '', cardNumberLastFour: '', bankAccountNumberLastFour: '', isDefault: false });
    } catch (error) {
      console.error('Failed to add payment method:', error.message);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId) => {
    try {
      await userService.removePaymentMethod(paymentMethodId);
      setPaymentMethods(paymentMethods.filter(method => method._id !== paymentMethodId));
    } catch (error) {
      console.error('Failed to remove payment method:', error.message);
    }
  };

  const handleUpdateBillingAddress = async () => {
    const validation = validateBillingAddress(billingAddress);
    if (!validation.isValid) {
      console.error(validation.message);
      return;
    }
  
    try {
      const updatedAddress = await userService.updateBillingAddress(billingAddress);
      setBillingAddress(updatedAddress.billingAddress);
    } catch (error) {
      console.error('Failed to update billing address:', error.message);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Profile Info */}
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">Email: {profile?.email}</Typography>
          <Typography variant="h6">Name: {profile?.fullName}</Typography>
          <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </Box>

        {/* Payment Methods */}
        <Typography variant="h5" gutterBottom>
          Payment Methods
        </Typography>
        <Grid container spacing={2}>
          {paymentMethods.map(method => (
            <Grid item xs={12} sm={6} key={method._id}>
              <PaymentMethodCard method={method} onRemove={handleRemovePaymentMethod} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
              Add Payment Method
            </Button>
          </Grid>
        </Grid>

        {/* Add Payment Method Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
          <DialogTitle>Add New Payment Method</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Method Type</InputLabel>
              <Select
                value={newMethod.methodType}
                onChange={(e) => setNewMethod({ ...newMethod, methodType: e.target.value })}
                label="Method Type"
              >
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="debit_card">Debit Card</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
              </Select>
            </FormControl>
            {newMethod.methodType && newMethod.methodType !== 'bank_transfer' && (
              <TextField
                label="Last 4 Digits of Card"
                fullWidth
                margin="normal"
                value={newMethod.cardNumberLastFour}
                onChange={(e) => setNewMethod({ ...newMethod, cardNumberLastFour: e.target.value })}
              />
            )}
            {newMethod.methodType === 'bank_transfer' && (
              <TextField
                label="Last 4 Digits of Account"
                fullWidth
                margin="normal"
                value={newMethod.bankAccountNumberLastFour}
                onChange={(e) => setNewMethod({ ...newMethod, bankAccountNumberLastFour: e.target.value })}
              />
            )}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Set as Default</InputLabel>
              <Select
                value={newMethod.isDefault}
                onChange={(e) => setNewMethod({ ...newMethod, isDefault: e.target.value })}
                label="Set as Default"
              >
                <MenuItem value={true}>Yes</MenuItem>
                <MenuItem value={false}>No</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddPaymentMethod}>
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Billing Address */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Billing Address
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Street"
              fullWidth
              value={billingAddress.street || ''}
              onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              fullWidth
              value={billingAddress.city || ''}
              onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="State"
              fullWidth
              value={billingAddress.state || ''}
              onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Postal Code"
              fullWidth
              value={billingAddress.postalCode || ''}
              onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Country"
              fullWidth
              value={billingAddress.country || ''}
              onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleUpdateBillingAddress}>
              Update Billing Address
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4 }}>
  <TransactionList />
</Box>
      </Box>
    </Container>
  );
};

export default Profile;