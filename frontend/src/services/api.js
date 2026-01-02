
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});


export const trackingAPI = {

  startTracking: async (phoneNumber, interval = 2000) => {
    try {
      const response = await api.post('/tracking/start', {
        phoneNumber,
        interval
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to start tracking');
    }
  },


  stopTracking: async (phoneNumber) => {
    try {
      const response = await api.post('/tracking/stop', {
        phoneNumber
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to stop tracking');
    }
  },

  getStatus: async () => {
    try {
      const response = await api.get('/tracking/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get status');
    }
  },

  getAnalysis: async (phoneNumber) => {
    try {
      const response = await api.get(`/tracking/analysis/${phoneNumber}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get analysis');
    }
  }
};

export default api;