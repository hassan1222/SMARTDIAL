import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import Header from '../../components/Header';
import Side from '../global/Side';
import Topbar from '../global/Topbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';


const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSide, setIsSide] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null); // Track the selected notification
  const isNonMobile = useMediaQuery('(min-width:600px)');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/loginAdm'); return; }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/notification');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const addNotification = async () => {
    if (newNotification.trim() === '') {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/notification', {
        sender: '646ccb3bc10dbb347769d978', // Replace with a valid sender ID (Admin)
        recipient: '646be12f40c812fa1217f28a', // Replace with a valid recipient ID (Employee)
        message: newNotification,
      });

      setNewNotification('');
      fetchNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
    }

    setIsLoading(false);
  };

  const getNotificationColor = (index) => {
    const colors = ['#4cceac']; // Add more colors if needed
    return colors[index % colors.length];
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/notification/${selectedNotification._id}`);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleUpdateNotification = async () => {
    if (!selectedNotification || newNotification.trim() === '') {
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/notification/${selectedNotification._id}`, {
        message: newNotification,
      });
      setSelectedNotification(null);
      setNewNotification('');
      fetchNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  return (
    <div className="app">
      <Side isSide={isSide} />
      <main className="content">
        <Topbar setIsSide={setIsSide} />
        <Box m="20px">
          <Header title="NOTIFICATIONS" />

          {notifications.length === 0 ? (
            <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
              No notifications found.
            </Typography>
          ) : (
            <ul>
              {notifications.reverse().map((notification, index) => (
                <li key={notification._id} onClick={() => handleNotificationClick(notification)}>
                  <Box
                    sx={{
                      marginBottom: '1rem',
                      backgroundColor: getNotificationColor(index),
                      color: 'white',
                      padding: '1rem',
                    }}
                  >
                    <Typography variant="body1">
                      <strong>From:</strong> {notification.sender.name}
                      <br />
                      <strong>Message:</strong> {notification.message}
                    </Typography>
                  </Box>
                </li>
              ))}
            </ul>
          )}
          {selectedNotification && (
            <div>
              <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
                <strong>Selected Notification:</strong> {selectedNotification.message}
              </Typography>
              <Button variant="contained" onClick={handleDeleteNotification}>
                Delete
              </Button>
              
            </div>
          )}
          <div>
            <TextField
              type="text"
              value={newNotification}
              onChange={(e) => setNewNotification(e.target.value)}
              placeholder="Enter notification message"
              sx={{ marginBottom: '1rem', width: '300px' }}
            />
            <Button variant="contained" onClick={addNotification} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Notification'}
            </Button>
          </div>
        </Box>
      </main>
    </div>
  );
};

export default Notification;
