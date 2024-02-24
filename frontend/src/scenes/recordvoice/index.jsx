import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  TextField,
  Input,
  useTheme,
  Snackbar,
} from '@mui/material';
import { tokens } from '../../theme';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DoneIcon from '@mui/icons-material/Done';
import Header from '../../components/Header';
import Side from '../global/Side';
import Topbar from '../global/Topbar';
import axios from 'axios';

const Recordd = () => {
  
  const [isSide, setIsSide] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [heading, setHeading] = useState('');
  const [text, setText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleAddEmployeeCustomer = () => {
    navigate('/helpemp');
  };

  const handleRecordNewVoice = () => {
    navigate('/recordvoice');
  };

  const handleGenerateReport = () => {
    navigate('/generatereport');
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('heading', heading);
      formData.append('text', text);

      const response = await axios.post('http://127.0.0.1:5001/recordv', formData);

      // Handle the response as needed
      console.log(response.data);

      // Show Snackbar on successful submission
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {}, []);

  return (
    <div className="app">
      <Side isSide={isSide} />
      <main className="content">
        <Topbar setIsSide={setIsSide} />
        <Box m="20px">
          <Header title="Help/Support" subtitle="Enter help and support." />
          <Box display="flex" justifyContent="flex-start">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DoneIcon />}
              onClick={handleAddEmployeeCustomer}
              style={{ color: 'white' }}
            >
              Add Employee/Customer
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleRecordNewVoice}
              style={{ color: 'white' }}
            >
              Record New Voice
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateReport}
              style={{ color: 'white' }}
            >
              Generate Report
            </Button>
          </Box>
          <h3>Enter help/support for recording new voice</h3>
          <Box display="flex" flexDirection="column" alignItems="flex-start" marginTop="20px">
            <TextField
              label="Heading"
              variant="outlined"
              fullWidth
              margin="normal"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
            <TextField
              label="Text"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              variant="outlined"
              style={{ backgroundColor: 'blue', color: 'white', marginTop: '10px' }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message="Submission successful!"
          />
        </Box>
      </main>
    </div>
  );
};

export default Recordd;
