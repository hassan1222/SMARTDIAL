import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  useTheme,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { tokens } from '../../theme';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DoneIcon from '@mui/icons-material/Done';
import Header from '../../components/Header';
import Side from '../global/Side';
import Topbar from '../global/Topbar';
import axios from 'axios';
import { saveAs } from 'file-saver';

const Help = () => {
  const [isSide, setIsSide] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [pdfList, setPdfList] = useState([]);

  const handleAddEmployeeCustomer = () => {
     navigate('/helpemp');
  };

  const handleRecordNewVoice = () => {
     navigate('/recordvoice');
  };

  const handleGenerateReport = () => {
    navigate('/generatereport');
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
              style={{ color: 'white' }} // Set the text color to white
            >
              Add Employee/Customer
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleRecordNewVoice}
              style={{ color: 'white' }} // Set the text color to white
            >
              Record New Voice
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleGenerateReport}
              style={{ color: 'white' }} // Set the text color to white
            >
              Generate Report
            </Button>
          </Box>
          <h3>CLICK ON THE BUTTONS TO ADD HELP AND SUPPORT</h3>
        </Box>
      </main>
    </div>
  );
};

export default Help;
