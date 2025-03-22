import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Login function
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/login`, {
      email,
      password,
    });
    const { token, role } = response.data; // Assuming backend returns { message, token, role }
    localStorage.setItem('token', token); // Store token in localStorage
    return { token, role }; // Return token and role for use in AuthContext
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    throw new Error(errorMessage);
  }
};

// Logout function (client-side only)
const logout = () => {
  localStorage.removeItem('token'); // Remove token from localStorage
  // No API call needed for logout in this simple setup
};

// Get current user (optional, fetches user data if needed)
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Returns user profile data (e.g., email, role)
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch user data';
    throw new Error(errorMessage);
  }
};

export { login, logout, getCurrentUser };