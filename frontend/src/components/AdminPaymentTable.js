import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchPayments, confirmPayment, rejectPayment } from '../redux/slices/paymentSlice';

// Styled TableCell for header
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const AdminPaymentTable = () => {
  const dispatch = useDispatch();
  // Access both payments and transactions from state
  const { payments = [], status } = useSelector((state) => ({
    payments: state.payment.payments,
    status: state.payment.status
  }));
  const [search, setSearch] = useState('');

    // Add debug logs
    console.log('Redux payment state:', useSelector(state => state.payment));
    console.log('Payments data:', payments);
  
  
  // Use useMemo to prevent re-parsing on every render
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  
  useEffect(() => {
    if (user && user.isAdmin) {
      dispatch(fetchPayments({ 
        admin: true, // This tells the thunk to fetch payments, not transactions
        headers: { 
          'user-id': user.id, 
          'is-admin': 'true' 
        } 
      }));
    }
  }, [dispatch, user]);

  // Memoize the filtered payments to prevent recalculation on every render
  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.userId.toLowerCase().includes(search.toLowerCase()) ||
        payment.accountNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

  // Memoize handlers to prevent recreation on each render
  const handleConfirm = useCallback((paymentId) => {
    if (!user) return;
    
    dispatch(confirmPayment(paymentId, { 
      headers: { 
        'user-id': user.id, 
        'is-admin': 'true' 
      } 
    }))
      .unwrap()
      .then(() => alert('Payment confirmed'))
      .catch((error) => alert('Error: ' + error.message));
  }, [dispatch, user]);

  const handleReject = useCallback((paymentId) => {
    if (!user) return;
    
    dispatch(rejectPayment(paymentId, { 
      headers: { 
        'user-id': user.id, 
        'is-admin': 'true' 
      } 
    }))
      .unwrap()
      .then(() => alert('Payment rejected'))
      .catch((error) => alert('Error: ' + error.message));
  }, [dispatch, user]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Payment Management
      </Typography>
      <TextField
        label="Search by User ID or Account Number"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>User ID</StyledTableCell>
              <StyledTableCell>Account Number</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Evidence</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {status === 'loading' ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment._id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>{payment.userId}</TableCell>
                  <TableCell>{payment.accountNumber}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell>
                    {payment.evidence ? (
                      <Button
                        variant="outlined"
                        size="small"
                        href={`http://localhost:5000/${payment.evidence}`}
                        target="_blank"
                        sx={{ textTransform: 'none' }}
                      >
                        View
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleConfirm(payment._id)}
                          sx={{ mr: 1, borderRadius: 20, textTransform: 'none' }}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleReject(payment._id)}
                          sx={{ borderRadius: 20, textTransform: 'none' }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminPaymentTable;
