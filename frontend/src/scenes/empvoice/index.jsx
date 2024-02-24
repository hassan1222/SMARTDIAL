import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AudioAnalyser from "react-audio-analyser";
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';  // Import Box
import { tokens } from "../../theme";
import FormData from 'form-data';
import { useTheme } from '@mui/material/styles';  // Import useTheme

const EmployeeVoice = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const colors = tokens(theme.palette.mode);

  const [status, setStatus] = useState("");
  const [audioType, setAudioType] = useState("audio/wav");
  const [audioSrc, setAudioSrc] = useState("");
  const { firstName, lastName } = useParams();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    const controlAudio = (newStatus) => {
      setStatus(newStatus);
    }

  // Decode the URL parameters
  const decodedFirstName = decodeURIComponent(firstName);
  const decodedLastName = decodeURIComponent(lastName);

  const stopCallback = (e) => {
    setAudioSrc(window.URL.createObjectURL(e));

    const fileName = `${decodedFirstName} ${decodedLastName}.wav`;

    const formData = new FormData();
    formData.append('audio', e, fileName);
    formData.append('name', `${decodedFirstName} ${decodedLastName}`);

    setLoading(true);

    axios.post('http://localhost:8080/register_audioo', formData)
    .then((response) => {
        console.log('Server Response Data:', response.data);
      setRegistrationSuccess(true);
      
      // Add a timeout of 3 seconds
      setTimeout(() => {
        // Your code to be executed after 3 seconds
        console.log('Timeout after 3 seconds');

        // Access the history object from react-router-dom
        navigate('/profile');
        // Navigate to the "employ" page

      }, 3000);
            
      })
      .catch((error) => {
        console.error('Error sending audio from frontend:', error);
        setError('Error occurred during voice registration');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const buttonStyle = {
    fontSize: '1.0rem',
    padding: '0.2rem 0.5rem',
    backgroundColor: '#32a896',
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
    stopCallback: stopCallback,
    onRecordCallback: e => {
      console.log("recording", e);
    },
    errorCallback: err => {
      console.log("error", err);
    }
  };
  
  useEffect(() => {
    // Generate random content only when the component mounts
    const numSentences = 5; // Adjust the number of sentences as needed
    setContent(generateRandomParagraph(numSentences));
  }, []);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
   
    height: '80vh',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',  // Center along the main axis (horizontal)
    alignItems: 'center',  
    gap: '10px',
  };

  const generateRandomSentence = () => {
    const subjects1 = ['The cat', 'A book', 'Children', 'The sun', 'A flower', 'A little mouse', 'The teacher', 'A friendly dog', 'A cozy blanket', 'The old tree'];
    const actions1 = ['sat on', 'read', 'played with', 'shined upon', 'blossomed in', 'peeked at', 'taught', 'chased', 'snuggled with', 'swayed next to'];
    const adjectives1 = ['a cozy', 'an interesting', 'a joyful', 'a bright', 'a colorful', 'a quiet', 'a fascinating', 'a happy', 'a warm', 'an ancient'];
    const objects1 = ['couch.', 'story.', 'park.', 'day.', 'garden.', 'hole.', 'lesson.', 'tail.', 'sofa.', 'forest.'];

    const subjects2 = ['The curious cat', 'A mysterious book', 'Happy children', 'The golden sun', 'A blooming flower', 'A playful little mouse', 'The wise teacher', 'A loyal dog', 'A cozy blanket', 'The ancient tree'];
    const actions2 = ['explored', 'unraveled', 'laughed with', 'bathed in the warmth of', 'blossomed amidst', 'curiously observed', 'inspired', 'played fetch with', 'snuggled under', 'whispered secrets to'];
    const adjectives2 = ['a curious', 'an enchanting', 'joyful', 'a radiant', 'a vibrant', 'a playful', 'a wise', 'a loyal', 'a comforting', 'a majestic'];
    const objects2 = ['adventure.', 'mystery.', 'giggles.', 'sunlight.', 'colorful petals.', 'hidden corners.', 'knowledge.', 'loyalty.', 'softness.', 'ancient roots.'];

    const subjects = [...subjects1, ...subjects2];
    const actions = [...actions1, ...actions2];
    const adjectives = [...adjectives1, ...adjectives2];
    const objects = [...objects1, ...objects2];

    const randomSentence = `${subjects.splice(Math.floor(Math.random() * subjects.length), 1)} ${actions.splice(Math.floor(Math.random() * actions.length), 1)} ${adjectives.splice(Math.floor(Math.random() * adjectives.length), 1)} ${objects.splice(Math.floor(Math.random() * objects.length), 1)}`;

    return randomSentence;
};

const generateRandomParagraph = (numSentences) => {
    const sentences = Array.from({ length: numSentences }, () => generateRandomSentence());
    return sentences.join('</br>');
  };

  return (
    <div>
      <section style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', position: 'relative' }}>
      <Typography variant="h1" component="h1" sx={{ mb: '20px', color: '#32a896', mt: '50px'}} >
          Voice Registration
        </Typography>
      </h1>
      </section>
    
      <div style={containerStyle}>
        <Typography variant="body1" component="p" sx={{ mb: '5px'}}>
          Click on the start button to start recording your voice.
              </Typography>
              <Typography variant="body1" component="p" sx={{ mb: '20px'}}>
          Make sure voice must not be larger than 10 seconds.
        </Typography>
        
        <Box m={2} p={3} backgroundColor={colors.primary[400]} borderRadius="8px" style={{ color: "white", fontSize: "15px", lineHeight: '3'}}>
        <p dangerouslySetInnerHTML={{ __html: content }}></p>
        </Box>
        <AudioAnalyser {...audioProps}>
          <div style={buttonContainerStyle}>
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
              onClick={() => controlAudio("inactive")}
            >
              Stop/Submit
            </Button>
          </div>
        </AudioAnalyser>
        <div>
        {/* Display success message conditionally */}
        {registrationSuccess && (
          <Typography variant="body1" component="p" sx={{ mt: '20px', color: 'green' }}>
            Employee registered successfully
          </Typography>
        )}</div>
      </div>
    </div>
  );
};

export default EmployeeVoice;
