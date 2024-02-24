import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  Button,
  Snackbar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isSidebar, setIsSidebar] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [filteredTranscriptSpeaker1, setFilteredTranscriptSpeaker1] = useState([]);
  const [filteredTranscriptSpeaker2, setFilteredTranscriptSpeaker2] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [hateSpeechPredictions, setHateSpeechPredictions] = useState([]);
  const [sarcasmResults, setSarcasmResults] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [latestAudio, setLatestAudio] = useState(null);
  const [employeeText, setEmployeeText] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [employeeEmotions, setEmployeeEmotions] = useState([]);


  const navigate = useNavigate();

  
  // Function to filter text and update the Employee box

  function getEmotionColor(emotion) {
    switch (emotion) {
      case "joy":
        return "lightgreen";
      case "anger":
        return "red";
      case "sadness":
        return "yellow";
      default:
        return "inherit"; // Use the default color for other emotions
    }
  }
  
  

  const handleGetLatestAudio = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5001/latestaudio'); // Assuming your Flask server is running on the same host
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
  
        // Call handleFileUpload with the audio blob
        
      } else {
        console.error('Failed to get the latest audio');
      }
    } catch (error) {
      console.error('Error:', error);
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
  

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  // ...

  const fetchTranscript = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/get-transcript");
      const data = await response.json();
  
      if (response.ok) {
        const allTranscript = data.transcript;
  
        const labelEmployeeText = (filteredTranscript) => {
          return filteredTranscript.map((segment) => {
            if (
              segment.text.toLowerCase().includes("i've never met") ||
              segment.text.toLowerCase().includes("people") ||
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
        // <-- Move this line here
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

  const sendSpeakerDataToServer = async (speakerData, speakerName) => {
    try {
      const textData = speakerData.map(segment => segment.text).join(' ');
  
      const response = await fetch(`http://127.0.0.1:5001/analyze_text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ speakerData: textData }),
      });
  
      if (response.ok) {
        console.log(`Transcript data for ${speakerName} sent to server.`);
      } else {
        console.error(`Error sending transcript data for ${speakerName} to server:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error sending transcript data for ${speakerName} to server:`, error);
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


  const formatTime = (time) => {
    const date = new Date(time);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const fetchEmotions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5001/get-emotion");
      const data = await response.json();

      if (response.ok) {
        const emotionsData = data.results;
        setEmotions(emotionsData);
      } else {
        console.error("Error fetching emotions:", data.message);
      }
    } catch (error) {
      console.error("Error fetching emotions:", error);
    }
  };
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
  
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/loginemp');
      return;
    }
  
    fetchTranscript();
    fetchSarcasm();
    fetchHateSpeechPredictions();
    fetchEmotions();

  }, [employeeText]); // Empty dependency array means it runs once when the component mounts
  


 
  

  return (
    <div className="app">
      <Sidebar isSidebar={isSidebar} />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        <Box m="20px">
          <Header
            title="Speech to Text"
            subtitle="upload an audio and emotions will be displayed back to you"
          />
   
          <h2 style={{ color: "white" }}>Transcription</h2>
          <Box
            mt={2}
            p={3}
            backgroundColor={colors.primary[400]}
            borderRadius="8px"
            style={{ color: "white" , fontSize: "15px"}}
          >
            {transcript.map((segment, index) => (
              <div key={index}>
                <p>{segment.speaker} {formatTime(segment.time)}</p>
                <p>{segment.text}</p>
              </div>
            ))}
          </Box>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "48%" }}>
              <h2 style={{ color: "white" }}>Speaker 1</h2>
              <Box
                mt={2}
                p={3}
                backgroundColor={colors.primary[400]}
                borderRadius="8px"
                style={{ color: "white", fontSize: "15px"}}
              >
                {filteredTranscriptSpeaker1.map((segment, index) => (
                  <div key={index}>
                    <p>{formatTime(segment.time)}</p>
                    <p>{segment.text}</p>
                  </div>
                ))}
              </Box>
            </div>
            <div style={{ width: "48%" }}>
              <h2 style={{ color: "white" }}>Speaker 2</h2>
              <Box
                mt={2}
                p={3}
                backgroundColor={colors.primary[400]}
                borderRadius="8px"
                style={{ color: "white" }}
              >
                {filteredTranscriptSpeaker2.map((segment, index) => (
                  <div key={index}>
                    <p>{formatTime(segment.time)}</p>
                    <p>{segment.text}</p>
                  </div>
                ))}
              </Box>
            </div>
          </div>

          <div style={{ width: "100%" }}>
            <h2 style={{ color: "white" }}>Employee Text</h2>
            <Box
              mt={2}
              p={3}
              backgroundColor={colors.primary[400]}
              borderRadius="8px"
              style={{ color: "white", fontSize: "15px" }}
            >
              <p>{employeeText}</p>
            </Box>
          </div>

          


          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
          />
        </Box>
      </main>
    </div>
  );
};
export default FAQ;