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
  const { transactions, status } = useSelector((state) => state.payment); // Changed from payments to transactions
  
  console.log('Redux payment state:', useSelector((state) => state.payment));
  console.log('Transactions data:', transactions);

  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(fetchPayments({ page: 1, limit: 10 }));
    }
  }, [dispatch, user]);

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
  ) : !transactions || transactions.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        No transactions found
      </TableCell>
    </TableRow>
  ) : (
    transactions.map((transaction) => {
      // Add null checks
      const transactionDate = transaction.createdAt 
        ? new Date(transaction.createdAt).toLocaleDateString() 
        : 'N/A';
      const amount = transaction.amount 
        ? `$${transaction.amount.toFixed(2)}` 
        : 'N/A';
      const status = transaction.status || 'N/A';
      const type = transaction.type || 'N/A';
      
      return (
        <TableRow key={transaction._id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
          <TableCell>{transactionDate}</TableCell>
          <TableCell>{amount}</TableCell>
          <TableCell>{status}</TableCell>
          <TableCell>{type}</TableCell>
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
      );
    })
  )}
</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionHistory;