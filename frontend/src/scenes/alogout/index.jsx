// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, useTheme, Snackbar, TextField } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import Side from "../global/Side";
import Topbar from "../global/Topbar";
import axios from 'axios';

const AdminProfile = () => {
  const [isSide, setIsSide] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [totalReports, setTotalReports] = useState(0);
  const [pdfList, setPdfList] = useState([]);
  const [targetedCalls, setTargetedCalls] = useState('');

  const handleSignOut = () => {
    navigate('/loginAdm');
  };

  const [showCredentials, setShowCredentials] = useState(false);

  const handleShowCredentials = async () => {
    setShowCredentials(true);

    try {
      const response = await axios.get('http://localhost:8080/api/admin');
      const { email, password } = response.data;

      setEmail(email);
      setPassword(password);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/employee");
      setEmployees(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAllPdfs = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/get_all_pdfs');

      if (response.status === 200) {
        const pdfList = response.data.pdfList.map(pdf => ({ ...pdf, isDownloaded: false })).reverse();
        setPdfList(pdfList);

        const totalReportsCount = pdfList.length;
        setTotalReports(totalReportsCount);
        
        console.log(pdfList);
      } else {
        console.error('Error fetching all PDFs:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching all PDFs:', error);
    }
  };

  const handleSaveTargetedCalls = async () => {
    try {
      const response = await axios.post('http://localhost:5001/save_targeted_calls', {
        targeted_calls: parseInt(targetedCalls, 10),
      });

      console.log(response.data.message);
    } catch (error) {
      console.error('Error saving targeted calls:', error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/loginAdm');
      return;
    }
    fetchEmployees();
    fetchAllPdfs();
  }, []);

  const totalEmployees = employees.length;

  return (
    <div className="app">
      <Side isSide={isSide} />
      <main className="content">
        <Topbar setIsSide={setIsSide} />
        <Box m="20px">
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="140px"
            gap="20px"
          >
           
            <Box
              gridColumn="span 4"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="100"
                subtitle="Today Calls"
                progress="0.50"
                icon={
                  <PointOfSaleIcon
                    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                  />
                }
              />
            </Box>
            <Box
              gridColumn="span 4"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title={totalReports.toString()}
                subtitle="Total Reports "
                progress="0.30"
                icon={
                  <PointOfSaleIcon
                    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                  />
                }
              />
            </Box>
            <Box
              gridColumn="span 4"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title={totalEmployees.toString()} 
                subtitle="Total Employees"
                progress="0.80"
                increase="+43%"
                icon={
                  <PersonAddIcon
                    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                  />
                }
              />
            </Box>
            <Box
              gridColumn="span 12"
              gridRow="span 4"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <div style={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h5" color="textSecondary">
                  Targeted Calls
                </Typography>
                <Box mt={2}>
                  <TextField
                    type="number"
                    label="Enter targeted calls"
                    variant="outlined"
                    size="small"
                    value={targetedCalls}
                    onChange={(e) => setTargetedCalls(e.target.value)}
                    style={{ width: '150px', textAlign: 'center' }}
                  />
                </Box>
                <Box mt={2}>
                  <Button variant="contained" onClick={handleSaveTargetedCalls}>
                    Save Targeted Calls
                  </Button>
                </Box>
              </div>
            </Box>
          </Box>
        </Box>
      </main>
    </div>
  );
};

export default AdminProfile;
