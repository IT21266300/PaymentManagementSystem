import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import useApi from '../hooks/useApi';
import TransactionTable from '../components/admin/TransactionTable';
import ReportChart from '../components/admin/ReportChart';

const AdminDashboard = ({ history }) => {
  const { user } = useAuth();
  const { loading, error, data, get } = useApi();
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Redirect non-admins and fetch initial data
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      history.push('/login');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const transactionData = await get('/api/payments/admin/transactions');
        setTransactions(transactionData.transactions || []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err.message);
      }
    };

    fetchTransactions();
  }, [user, history, get]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading && transactions.length === 0) {
    return (
      <Container sx={{ textAlign: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs for navigation */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="Transactions" />
          <Tab label="Reports" />
        </Tabs>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Box>
            <TransactionTable transactions={transactions} />
          </Box>
        )}
        {tabValue === 1 && (
          <Box>
            <ReportChart />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard;