import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios
import { Box, Button, useTheme, Snackbar } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { ResponsiveLine, ResponsiveContainer } from '@nivo/line';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import { useUser } from '../../userContext';



const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [separatedAudioUrls, setSeparatedAudioUrls] = useState([]);
  const [isSidebar, setIsSidebar] = useState(true);
  const [fileInput, setFileInput] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [emotionData, setEmotionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [targetedCalls, setTargetedCalls] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioUrl2, setAudioUrl2] = useState(null);
  const [audioUrl3, setAudioUrl3] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.userEmail;
  const firstName = location.state?.firstName;
  const lastName = location.state?.lastName;
  const [employeeText, setEmployeeText] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [filteredTranscriptSpeaker1, setFilteredTranscriptSpeaker1] = useState([]);
  const [filteredTranscriptSpeaker2, setFilteredTranscriptSpeaker2] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [hateSpeechPredictions, setHateSpeechPredictions] = useState([]);
  const [sarcasmResults, setSarcasmResults] = useState([]);
  const [employeeEmotions, setEmployeeEmotions] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeePredictions, setSelectedEmployeePredictions] = useState([]);
  const [employees, setEmployees] = useState([]);


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuSelect = (reportType) => {
    // Perform actions based on the selected report type
    console.log(`Selected ${reportType} Report`);
    // Close the dropdown menu
    handleMenuClose();
  };

  const getPredictionsForEmployee = async (employeeName) => {
    try {
        const response = await axios.get(`http://127.0.0.1:5001/get_predictions_for_employee_by_name/${employeeName}`);
        setSelectedEmployeePredictions(response.data.predictions);
        return response.data.predictions;  // Return the predictions
    } catch (error) {
        console.error('Error fetching predictions for employee:', error);
    }
};


const handleGenerateReport = async () => {
  console.log(selectedEmployeePredictions);

  if ( selectedEmployeePredictions.length > 0) {
    const pdf = new jsPDF();
    let yPosition = 20;
    let totalAngryCount = 0;  // Initialize counters
    let totalEmotionCount = 0;
    let totalHateSpeechCount = 0;
    let totalSarcasmCount = 0;

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
    //addTextToPDF('Overall Summary:', true);

    const summaryParagraph = `
      Total number of times 'Angry' appeared in chart data: ${totalAngryCount}.
      Total number of times 'Angry' appeared in emotions: ${totalEmotionCount}.
      Total number of hate speech predictions: ${totalHateSpeechCount}.
      Total number of sarcasm predictions: ${totalSarcasmCount}.
    `;

    //addTextToPDF(summaryParagraph, false);
    const selectedEmployee = selectedEmployeePredictions[0];
    // Calculate the total sum of all counts
    const totalSum = totalAngryCount + totalEmotionCount + totalHateSpeechCount + totalSarcasmCount;

    // Check if the total sum is greater than 5
    if (totalSum > 5) {
      // If the total sum is greater than 5, display a message indicating the need for training
    //  addTextToPDF(  `Employee ${selectedEmployee.name} is not performing well and may need training.`,true,14);
    } else {
      // If the total sum is 5 or less, display a positive message
     // addTextToPDF(`Employee ${selectedEmployee.name} is performing well and is good for the company.`,true,14);
    }

    const pdfBlob = pdf.output('blob');
    saveAs(pdfBlob, `${selectedEmployee.name}.pdf`);
    
  }
};

