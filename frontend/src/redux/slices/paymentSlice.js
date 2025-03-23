import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPayments = createAsyncThunk('payment/fetchPayments', async ({ page = 1, limit = 10 }) => {
  const response = await api.get(`/payments/transactions?page=${page}&limit=${limit}`);
  return response.data;
});

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
  initialState: { payments: [], total: 0, page: 1, pages: 1, status: 'idle', error: null, report: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.payments = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
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
      .addCase(issueRefund.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(getTransactionReport.fulfilled, (state, action) => {
        state.report = action.payload;
      });
  },
});

export default paymentSlice.reducer;