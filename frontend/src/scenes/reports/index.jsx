import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, useTheme, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
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

const Reports = () => {
  const [isSide, setIsSide] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [predictions, setPredictions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeePredictions, setSelectedEmployeePredictions] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today's date

  // Define the function before using it
  const getPreviousDates = () => {
    const today = new Date();
    const options = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      options.push(date.toISOString().split('T')[0]);
    }
    return options;
  };

  const dateRangeOptions = getPreviousDates();

  const StyledTableHead = styled(TableHead)`
    background-color: #3e4396;
    color: white;
  `;

  const StyledTableBody = styled(TableBody)`
    background-color: #1f2a40;
    color: white;
  `;

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/employee');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const getPredictionsForEmployee = async (employeeName, selectedDate) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5001/get_predictions_for_employee_by_name/${employeeName}`, {
        params: {
          date: selectedDate.toISOString().split('T')[0], // Pass selected date to the API
        },
      });
      setSelectedEmployeePredictions(response.data.predictions);
      return response.data.predictions;
    } catch (error) {
      console.error('Error fetching predictions for employee:', error);
    }
  };

  const handleGenerateReport = async () => {
    console.log(selectedEmployeePredictions);

  if (selectedEmployee && selectedEmployeePredictions.length > 0) {
    const pdf = new jsPDF();
    let yPosition = 20;
    let totalAngryCount = 0;  // Initialize counters
    let totalEmotionCount = 0;
    let totalHateSpeechCount = 0;
    let totalSarcasmCount = 0;
    let EmotionCount=0
    

    const addTextToPDF = (text, isBold = false, fontSize = 12) => {
      const maxWidth = pdf.internal.pageSize.width - 40;
      const lines = pdf.splitTextToSize(text, maxWidth);

      lines.forEach((line, index) => {
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }

        pdf.setFontSize(fontSize);
        pdf.text(20, yPosition, line);
        yPosition += 20; // Adjust line height as needed

        if (yPosition > pdf.internal.pageSize.height - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    };

    for (let index = 0; index < selectedEmployeePredictions.length; index++) {
      const employeePrediction = selectedEmployeePredictions[index];

      // Display time
      addTextToPDF(`Employee Report for ${employeePrediction.name}`, true, 18);
      

      // Display report generated timestamp
      addTextToPDF(`Report generated on: ${employeePrediction.timestamp}`, true);
    
      let angryCount = 0;

      // Count occurrences of 'angry' in chart data
      employeePrediction.chart_data.forEach((chart) => {
        chart.data.forEach((dataPoint) => {
          if (dataPoint.y.toLowerCase() === 'angry') {
            angryCount++;
          }
        });
      });

      // Update total angry count
      totalAngryCount += angryCount;

      

      // Count occurrences of 'angry' in emotions
      const angryEmotionCount = employeePrediction.emotions.filter(
        (emotion) => emotion.emotion.toLowerCase() === 'anger'
      ).length;

      // Update total emotion count
      totalEmotionCount += angryEmotionCount;

      // Display chart data
      
      employeePrediction.chart_data.forEach((chart) => {
        chart.data.forEach((dataPoint) => {
        });
      });
      

      // Display graph image
      addTextToPDF('Emotion Chart:', true);
      const imgData = `http://127.0.0.1:5001/get_image/${employeePrediction.image_path.split('\\').pop()}`;

      // Assuming the image is a JPEG. Adjust the format if it's different.
      pdf.addImage(imgData, 'JPEG', 20, yPosition, 160, 80);
      yPosition += 100;
      addTextToPDF(`Number of times 'Angry' appeared in Graph: ${angryCount}`, true);

      // Display emotions and sentences
      addTextToPDF('Emotions and Sentences:', true);
      employeePrediction.emotions.forEach((emotion) => {
        addTextToPDF(`Emotion: ${emotion.emotion}, Sentence: ${emotion.sentence}`);
        EmotionCount++;
      });
      addTextToPDF(`Number of times 'Angry' appeared in emotions: ${angryEmotionCount}`, true);
    

      // Add hate speech predictions
      const hateSpeechPredictions = employeePrediction.hate_speech_predictions.filter(
        (prediction) => prediction.label === 1
      );

      // Update total hate speech count
      totalHateSpeechCount += hateSpeechPredictions.length;

      if (hateSpeechPredictions.length > 0) {
        addTextToPDF('Hate Speech Predictions:', true);
        hateSpeechPredictions.forEach((prediction) => {
          addTextToPDF(`Sentence: ${prediction.sentence},`);
        });
        addTextToPDF('', true);
      }

      // Add sarcasm predictions
      const sarcasmPredictions = employeePrediction.sarcasm_predictions.filter(
        (prediction) => prediction.prediction === 'Sarcastic'
      );

      // Update total sarcasm count
      totalSarcasmCount += sarcasmPredictions.length;

      if (sarcasmPredictions.length > 0) {
        addTextToPDF('Sarcasm Predictions:', true);
        sarcasmPredictions.forEach((prediction) => {
          addTextToPDF(`Sentence: ${prediction.sentence}, Prediction: ${prediction.prediction},`);
        });
      }

      // Add a page break between employee reports
      if (index < selectedEmployeePredictions.length - 1) {
        pdf.addPage();
        yPosition = 20;
      }
    }

    // Display overall summary at the top after the loop has completed
    addTextToPDF('Overall Summary:', true);

    const summaryParagraph = `
      Total number of times 'Angry' appeared in chart data: ${totalAngryCount}.
      Total number of times 'Angry' appeared in emotions: ${totalEmotionCount}.
      Total number of hate speech predictions: ${totalHateSpeechCount}.
      Total number of sarcasm predictions: ${totalSarcasmCount}.
      Total number of emotion sentences: ${EmotionCount}.
    `;

    addTextToPDF(summaryParagraph, false);
    const selectedEmployee = selectedEmployeePredictions[0];
    // Calculate the total sum of all counts
    const totalSum = totalAngryCount + totalEmotionCount + totalHateSpeechCount + totalSarcasmCount;
    const percentage = (totalSum / EmotionCount) * 100;

    addTextToPDF(`The total percentage is: ${percentage.toFixed(2)}%`);
    
    // Check if the percentage is greater than 5
    if (percentage > 30) {
      // If the percentage is greater than 5, display a message indicating the need for training in red
      pdf.setTextColor(255, 0, 0); // Set text color to red
      addTextToPDF(
        `Employee ${selectedEmployee.name} is not performing well and may need training.`,
        true,
        14
      );
    } else {
      // If the percentage is 5 or less, display a positive message in green
      pdf.setTextColor(0, 128, 0); // Set text color to green
      addTextToPDF(
        `Employee ${selectedEmployee.name} is performing well and is good for the company.`,
        true,
        14
      );
    }
    
    // Reset text color to black
    pdf.setTextColor(0, 0, 0);

    const pdfBlob = pdf.output('blob');
    saveAs(pdfBlob, `Combined_Employee_Reports.pdf`);
  }
};


async function generateReportForEmployee(employeeName) {
  try {
    const predictions = await getPredictionsForEmployee(employeeName, selectedDate);

    // Sort predictions based on timestamp in descending order
    const sortedPredictions = predictions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Set the selected employee predictions to all predictions in descending order
    setSelectedEmployeePredictions(sortedPredictions);

    // Now, call handleGenerateReport
    
  } catch (error) {
    console.error('Error generating report for employee:', error);
  }
}

const handleDateChange = (newDate) => {
  setSelectedDate(newDate);
};
  
  
async function generateReportForEmployeeq(employeeName) {
  try {
    const predictions = await getPredictionsForEmployee(employeeName, selectedDate);
    
    // Sort predictions based on timestamp in descending order
    const sortedPredictions = predictions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Select the latest prediction
    const latestPrediction = sortedPredictions[0];

    // Set the selected employee predictions to the latest prediction
    setSelectedEmployeePredictions([latestPrediction]);

    // Now, call handleGenerateReport
  
  } catch (error) {
    console.error('Error generating report for employee:', error);
  }
}
  
  useEffect(() => {
    // Fetch predictions from the server
    fetchEmployees();
    
  }, []);

  useEffect(() => {
    // Check if selectedEmployeePredictions has changed
    if (selectedEmployeePredictions.length > 0) {
      // Now, call handleGenerateReport
      handleGenerateReport();
    }
  }, [selectedEmployeePredictions]);

  return (
    <div className="app">
      <Side isSide={isSide} />
      <main className="content">
        <Topbar setIsSide={setIsSide} />
        <Box m="20px">
          <Header title="Reports" subtitle="All the reports will be displayed here." />
          <TableContainer component={Paper}>
            <Table>
            <StyledTableHead>
        <TableRow>
          <TableCell>First Name</TableCell>
          <TableCell>Last Name</TableCell>
          <TableCell>
  
</TableCell>
          <TableCell>
  {/* Dropdown for date selection */}
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

        </TableRow>
      </StyledTableHead>
              <StyledTableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>{employee.firstName}</TableCell>
                    <TableCell>{employee.lastName}</TableCell>
                    <TableCell>
                      
                    </TableCell>
                    <TableCell>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          // Set the selected employee
                          setSelectedEmployee(employee);
                          // Fetch predictions for the selected employee by name
                          generateReportForEmployee(`${employee.firstName} ${employee.lastName}`);
                        }}
                      >
                        Monthly Report
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          // Set the selected employee
                          setSelectedEmployee(employee);
                          // Fetch predictions for the selected employee by name
                          generateReportForEmployeeq(`${employee.firstName} ${employee.lastName}`);
                        }}
                      >
                        latest call report
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                ))}
              </StyledTableBody>
            </Table>
          </TableContainer>
        </Box>
      </main>
    </div>
  );
};

export default Reports;