async function generateReportForEmployee(employeeName) {
  await getPredictionsForEmployee(employeeName);  // Wait for the API call to complete
  handleGenerateReport();  // Now, call handleGenerateReport
}
  
  
async function generateReportForEmployeeq(employeeName) {
  try {
    const predictions = await getPredictionsForEmployee(employeeName);
    
    // Sort predictions based on timestamp in descending order
    const sortedPredictions = predictions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Select the latest prediction
    const latestPrediction = sortedPredictions[0];

    // Set the selected employee predictions to the latest prediction
    setSelectedEmployeePredictions([latestPrediction]);

    // Now, call handleGenerateReport
    handleGenerateReport();
  } catch (error) {
    console.error('Error generating report for employee:', error);
  }
}
  



  const fetchHateSpeechPredictions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/get-predictions");
      const data = await response.json();

      if (response.ok) {
        const predictions = data.predictions; // Make sure the key is correct
        setHateSpeechPredictions(predictions);
        
      } else {
        console.error("Error fetching hate speech predictions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching hate speech predictions:", error);
    }
  };
  const fetchTargetedCalls = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/get_targeted_calls');
      if (response.status === 200) {
        setTargetedCalls(response.data.targeted_calls);
      } else {
        console.error('Error fetching targeted calls:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching targeted calls:', error);
    }
  };
  

  const fetchEmotions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/get-emotion");
      const data = await response.json();

      if (response.ok) {
        const emotionsData = data.results;
        console.log(data.results);
        setEmotions(emotionsData);
      } else {
        console.error("Error fetching emotions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching emotions:", error);
    }
  };

  const fetchTranscript = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/get-transcript");
      const data = await response.json();
  
      if (response.ok) {
        const allTranscript = data.transcript;
  
        const labelEmployeeText = (filteredTranscript) => {
          return filteredTranscript.map((segment) => {
            if (
              segment.text.toLowerCase().includes("oh absolutely") ||
              segment.text.toLowerCase().includes("once upon a time") ||
              segment.text.toLowerCase().includes("thank you for calling")
            ) {
              return { ...segment, label: "employee" };
            }
            return segment;
          });
        };
  
        const labeledTranscriptSpeaker1 = labelEmployeeText(
          allTranscript.filter((segment) => segment.speaker === "SPEAKER 1")
        );
  
        const labeledTranscriptSpeaker2 = labelEmployeeText(
          allTranscript.filter((segment) => segment.speaker === "SPEAKER 2")
        );
  
        setTranscript(allTranscript);
        setFilteredTranscriptSpeaker1(labeledTranscriptSpeaker1);
        setFilteredTranscriptSpeaker2(labeledTranscriptSpeaker2);
  
        // Check if any segment in Speaker 1 is labeled as "employee"
        const hasEmployeeTextInSpeaker1 = labeledTranscriptSpeaker1.some(
          (segment) => segment.label === "employee"
        );
  
        // Check if any segment in Speaker 2 is labeled as "employee"
        const hasEmployeeTextInSpeaker2 = labeledTranscriptSpeaker2.some(
          (segment) => segment.label === "employee"
        );
  
        if (hasEmployeeTextInSpeaker1) {
          // If "employee" text found in Speaker 1, set it in the employeeText state
          setEmployeeText(
            labeledTranscriptSpeaker1.map((segment) => segment.text).join(" ")
          );
        } else if (hasEmployeeTextInSpeaker2) {
          // If "employee" text found in Speaker 2, set it in the employeeText state
          setEmployeeText(
            labeledTranscriptSpeaker2.map((segment) => segment.text).join(" ")
          );
        } else {
          // If no "employee" text found, clear the employeeText state
          setEmployeeText("");
        }
  
        // Move the emotion detection call here
        handleDetectEmotions(employeeText); 
        handleDetectSarcasm(employeeText);
        handleDetectHateSpeech(employeeText);// <-- Move this line here
      } else {
        console.error("Error fetching transcript:", data.message);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };
  const handleDetectEmotions = async (text) => {
    try {
      console.log("Sending payload to server:", JSON.stringify({ speakerData: text }));
  
      const response = await fetch(`http://127.0.0.1:5001/analyze_text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ speakerData: text }),
      });
  
      console.log("Response status:", response.status);
  
      if (response.ok) {
        const result = await response.json();
        console.log("Full response from server:", result);
  
        console.log("Emotion detection results for employee text:", result.results);
        setEmployeeEmotions(result.results);
        fetchEmotions();
      } else {
        console.error("Error detecting emotions for employee text:", response.statusText);
      }
    } catch (error) {
      console.error("Error detecting emotions for employee text:", error);
    }
  };
  
  const handleDetectSarcasm = async (text) => {
    try {
      console.log("Sending payload to server:", JSON.stringify({ speakerData: text }));
  
      const response = await fetch(`http://127.0.0.1:5001/prediction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paragraph: text }),
      });
  
      console.log("Response status:", response.status);
  
      if (response.ok) {
        const result = await response.json();
        console.log(`Sarcasm detection results for :`, result);
        fetchSarcasm();
      } else {
        console.error(`Error detecting sarcasm for:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error detecting sarcasm for:`, error);
    }
  };
  
  
  const handleDetectHateSpeech = async (text) => {
    try {
        console.log("Sending payload to server:", JSON.stringify({ speakerData: text }));

        const response = await fetch(`http://127.0.0.1:5001/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: text }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Response from server:", result);
            fetchHateSpeechPredictions();
            
        } else {
            throw new Error(`Error sending data to server: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
};
const handleSavePredictions = async () => {
  try {
    // Check if sarcasmResults, hateSpeechPredictions, and emotions have data
    if (!sarcasmResults || !hateSpeechPredictions || !emotions ||
        sarcasmResults.length === 0 || hateSpeechPredictions.length === 0 || emotions.length === 0) {
      console.log('Data is missing or empty. Aborting save.');
      // Show an error message to the user or handle the situation as needed
      return;
    }

    // Generate the image from the chart container
    const chartContainer = document.getElementById('emotion-graph');

    // Use html-to-image to capture the content of the chart container
    const imageDataUrl = await htmlToImage.toJpeg(chartContainer);

    // Create a Blob from the data URL
    const imageBlob = await fetch(imageDataUrl).then((res) => res.blob());

    // Create a FormData object and append the image blob
    const formData = new FormData();
    formData.append('image', imageBlob, 'emotion-chart.jpg');

    // Include the timestamp in the formData
    const timestamp = new Date().toISOString();
    formData.append('timestamp', timestamp);

    // Send the image and timestamp to the Flask route to save
    const imageResponse = await axios.post('http://localhost:5001/save_image', formData);

    // Include the file path of the saved image and timestamp in the data
    const data = {
      name: `${firstName} ${lastName}`,
      sarcasm_predictions: sarcasmResults,
      hate_speech_predictions: hateSpeechPredictions,
      emotions: emotions,
      chartData: chartData,
      imagePath: imageResponse.data.imagePath,
      timestamp: timestamp,
    };

    // Send the updated data with timestamp to the Flask route
    const response = await axios.post('http://localhost:5001/save_predictions_with_image', data);

    if (response.status === 200) {
      console.log(response.data.message);
      // Show success message or handle as needed
    } else {
      console.error('Error saving predictions:', response.statusText);
      // Handle error
    }
  } catch (error) {
    console.error('Error saving predictions:', error);
    // Handle error
  }
};

  
  const fetchSarcasm = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/get-sarcasm-results");
      const data = await response.json();
  
      if (response.ok) {
        console.log("Sarcasm data fetched successfully:", data);
        const predictions = data.results; // Use "results" instead of "predictions"
        console.log("Predictions:", predictions);
        setSarcasmResults(predictions);
      } else {
        console.error("Error fetching sarcasm predictions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching sarcasm predictions:", error);
    }
  };

  const handleUpload = async (audioBlob) => {
    setSnackbarMessage("Please wait, audio is transcribing...");
    setSnackbarOpen(true);

    const formData = new FormData();
    formData.append('file', audioBlob, 'latestAudio.wav'); // 'file' is the field name expected by your Flask server

    try {
        const response = await axios.post('http://127.0.0.1:5001/predict_emotions_and_save', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            // Handle success, e.g., show a success message
            console.log('Audio segmented and emotions predicted successfully');
            fetchemotion();
        } else {
            // Handle error, e.g., show an error message
            console.error('Error while processing audio:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

const handleFileUpload = async (audioBlob) => {
  // Display "Please wait, audio is transcribing" message
  setSnackbarMessage("Please wait, audio is transcribing...");
  setSnackbarOpen(true);

  const formData = new FormData();
  formData.append('audioFile', audioBlob, 'latestAudio.wav'); // 'audioFile' is the field name expected by your Flask server

  try {
    const response = await axios.post('http://127.0.0.1:5001/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(response.status); // Log the status code
    const data = response.data;
    console.log(data); // Log the response data

    if (response.status === 200) {
      // Display "Audio transcription uploaded to database" message
      setSnackbarMessage(data.message);
      fetchTranscript();
    } else {
      // Display the error message from the response, or default error message
      setSnackbarMessage(data.message || "Error uploading audio");
    }
    setSnackbarOpen(true); // Open the snackbar in both cases
  } catch (error) {
    console.error("Error uploading audio:", error);
    // Display "Error uploading audio" message
    setSnackbarMessage("Error uploading audio.");
    setSnackbarOpen(true);
  }
};

const handleGetLatestAudio = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5001/latestaudio');
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl3(url);

      handleFileSeperation(blob)
        .then(() => handleFileUpload(blob))
        .catch((error) => {
          console.error('Error in promise chain:', error);
        });
    } else {
      console.error('Failed to get the latest audio');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

  const handleFileSeperation = async (audioBlob) => {
    if (!audioBlob) {
      console.log('No audio blob provided');
      return;
    }
  
    try {
      setSnackbarOpen(true);
  
      const formData = new FormData();
      formData.append('audio', audioBlob);
  
      const response = await fetch("http://127.0.0.1:5001/upload_and_predict", {
        method: "POST",
        body: formData,
       
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSnackbarMessage(data.message);
        handleGetAudio();
        handleGet();
      } else {
        console.error('Server response:', data);
        setSnackbarMessage(data.message || "Error uploading audio");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      setSnackbarMessage("Error uploading audio.");
    } finally {
      setSnackbarOpen(false);
    }
  };
  

  const handleGetAudio = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/join_segments', { responseType: 'arraybuffer' });
      if (response.status === 200) {
        // Convert the received binary data to a Blob

        const blob = new Blob([response.data], { type: 'audio/wav' });
        handleUpload(blob);
        // Create an object URL from the Blob
        const audioObjectURL = URL.createObjectURL(blob);
  
        // Set the audio URL for playback
        setAudioUrl(audioObjectURL);
        console.log('Audio joined successfully!');
        console.log("Audio URL:", audioObjectURL);
      } else {
        console.error('Error joining audio segments');
      }
    } catch (error) {
      console.error('An error occurred while joining audio segments:', error);
    }
  };
  
  const handleGet = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5001/join_segmen', { responseType: 'arraybuffer' });
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'audio/wav' });
        const audioObjectURL = URL.createObjectURL(blob);
        setAudioUrl2(audioObjectURL);
        console.log('Second Audio joined successfully!');
        console.log('Second Audio URL:', audioObjectURL);
      } else {
        console.error('Error joining the second audio segment');
      }
    } catch (error) {
      console.error('An error occurred while joining the second audio segment:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  
  
  const fetchemotion = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5001/get_emotion_data");
      setEmotionData(response.data.emotion_data);
      console.log(response.data.emotion_data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const getMaxTime = () => {
    if (emotionData.length === 0) {
      return 0; // Default value if no data is available
    }
  
    // Find the maximum time value
    return Math.max(...emotionData.map(entry => entry.time));
  };
  
  const chartData = [
    {
      id: 'Emotion',
      data: emotionData.map((entry) => ({
        x: entry.time,
        y: entry.emotion,
      })),
    },
  ];
  const { user } = useUser();

  
  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/customers");
      setCustomers(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching Customers:", error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/loginemp'); return; }
    const fetchData = async () => {
      try {
        await fetchCustomers();
        await fetchTargetedCalls();
        await handleGetLatestAudio();
        
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchemotion();
    fetchData();
  }, [employeeText]);
  const totalCustomers = customers.length;
  // ...
  useEffect(() => {
    handleSavePredictions();
  }, [sarcasmResults, hateSpeechPredictions, emotions]);
  
  

  
  return (
    <div className="app">
       <Sidebar isSidebar={isSidebar} />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        <Box m="20px">
          {/* HEADER */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
      <Header title="DASHBOARD" subtitle={`Welcome  ${user.username}`} />
            
    

      <Box>
        {/* Replace Button with a dropdown button */}
        <Button
          onClick={handleMenuOpen}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: '14px',
            fontWeight: 'bold',
            padding: '10px 20px',
          }}
        >
          <DownloadOutlinedIcon sx={{ mr: '10px' }} />
          Download Report
        </Button>
        {/* Dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {/* Add MenuItem for each report type */}
          <MenuItem  onClick={() => {
                          // Set the selected employe
                          // Fetch predictions for the selected employee by name
                          generateReportForEmployeeq(`${user.username}`);
                        }}>Latest Report</MenuItem>
          <MenuItem   onClick={() => {
                          // Set the selected employee
                          
                          // Fetch predictions for the selected employee by name
                          
                          generateReportForEmployee(`${user.username}`);
                        }}>Monthly Report</MenuItem>
        </Menu>
      </Box>
          </Box>

          {/* GRID & CHARTS */}
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="140px"
            gap="20px"
          >
            {/* ROW 1 */}
            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="10"
                subtitle=" Total Calls"
                progress="0.75"
                icon={
                  <PointOfSaleIcon
                    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                  />
                }
              />
            </Box>
            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title="5"
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
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
  title={targetedCalls.toString()}
  subtitle="Targeted Calls"
  progress="0.30"
  icon={
    <PointOfSaleIcon
      sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
    />
  }
/>
            </Box>
            <Box
              gridColumn="span 3"
              backgroundColor={colors.primary[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StatBox
                title={totalCustomers.toString()}
                subtitle="Total Customers"
                progress="0.80"
                icon={
                  <PersonAddIcon
                    sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                  />
                }
              />
            </Box>
            
<Box
              gridColumn="span 12"
              gridRow="span 3"
              backgroundColor={colors.primary[400]}
              id="emotion-graph"
              sx={{
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div>
                <h2 style={{ color: '#fff' }}>Emotion Data Over Time</h2>
                {/* Apply styles for responsiveness */}
                <div style={{ width: '100%', height: '400px' }}>
                  {/* Use ResponsiveLine as before */}
                  <ResponsiveLine
                    data={chartData}
                    margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
                    xScale={{ type: 'linear', min: 0, max: getMaxTime(), stacked: false }}
                    yScale={{
                      type: 'point',
                      stacked: false,
                    }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      orient: 'bottom',
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Time (seconds)',
                      legendOffset: 36,
                      legendPosition: 'middle',
                      format: (value) => `${value}s`,
                    }}
                    axisLeft={{
                      orient: 'left',
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Emotion',
                      legendOffset: -60,
                      legendPosition: 'middle',
                    }}
                    colors={{ scheme: 'nivo' }}
                    lineWidth={2}
                    pointSize={8}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    enablePoints={true}
                    enableGridX={false}
                    enableGridY={false}
                    theme={{
                      axis: {
                        ticks: {
                          text: {
                            fill: '#fff',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </Box>
            <Box gridColumn="span 12" gridRow="span 3" backgroundColor={colors.primary[400]} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
           
           {audioUrl && (
             <div>
               <audio controls>
                 <source src={audioUrl} type="audio/wav" />
                 Your browser does not support the audio element.
               </audio>
           
             </div>
           )}
           {audioUrl2 && (
             <div>
             <audio controls>
               <source src={audioUrl2} type="audio/wav" />
               Your browser does not support the audio element.
             </audio>
           
             </div>
           )}
           
           
           
           </Box>
          </Box>
        </Box>
      </main>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default Dashboard;