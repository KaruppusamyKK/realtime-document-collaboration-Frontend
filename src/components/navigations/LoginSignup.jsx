import React, { useState } from 'react';
import { Button, TextField, Tabs, Tab, Box, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../Apis/ApiService';

const LoginSignup = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const toggleTab = (_, newValue) => setIsLogin(newValue === 0);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (!username || !password || !email) {
      setError('All fields are mandatory.');
      setSnackbarMessage('All fields are mandatory.');
      setOpenSnackbar(true);
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format.');
      setSnackbarMessage('Invalid email format.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const signupData = { username, password, email };
      const response = await apiService.signUp(signupData);
      if (response === true) {
        setSuccess('Signup successful!');
        setSnackbarMessage('Signup successful! You can now log in.');
        setOpenSnackbar(true);
        setTimeout(() => toggleTab(null, 0), 2000);
      } else if (response === false) {
        setError('User already exists with the entered username or email!');
        setSnackbarMessage('User already exists with the entered username or email!');
        setOpenSnackbar(true);
      } else {
        setError('Something went wrong!');
        setSnackbarMessage('Something went wrong!');
        setOpenSnackbar(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('User already exists with the entered username or email!');
        setSnackbarMessage('User already exists with the entered username or email!');
        setOpenSnackbar(true);
      } else {
        setError('Error during signup');
        setSnackbarMessage('Error during signup');
        setOpenSnackbar(true);
      }
    }
  };

  const handleLogin = async () => {
    try {
      const loginData = {
        username,
        password,
      };
      const response = await apiService.login(loginData);
      console.log("login ", response);
      if (response) {
        setSuccess('Login successful!');
        navigate('/home');
        localStorage.setItem('localStorageUsername', username);
      } else {
        setError('Login failed! Please check your credentials.');
        setSnackbarMessage('Login failed! Please check your credentials.');
        setOpenSnackbar(true);
      }
    } catch (err) {
      setError('Error during login');
      setSnackbarMessage('Error during login');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 500, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>{isLogin ? 'Login' : 'Sign Up'}</Typography>
      
      <Tabs value={isLogin ? 0 : 1} onChange={toggleTab} centered>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isLogin && (
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={isLogin ? handleLogin : handleSignup}
          fullWidth
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>
        
        {error && <Typography color="error">{error}</Typography>}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity={error ? 'error' : 'success'} onClose={() => setOpenSnackbar(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginSignup;
