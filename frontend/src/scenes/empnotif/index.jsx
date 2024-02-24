import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import { Box } from "@mui/material";
import Typography from '@mui/material/Typography';
import Header from "../../components/Header";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from 'react-router-dom';

const Empnotification = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebar, setIsSidebar] = useState(true);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/loginemp'); return; }
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

  const getNotificationColor = (index) => {
    const colors = ['#4cceac']; // Add more colors if needed
    return colors[index % colors.length];
  };

  return (
    <div className="app">
      <Sidebar isSidebar={isSidebar} />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        <Box m="20px">
          <Header title="NOTIFICATIONS"/>
          
          {notifications.length === 0 ? (
            <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
              No notifications found.
            </Typography>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {notifications.reverse().map((notification, index) => (
                <li key={notification._id}>
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
        </Box>
      </main>
    </div>
  );
};

export default Empnotification;
