import React, { useState, useEffect } from 'react';
import { FaSignInAlt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isError) {
      alert(message);
    }
  }, [isError, message]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, save the token to local storage
        localStorage.setItem('adminToken', data.token);
        navigate('/profile');
      } else {
        // Login failed
        setIsError(true);
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setIsError(true);
      setMessage('An error occurred while logging in.');
    }

    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <CircularProgress size={35} />
        </div>
      ) : (
        <>
          <section style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', position: 'relative' }}>
              <Typography variant="h1" component="h1" sx={{ mb: '20px', color: '#4cceac' }}>
                Smart Dial
              </Typography>
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%',
                  height: '5px',
                  backgroundColor: 'white',
                }}
              />
            </h1>
            <p style={{ fontSize: '1.5rem' }}> ADMIN PORTAL </p>
          </section>
          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '350px',
              padding: '2rem',
              borderRadius: '4px',
              backgroundColor: '#1f2a40',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
              margin: '0 auto', // Center horizontally
              marginTop: '50px', // Add margin-top to center vertically
            }}
          >
            <TextField
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              variant="outlined"
              fullWidth
              sx={{ marginBottom: '1rem' }}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              variant="outlined"
              fullWidth
              sx={{ marginBottom: '1rem' }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: '4px' }}
            >
              Login
            </Button>
          </Box>
          <p style={{ marginTop: '1rem', fontSize: '1rem', textAlign: 'center' }}>
            Don't have an account? <Link to="/adminr">Register admin</Link>
          </p>
        </>
      )}
    </>
  );
};

export default AdminLogin;
