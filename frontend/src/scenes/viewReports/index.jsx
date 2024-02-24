
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
  Select,
  MenuItem,
} from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DoneIcon from '@mui/icons-material/Done';
import Header from "../../components/Header";
import Side from "../global/Side";
import Topbar from "../global/Topbar";
import axios from 'axios';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

import { styled } from "@mui/system";

const StyledTableHead = styled(TableHead)`
  background-color: #3e4396;
  color: white;
`;

const ViewReports = () => {
  const [isSide, setIsSide] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [predictions, setPredictions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeePredictions, setSelectedEmployeePredictions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date()); // Add state for end date
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [emotionCount, setEmotionCount] = useState(0);
  const [latestCallPercentages, setLatestCallPercentages] = useState(null);


  // Additional state variables for counts
  const [angerCount, setAngerCount] = useState(0);
  const [angryInChartDataCount, setAngryInChartDataCount] = useState(0);
  const [hateSpeechCount, setHateSpeechCount] = useState(0);
  const [sarcasmCount, setSarcasmCount] = useState(0);

let callNumber = 0;
  const getPreviousDates = () => {
    const today = new Date();
    const options = [];
    for (let i = 0; i < 100; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      options.push(date.toISOString().split('T')[0]);
    }
    return options;
  };

  const dateRangeOptions = getPreviousDates();

  const fetchLatestCallPercentages = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/get_latest_call_percentages');
      setLatestCallPercentages(response.data);
      console.log("graph ", response.data )
    } catch (error) {
      console.error('Error fetching latest call percentages:', error);
    }
  };
  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/employee');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
   
  }, []);

  const handleEmployeeChange = (event) => {
    const selectedEmployeeId = event.target.value;
    const selectedEmployeeObj = employees.find((employee) => employee._id === selectedEmployeeId);
    
    setSelectedEmployee(selectedEmployeeObj);
    console.log("Selected Employee:", `${selectedEmployeeObj.firstName} ${selectedEmployeeObj.lastName}`);
  };

  const handleGetResult = async () => {
    try {
      const start_date = selectedDate.toISOString().split('T')[0];
      const end_date = selectedEndDate.toISOString().split('T')[0];
  
      const apiUrl = `http://127.0.0.1:5001/predictions_for_employee_by_name/${encodeURIComponent(
        `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
      )}?start_date=${start_date}&end_date=${end_date}`;
  
      const response = await axios.get(apiUrl);
      const employeePredictions = response.data.predictions;
      setSelectedEmployeePredictions(employeePredictions);
  
      // Update the state to show predictions
      setShowPredictions(true);
  
      // Optional: Show a success message using Snackbar
      setSnackbarOpen(true);
  
      // Reset the counts before updating
      setAngerCount(0);
      setAngryInChartDataCount(0);
      setHateSpeechCount(0);
      setSarcasmCount(0);
      setEmotionCount(0);
  
      // Additional state variable to store call percentages
      const callPercentages = [];
  
      // Iterate through predictions to update counts
      employeePredictions.forEach((prediction, index) => {
        // Count occurrences of "anger" in emotion sentences
        prediction.emotions.forEach((emotion) => {
          if (emotion.emotion.toLowerCase() === 'anger') {
            setAngerCount((prevCount) => prevCount + 1);
          }
          setEmotionCount((prevCount) => prevCount + 1);
        });
  
        // Count occurrences of "angry" in chart data
        prediction.chart_data.forEach((chart) => {
          chart.data.forEach((dataPoint) => {
            if (dataPoint.y.toLowerCase().includes('angry')) {
              setAngryInChartDataCount((prevCount) => prevCount + 1);
            }
          });
        });
  
        // Count occurrences of sarcasm
        prediction.sarcasm_predictions.forEach((sarcasm) => {
          if (sarcasm.prediction === 'Sarcastic') {
            setSarcasmCount((prevCount) => prevCount + 1);
          }
        });
  
        // Count occurrences of hate speech
        prediction.hate_speech_predictions.forEach((hateSpeech) => {
          if (hateSpeech.label === 1) {
            setHateSpeechCount((prevCount) => prevCount + 1);
          }
        });
  
        // Calculate percentage for each call
        const percentage =
          emotionCount > 0
            ? ((angerCount + angryInChartDataCount + hateSpeechCount + sarcasmCount) / emotionCount) * 100
            : 0;
  
        // Update call percentages
        callPercentages.push({ callNumber: index + 1, percentage: percentage.toFixed(2) });
      });
  
      // Send call percentages to Flask backend after all calls
      await axios.post('http://127.0.0.1:5001/save_call_percentages', {
        employeeId: selectedEmployee._id,
        callPercentages: callPercentages,
      });
  
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };
  

  return (
    <div className="app">
      <Side isSide={isSide} />
      <main className="content">
        <Topbar setIsSide={setIsSide} />
        <Box m="20px">
          <Header title="View Reports" subtitle="All the reports will be viewed here." />
          <TableContainer component={Paper}>
            <Table>
              <StyledTableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">Select an Employee:</Typography>
                    <Select
                      value={selectedEmployee ? selectedEmployee._id : ''}
                      onChange={handleEmployeeChange}
                      style={{ color: 'white' }}
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee._id} value={employee._id}>
                          {`${employee.firstName} ${employee.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Start Date:</Typography>
                    <select
                      style={{
                        padding: '8px',
                        fontSize: '14px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        minWidth: '150px',
                      }}
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(`${e.target.value}T00:00:00.000Z`))}
                    >
                      {dateRangeOptions.map((date) => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">End Date:</Typography>
                    <select
                      style={{
                        padding: '8px',
                        fontSize: '14px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        minWidth: '150px',
                      }}
                      value={selectedEndDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedEndDate(new Date(`${e.target.value}T00:00:00.000Z`))}
                    >
                      {dateRangeOptions.map((date) => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGetResult}
                    >
                      Get Result
                    </Button>
                  </TableCell>
                 
                </TableRow>
              </StyledTableHead>
            </Table>
          </TableContainer>
          <Box mt="20px">

            <h2 style={{ color: "white" }}>Predictions for the selected employee</h2>
          <Box
            mt={2}
            p={3}
            backgroundColor={colors.primary[400]}
            borderRadius="8px"
            style={{ color: "white" , fontSize: "15px"}}
          >
            {showPredictions && (
              <div>
                {/* Assuming selectedEmployeePredictions is an array */}
                {selectedEmployeePredictions.map((prediction, index) => (
                  <div key={index}>
                    <Typography variant="h4">Name: {prediction.name}</Typography>
                    <Typography variant="h4">Timestamp: {prediction.timestamp}</Typography>
                    <Typography variant="h4">{'call ' + ++callNumber + ' '}</Typography>
                  

                    {/* Display Emotions */}
                    <div>
  <Typography variant="h4">Emotions:</Typography>
  <ul>
    {prediction.emotions.map((emotion, i) => (
      <li
        key={i}
        style={{
          color:
            emotion.emotion.toLowerCase() === 'joy'
              ? 'lightgreen'
              : emotion.emotion.toLowerCase() === 'sadness'
              ? 'yellow'
              : emotion.emotion.toLowerCase() === 'anger'
              ? 'red'
              : 'white', // Default color for other emotions
        }}
      >
        {emotion.emotion}: {emotion.sentence}
      </li>
    ))}
  </ul>
</div>
                    {prediction.sarcasm_predictions.length > 0 && (
  <div>
    <Typography variant="h4">Sarcasm Predictions:</Typography>
    <ul>
      {prediction.sarcasm_predictions.map((sarcasm, i) => (
        // Display only if sarcasm is detected (prediction === 'Sarcastic')
        sarcasm.prediction === 'Sarcastic' && (
          <li key={i} style={{ color: 'orange' }}>Sentence: {sarcasm.sentence}, Prediction: {sarcasm.prediction}</li>
        )
      ))}
    </ul>
  </div>
)}

<div>
  <Typography variant="h4">Emotion Chart:</Typography>
  {prediction.chart_data.map((chart, chartIndex) => (
    <div key={chartIndex}>
      <Typography variant="h6">Chart {chartIndex + 1}:</Typography>
      <ul>
        {chart.data.map((dataPoint, dataPointIndex) => (
          <li key={dataPointIndex}>{dataPoint.x}: {dataPoint.y}</li>
        ))}
      </ul>
    </div>
  ))}
</div>

{prediction.hate_speech_predictions.length > 0 && (
  <div>
    <Typography variant="h4">Hate Speech Predictions:</Typography>
    <ul>
      {prediction.hate_speech_predictions.map((hateSpeech, i) => (
        // Display only if hate speech is detected (label === 1)
        hateSpeech.label === 1 && (
          <li key={i} style={{ color: 'red' }}>Sentence: {hateSpeech.sentence}</li>
        )
      ))}
    </ul>
  </div>
)}


                    {/* Display Graph Image */}
                    <div>
                      <Typography variant="h4">Emotion Chart:</Typography>
                      <img
                        src={`http://127.0.0.1:5001/get_image/${prediction.image_path.split('\\').pop()}`}
                        alt="Emotion Chart"
                        style={{ maxWidth: '100%' }}
                      />
                    </div>

                    {/* Add a page break between employee reports */}
                    {index < selectedEmployeePredictions.length - 1 && <hr />}
                  </div>
                  
                ))}
                
              </div>
              
            )}

</Box>
            {/* Optional: Snackbar for success message */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={() => setSnackbarOpen(false)}
              message="Predictions fetched successfully."
            />
            
            {/* Display the counts */}
            <h2 style={{ color: "white" }}>Overall Summary:</h2>
          <Box
            mt={2}
            p={3}
            backgroundColor={colors.primary[400]}
            borderRadius="8px"
            style={{ color: "white" , fontSize: "15px"}}
          >
<Typography variant="h4">Emotions Count:</Typography>
<ul>
  <li>Anger: {angerCount}</li>
</ul>

<Typography variant="h4">Angry in Chart Data Count:</Typography>
<ul>
  <li>Angry: {angryInChartDataCount}</li>
</ul>

<Typography variant="h4">Sarcasm Count:</Typography>
<ul>
  <li>Sarcasm: {sarcasmCount}</li>
</ul>

<Typography variant="h4">Hate Speech Count:</Typography>
<ul>
  <li>Hate Speech: {hateSpeechCount}</li>
</ul>

<Typography variant="h4">Percentage:</Typography>
<Typography variant="body1">
  {(emotionCount > 0 ? ((angerCount + angryInChartDataCount + hateSpeechCount + sarcasmCount) / emotionCount) * 100 : 0).toFixed(2)}%
</Typography>
</Box>
{/* Conditional rendering based on the overall summary percentage */}
<Typography variant="h4" style={{ color: emotionCount > 0 && ((angerCount + angryInChartDataCount + hateSpeechCount + sarcasmCount) / emotionCount) * 100 > 35 ? 'red' : 'green' }}>
  {emotionCount > 0 && ((angerCount + angryInChartDataCount + hateSpeechCount + sarcasmCount) / emotionCount) * 100 > 35
    ? 'Employee needs chatbot training'
    : 'Employee doesn\'t need chatbot training'}
</Typography>
          </Box>
        </Box>
      </main>
    </div>
  );
};

export default ViewReports;