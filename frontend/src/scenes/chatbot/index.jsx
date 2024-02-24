import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Box, Button } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import useMediaQuery from "@mui/material/useMediaQuery";
import AudioAnalyser from "react-audio-analyser";
import Header from "../../components/Header";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import BotpressChatbot from "../botpressChatbot";

const Chatbot = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const [audioList, setAudioList] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [isSidebar, setIsSidebar] = useState(true);
  const [audioType, setAudioType] = useState("audio/wav");
  const [audioSrc, setAudioSrc] = useState("");
  const [status, setStatus] = useState("");

  const controlAudio = (newStatus) => {
    setStatus(newStatus);
  }

  const changeScheme = (e) => {
    setAudioType(e.target.value);
  }

  const stopCallback = (e) => {
    setAudioSrc(window.URL.createObjectURL(e));

    const formData = new FormData();
    formData.append('audio', e);

    axios.post('http://127.0.0.1:5001/processaud', formData)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error sending audio:', error);
      });
  }

  const handleNextClick = () => {
    setCurrentAudioIndex(prevIndex => prevIndex + 1);
  };

  useEffect(() => {
    axios.get("http://localhost:5001/practicee")
      .then(response => {
        setAudioList(response.data);
      })
      .catch(error => {
        console.error("Error fetching audio data:", error);
      });
  }, []);

  const buttonStyle = {
    fontSize: '1.0rem',
    padding: '0.2rem 0.5rem',
    backgroundColor: '#4cceac',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    marginRight: '5px',
  };

  const audioProps = {
    audioType,
    status,
    audioSrc,
    timeslice: 1000,
    startCallback: e => {
      console.log("succ start", e);
    },
    pauseCallback: e => {
      console.log("succ pause", e);
    },
    stopCallback: stopCallback,
    onRecordCallback: e => {
      console.log("recording", e);
    },
    errorCallback: err => {
      console.log("error", err);
    }
  };

  return (
    <div className="app">
      <Sidebar
        isSidebar={isSidebar}
      />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        <Box m="20px">
          <Header title="Help/Support" subtitle="Click on the button to see details of each process" />
          <div>
            <h2>Audio List</h2>
            <ul>
              {audioList.length > 0 && currentAudioIndex < audioList.length && (
                <li key={currentAudioIndex}>
                  <strong>Heading:</strong> {audioList[currentAudioIndex].heading}
                  <br />
                  <audio controls>
                    <source src={`data:audio/wav;base64,${audioList[currentAudioIndex].audio}`} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </li>
              )}
            </ul>
          </div>
          {currentAudioIndex < audioList.length - 1 ? (
            <Button
              variant="contained"
              style={{ backgroundColor: 'cyan', color: 'white' }}
              onClick={handleNextClick}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              style={{ backgroundColor: 'cyan', color: 'white' }}
              onClick={() => {
                console.log("Finish Training");
              }}
            >
              Finish Training
            </Button>
          )}
        </Box>
        <AudioAnalyser {...audioProps}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="contained"
              style={buttonStyle}
              onClick={() => controlAudio("recording")}
            >
              Start
            </Button>
            <Button
              variant="contained"
              style={buttonStyle}
              onClick={() => controlAudio("paused")}
            >
              Pause
            </Button>
            <Button
              variant="contained"
              style={buttonStyle}
              onClick={() => controlAudio("inactive")}
            >
              Stop
            </Button>
          </div>
        </AudioAnalyser>
        <p>Choose output type</p>
        <select
          name=""
          id=""
          onChange={e => changeScheme(e)}
          value={audioType}
        >
          <option value="audio/wav">audio/wav</option>
        </select>
      </main>
      <div><BotpressChatbot/></div>
    </div>
  );
};

export default Chatbot;