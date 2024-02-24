import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  NativeSelect,
} from "@mui/material";
import { Formik } from "formik";
import { useNavigate } from 'react-router-dom';
import * as yup from "yup";
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DoneIcon from '@mui/icons-material/Done';
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";

const Helpsupport = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [isSidebar, setIsSidebar] = useState(true);
  const navigate = useNavigate();

  const handleAddEmployeeCustomer = () => {
    navigate('/displayhelpemp');
 };

 const handleRecordNewVoice = () => {
   // Handle logic for recording new voice
   // Example: navigate('/record-voice');
 };

 const handleGenerateReport = () => {
   // Handle logic for generating reports
   // Example: navigate('/generate-report');
 };

 useEffect(() => {}, []);

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
         </Box>
      </main>
    </div>
  );
};


export default Helpsupport;