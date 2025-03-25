import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchPayments, createRefundRequest, clearError } from '../redux/slices/paymentSlice';

// Styled TableCell for header
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const TransactionHistory = () => {
  const dispatch = useDispatch();
  const { transactions, status, error } = useSelector((state) => state.payment);
  
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (user) {
      dispatch(fetchPayments({ page: 1, limit: 10 }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpen = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTransaction(null);
    setReason('');
  };

  const handleRequestRefund = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for the refund request.');
      return;
    }
    try {
      await dispatch(createRefundRequest({ transactionId: selectedTransaction._id, reason })).unwrap();
      handleClose();
    } catch (err) {
      console.error('Refund request failed:', err);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Transaction History
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Evidence</StyledTableCell>
              <StyledTableCell>Refund Request</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {status === 'loading' ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !transactions || transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>
                    {transaction.paymentId?.evidence ? (
                      <Button
                        variant="outlined"
                        size="small"
                        href={`http://localhost:5000/${transaction.paymentId.evidence}`}
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
                    {transaction.status === 'completed' && transaction.type === 'payment' ? (
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        onClick={() => handleOpen(transaction)}
                      >
                        Request Refund
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Refund Request Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Request Refund</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Transaction ID: {selectedTransaction?._id?.slice(-6)}
          </Typography>
          <Typography gutterBottom>
            Amount: ${selectedTransaction?.amount?.toFixed(2)}
          </Typography>
          <TextField
            label="Reason for Refund"
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleRequestRefund} color="primary" variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionHistory;