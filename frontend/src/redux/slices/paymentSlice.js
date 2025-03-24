import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPayments = createAsyncThunk(
  'payment/fetchPayments',
  async ({ admin = false, page = 1, limit = 10 }) => {
    const endpoint = admin ? '/payments' : '/payments/transactions';
    const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`);
    return { data: response.data, isAdmin: admin };
  }
);

export const addPaymentMethod = createAsyncThunk('payment/addPaymentMethod', async (data) => {
  const response = await api.post('/payments/method', data);
  return response.data;
});

export const uploadEvidence = createAsyncThunk('payment/uploadEvidence', async (formData) => {
  const response = await api.post('/payments/evidence', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
});

export const confirmPayment = createAsyncThunk('payment/confirmPayment', async (id) => {
  const response = await api.put(`/payments/confirm/${id}`);
  return response.data;
});

export const rejectPayment = createAsyncThunk('payment/rejectPayment', async (id) => {
  const response = await api.put(`/payments/reject/${id}`);
  return response.data;
});

export const issueRefund = createAsyncThunk('payment/issueRefund', async (id) => {
  const response = await api.post(`/payments/refund/${id}`);
  return response.data;
});

export const getTransactionReport = createAsyncThunk('payment/getTransactionReport', async () => {
  const response = await api.get('/payments/report');
  return response.data;
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    payments: [],
    transactions: [],
    total: 0,
    page: 1,
    pages: 1,
    report: null, // Added report field
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.isAdmin) {
          state.payments = action.payload.data.payments || action.payload.data;
        } else {
          state.transactions = action.payload.data.transactions || action.payload.data;
        }
        if (action.payload.data.total) {
          state.total = action.payload.data.total;
          state.page = action.payload.data.page;
          state.pages = action.payload.data.pages;
        }
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.payments.push(action.payload);
      })
      .addCase(uploadEvidence.fulfilled, (state, action) => {
        const payment = state.payments.find((p) => p._id === action.meta.arg.get('paymentId'));
        if (payment) payment.evidence = action.payload.payment.evidence;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p._id === action.meta.arg);
        if (index !== -1) state.payments[index].status = 'confirmed';
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex((p) => p._id === action.meta.arg);
        if (index !== -1) state.payments[index].status = 'rejected';
      })
      .addCase(issueRefund.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(issueRefund.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.transactions.findIndex((t) => t._id === action.meta.arg);
        if (index !== -1) {
          state.transactions[index].status = 'refunded';
        }
      })
      .addCase(issueRefund.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(getTransactionReport.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTransactionReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.report = action.payload;
      })
      .addCase(getTransactionReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default paymentSlice.reducer;