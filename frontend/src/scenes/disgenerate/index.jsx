import { useState, useEffect } from "react";
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DoneIcon from '@mui/icons-material/Done';
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import { tokens } from "../../theme";

const Disgenerate = () => {
  const theme = useTheme();
  
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [isSidebar, setIsSidebar] = useState(true);
  const navigate = useNavigate();
  const [helpempData, setHelpempData] = useState([]);


  

  const handleAddEmployeeCustomer = () => {
    navigate('/displayhelpemp');
  };

  const handleRecordNewVoice = () => {
    navigate('/disrecord');
  };

  const handleGenerateReport = () => {
    navigate('/disgenerate');
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5001/disgenerate')
      .then(response => response.json())
      .then(data => setHelpempData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="app">
      <Sidebar isSidebar={isSidebar} />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        <Box m="20px">
          <Header title="Help/Support" subtitle="Click on the button to see details of each process" />
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
          
            {helpempData.map((item, index) => (
              <div key={index}>
                <h2>{item.heading}</h2>
          <Box
            mt={2}
            p={3}
            backgroundColor={colors.primary[400]}
            borderRadius="8px"
            style={{ color: "white" , fontSize: "15px"}}
          >
                <p>{item.text}</p>
              </Box>
              </div>
            ))}
          
        </Box>
      </main>
    </div>
  );
};

export default Disgenerate;
