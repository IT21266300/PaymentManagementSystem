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

  const [accountNumberError, setAccountNumberError] = useState('');
  const [evidenceError, setEvidenceError] = useState('');
  

// Add validation functions
const validateAccountNumber = (number) => {
  if (!number) {
    setAccountNumberError('Account number is required');
    return false;
  } else if (!/^\d{8,17}$/.test(number)) {
    setAccountNumberError('Account number must be 8-17 digits');
    return false;
  }
  setAccountNumberError('');
  return true;
};

const validateEvidence = (file) => {
  if (!file) {
    setEvidenceError('Evidence file is required');
    return false;
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setEvidenceError('File size must be less than 5MB');
    return false;
  }
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setEvidenceError('File size must be less than 5MB');
    return false;
  }
  
  // Check file type
  const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!acceptedTypes.includes(file.type)) {
    setEvidenceError('Only JPEG, PNG, and PDF files are allowed');
    return false;
  }
  
  setEvidenceError('');
  return true;
};

  const handleSubmit = async () => {

    const isAccountValid = validateAccountNumber(accountNumber);
    const isEvidenceValid = validateEvidence(evidence);
    
    if (!isAccountValid || !isEvidenceValid) {
      return; // Stop submission if validation fails
    }

    if (!accountNumber || !total) {
      alert('Please enter an account number and ensure your cart has items.');
      return;
    }
  
    try {
      // 1. First create the payment record
      const paymentResponse = await dispatch(
        addPaymentMethod({ 
          accountNumber, 
          amount: total 
        }, { 
          headers: { 
            'user-id': user.id,
            'Content-Type': 'application/json'
          } 
        })
      ).unwrap();
  
      // 2. If we have evidence, upload it
      if (evidence) {
        const formData = new FormData();
        formData.append('evidence', evidence);
        formData.append('paymentId', paymentResponse._id);
        
        console.log('FormData contents:'); // Debug log
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
  
        await dispatch(
          uploadEvidence(formData, { 
            headers: { 
              'user-id': user.id,
              'Content-Type': 'multipart/form-data'
            } 
          })
        ).unwrap();
      }
  
      alert('Payment submitted successfully!');
      setAccountNumber('');
      setEvidence(null);
    } catch (error) {
      console.error('Payment submission error:', error); // Debug log
      alert('Error submitting payment: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAccountChange = (e) => {
    const value = e.target.value;
    setAccountNumber(value);
    // Optional: validate on change instead of just on submit
    if (accountNumberError) validateAccountNumber(value);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEvidence(file);
    // Optional: validate on change instead of just on submit
    if (file) validateEvidence(file);
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
        onChange={handleAccountChange}
        error={!!accountNumberError}
        helperText={accountNumberError}
        sx={{ mb: 2 }}
        placeholder="Enter your account number (8-17 digits)"
        inputProps={{ maxLength: 17 }}
      />
      <Input
        type="file"
        onChange={handleFileChange}
        inputProps={{ accept: 'image/jpeg,image/png,application/pdf' }}
        sx={{ mb: 2, display: 'block' }}
      />
      {evidenceError && (
        <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
          {evidenceError}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload payment evidence (JPEG, PNG, PDF only, max 5MB)
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