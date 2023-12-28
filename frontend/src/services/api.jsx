import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

API.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    if (err.response.status !== 401) {
      throw err;
    }

    if (typeof err.response.data.error.name !== 'undefined') {
      if (err.response.data.error.name === 'TokenExpiredError') {
        throw err;
      }
    }
  }
);

export default API;
