import axios from 'axios';

// Create an axios instance with the base URL for your backend API
const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // Ensure this matches your backend server's base URL
});

// Add a request interceptor to include the token in the Authorization header
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

// Add a response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response, // Return the response if successful
  (error) => {
    if (error.response?.status === 401) {
      // If the server returns a 401 Unauthorized error, clear the token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to the login page
    }
    return Promise.reject(error); // Reject the error for further handling
  }
);

export default instance;