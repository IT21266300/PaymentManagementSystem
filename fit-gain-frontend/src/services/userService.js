import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');
  return { Authorization: `Bearer ${token}` };
};

// Fetch user profile
const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/users/profile`, {
      headers: getAuthHeaders(),
    });
    return response.data; // Returns { email, fullName, paymentMethods, billingAddress, role }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
    throw new Error(errorMessage);
  }
};

// Add a payment method
const addPaymentMethod = async (method) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/payment-methods`, method, {
      headers: getAuthHeaders(),
    });
    return response.data; // Returns { message, paymentMethod }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to add payment method';
    throw new Error(errorMessage);
  }
};

// Update a payment method (e.g., set as default)
const updatePaymentMethod = async (paymentMethodId, updates) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/payment-methods`, 
      { paymentMethodId, ...updates }, 
      { headers: getAuthHeaders() }
    );
    return response.data; // Returns { message, updatedPaymentMethod }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update payment method';
    throw new Error(errorMessage);
  }
};

// Remove a payment method
const removePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/users/payment-methods/${paymentMethodId}`, {
      headers: getAuthHeaders(),
    });
    return response.data; // Returns { message }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to remove payment method';
    throw new Error(errorMessage);
  }
};

// Update billing address
const updateBillingAddress = async (address) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/billing-address`, address, {
      headers: getAuthHeaders(),
    });
    return response.data; // Returns { message, billingAddress }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update billing address';
    throw new Error(errorMessage);
  }
};

// Get payment methods (standalone fetch)
const getPaymentMethods = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/users/payment-methods`, {
      headers: getAuthHeaders(),
    });
    return response.data; // Returns array of payment methods
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch payment methods';
    throw new Error(errorMessage);
  }
};

export { 
  getProfile, 
  addPaymentMethod, 
  updatePaymentMethod, 
  removePaymentMethod, 
  updateBillingAddress, 
  getPaymentMethods 
};