import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Input,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { addPaymentMethod, uploadEvidence } from '../redux/slices/paymentSlice';

// Styled Paper for form container
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[4],
  backgroundColor: '#fff',
}));

const UserPaymentForm = () => {
  const dispatch = useDispatch();
  const { total } = useSelector((state) => state.cart); // From cartSlice
  const [accountNumber, setAccountNumber] = useState('');
  const [evidence, setEvidence] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')); // From mock login

  const handleSubmit = async () => {
    if (!accountNumber || !total) {
      alert('Please enter an account number and ensure your cart has items.');
      return;
    }

    try {
      const paymentResponse = await dispatch(
        addPaymentMethod({ accountNumber, amount: total }, { headers: { 'user-id': user.id } })
      ).unwrap();

      if (evidence) {
        const formData = new FormData();
        formData.append('evidence', evidence);
        formData.append('paymentId', paymentResponse._id);
        await dispatch(
          uploadEvidence(formData, { headers: { 'user-id': user.id } })
        ).unwrap();
      }

      alert('Payment submitted successfully!');
      setAccountNumber('');
      setEvidence(null);
    } catch (error) {
      alert('Error submitting payment: ' + error.message);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Submit Payment
      </Typography>
      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          Total to Pay: ${total.toFixed(2) || '0.00'}
        </Typography>
        <TextField
          label="Bank Account Number"
          variant="outlined"
          fullWidth
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Enter your account number"
        />
        <Input
          type="file"
          onChange={(e) => setEvidence(e.target.files[0])}
          inputProps={{ accept: 'image/*,.pdf' }}
          sx={{ mb: 2, display: 'block' }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload payment evidence (e.g., receipt screenshot or PDF)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          sx={{ borderRadius: 20, textTransform: 'none', px: 4 }}
        >
          Submit Payment
        </Button>
      </StyledPaper>
    </Box>
  );
};

export default UserPaymentForm;