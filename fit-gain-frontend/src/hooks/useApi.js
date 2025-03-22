import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Generic API request function
  const request = useCallback(async (method, url, payload = null, config = {}) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...config.headers,
      };

      const response = await axios({
        method,
        url: `${API_URL}${url}`,
        data: payload,
        headers,
        ...config,
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Specific HTTP methods
  const get = useCallback((url, config = {}) => request('get', url, null, config), [request]);
  const post = useCallback((url, payload, config = {}) => request('post', url, payload, config), [request]);
  const put = useCallback((url, payload, config = {}) => request('put', url, payload, config), [request]);
  const del = useCallback((url, config = {}) => request('delete', url, null, config), [request]);

  return { loading, error, data, get, post, put, del };
};

export default useApi;