import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import * as adminService from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatCurrency';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportChart = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch report data on mount
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchReport = async () => {
      try {
        const data = await adminService.getPaymentReport();
        setReportData(data.report);
      } catch (err) {
        setError('Failed to load report data. Please try again later.');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!reportData) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>No report data available.</Typography>
      </Box>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: ['Total Transactions', 'Completed', 'Failed', 'Revenue', 'Refunds'],
    datasets: [
      {
        label: 'Financial Report',
        data: [
          reportData.totalTransactions,
          reportData.completedTransactions,
          reportData.failedTransactions,
          reportData.totalRevenue,
          reportData.totalRefunds,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Total Transactions
          'rgba(54, 162, 235, 0.6)', // Completed
          'rgba(255, 99, 132, 0.6)', // Failed
          'rgba(255, 206, 86, 0.6)', // Revenue
          'rgba(153, 102, 255, 0.6)', // Refunds
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Payment Report Summary',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw;
            if (label.includes('Revenue') || label.includes('Refunds')) {
              return `${label}: ${formatCurrency(value, 'USD')}`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Financial Report
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Bar data={chartData} options={options} />
      </Paper>
    </Box>
  );
};

export default ReportChart;