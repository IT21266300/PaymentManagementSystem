import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getPaymentReport = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/payments/admin/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export { getPaymentReport };