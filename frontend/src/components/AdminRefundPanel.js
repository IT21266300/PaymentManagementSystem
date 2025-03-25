import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchPayments, issueRefund, getTransactionReport, getRefundRequests, handleRefundRequest, clearError } from '../redux/slices/paymentSlice';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const statusColors = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'info',
  approved: 'success',
  rejected: 'error',
};

const AdminRefundPanel = () => {
  const dispatch = useDispatch();
  const { transactions, refundRequests, report, status, error } = useSelector((state) => state.payment);

  const user = useMemo(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      dispatch(getTransactionReport());
      dispatch(fetchPayments({ admin: true, page: 1, limit: 10 }));
      dispatch(getRefundRequests());
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

  const handleRefund = async (transactionId) => {
    if (window.confirm('Are you sure you want to issue a refund for this transaction?')) {
      try {
        await dispatch(issueRefund(transactionId)).unwrap();
        dispatch(getTransactionReport());
      } catch (err) {
        console.error('Refund failed:', err);
      }
    }
  };

  const handleRefundRequestAction = async (requestId, action) => {
    if (window.confirm(`Are you sure you want to ${action} this refund request?`)) {
      try {
        await dispatch(handleRefundRequest({ requestId, action })).unwrap();
        dispatch(getTransactionReport());
      } catch (err) {
        console.error(`Failed to ${action} refund request:`, err);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Admin Refund & Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Transaction Report Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Transaction Summary Report
        </Typography>
        
        {status === 'loading' && !report ? (
          <CircularProgress />
        ) : report ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Total Payments</Typography>
              <Typography variant="h4">{report.totalPayments}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Total Refunds</Typography>
              <Typography variant="h4">{report.totalRefunds}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Total Amount</Typography>
              <Typography variant="h4">${report.totalAmount?.toFixed(2)}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Pending</Typography>
              <Typography variant="h4">{report.pending}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Completed</Typography>
              <Typography variant="h4">{report.completed}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Failed</Typography>
              <Typography variant="h4">{report.failed}</Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Refunded</Typography>
              <Typography variant="h4">{report.refunded}</Typography>
            </Paper>
          </Box>
        ) : (
          <Typography>No report data available</Typography>
        )}
      </Paper>

      {/* Refund Requests Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Refund Requests
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Request ID</StyledTableCell>
                <StyledTableCell>Transaction ID</StyledTableCell>
                <StyledTableCell>Payment ID</StyledTableCell>
                <StyledTableCell>User ID</StyledTableCell>
                <StyledTableCell>Amount</StyledTableCell>
                <StyledTableCell>Reason</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {status === 'loading' && refundRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : refundRequests?.length > 0 ? (
                refundRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{request._id.slice(-6)}</TableCell>
                    <TableCell>{request.transactionId?._id?.slice(-6) || 'N/A'}</TableCell>
                    <TableCell>{request.transactionId?.paymentId?._id?.slice(-6) || 'N/A'}</TableCell>
                    <TableCell>{request.userId}</TableCell>
                    <TableCell>${request.transactionId?.amount?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={statusColors[request.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outlined"
                            color="success"
                            onClick={() => handleRefundRequestAction(request._id, 'approve')}
                            disabled={status === 'loading'}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRefundRequestAction(request._id, 'reject')}
                            disabled={status === 'loading'}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No refund requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Refund Management Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Refund Management
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Transaction ID</StyledTableCell>
                <TableCell>Payment ID</TableCell>
                <StyledTableCell>Amount</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {status === 'loading' && transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : transactions?.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction._id.slice(-6)}</TableCell>
                    <TableCell>{transaction.paymentId?._id?.slice(-6) || 'N/A'}</TableCell>
                    <TableCell>${transaction.amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={transaction.status} 
                        color={statusColors[transaction.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(transaction.status === 'completed' || transaction.status === 'pending') && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRefund(transaction._id)}
                          disabled={status === 'loading'}
                        >
                          Issue Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminRefundPanel;