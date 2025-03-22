import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getPaymentHistory = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/payments/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export { getPaymentHistory };