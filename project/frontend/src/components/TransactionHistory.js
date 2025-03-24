import React, { useEffect, useMemo } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchPayments } from '../redux/slices/paymentSlice';

// Styled TableCell for header
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const TransactionHistory = () => {
  const dispatch = useDispatch();
  const { payments, status } = useSelector((state) => state.payment);
  
  // Use useMemo to prevent re-parsing on every render
  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchPayments({ 
        headers: { 
          'user-id': user.id, 
          'is-admin': user.isAdmin.toString() 
        } 
      }));
    }
  }, [dispatch, user]); // user is now stable

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Transaction History
      </Typography>
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Amount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Type</StyledTableCell>
              <StyledTableCell>Evidence</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {status === 'loading' ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : payments && payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              payments && payments.map((transaction) => (
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionHistory;
