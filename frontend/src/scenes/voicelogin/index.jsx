import React, { useState, useEffect } from 'react';
import AudioAnalyser from "react-audio-analyser";
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { tokens } from "../../theme";
import { useNavigate, Link } from 'react-router-dom';
import FormData from 'form-data';
import { useUser } from "../../userContext"; 


export default function Voicelogin() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [audioType, setAudioType] = useState("audio/wav");
  const [audioSrc, setAudioSrc] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [content, setContent] = useState('');
  const [showLoginButton, setShowLoginButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [employeeData, setEmployeeData] = useState([]);
  const [employee, setemployee] = useState("");
  const [userEmail, setemaiil] = useState("");
  const { loginUser } = useUser();

  const controlAudio = (newStatus) => {
    setStatus(newStatus);
  }

const stopCallback = (e) => {
  setAudioSrc(window.URL.createObjectURL(e));

  // Create FormData object
  const fileName = 'test_audio.wav';

  const formData = new FormData();
  formData.append('audio', e, fileName);
  console.log('Frontend FileName:', fileName);
  console.log("formdata: ", formData);
  axios.post('http://localhost:8080/login_audio', formData)
    .then(response => {
      console.log("Server Response Data:", response.data);
      // Display success message
        // setRegistrationSuccess(true); // Set the state variable to true
    //   setTimeout(() => {
    //     // Display success message after the delay
    // }, 2000);
        // Navigate to the dashboard page after the alert
      // window.location.href = '/profile';
      console.log("login audio saved sucessfullllly this is response back from frontend");
      PredictSpeaker()

    })
    .catch(error => {
      // Handle any errors that occur during the POST request
      console.error('Error sending audio from frontend:', error);
      alert('Error occured during voice registration');
    });
};

const PredictSpeaker = async () => {
  try {
    // Make an API request to the server
    const response = await axios.post('http://localhost:8080/predictSpeaker');

    // Process the response
    console.log(response.data);
    console.log(response.data.success);
    console.log(response.data.fileName);
    
    // const filename = response.data.fileName;
    // employee = filename;
    console.log("checking befoer if .....Employee name: "+ response.data.fileName );

    if (response.data.success) {
      const filename = response.data.fileName;
      const user = filename.split(".")[0];
      setemployee(user);
      console.log("user ", user);
      // Set showLoginButton to true
      setShowLoginButton(true);

    } else {
      console.log("Speaker Unkown");
    }
  } catch (error) {
    console.error('Error occured during prediction:', error);
  }
};

const LoginByfetchEmployeeData = async () => {
  try {
    console.log("Employee name in login function is : "+ employee );

    console.log("implouu first name is:", employee.split(" ")[0]);
    console.log("implouu last name is:", employee.split(" ")[1]);

    const [firstName, lastName] = employee.split(" ");
    // const firstName = "Saleh";
    // const lastName = "Sami";

    console.log("Employee First naem:", firstName);
    console.log("Employee Last name:", lastName);

    const response = await axios.get(`http://localhost:8080/api/employee/?firstName=${firstName}&lastName=${lastName}`);
    // Handle the response from the server as needed
    setEmployeeData(response.data); // Assuming the response contains employee data

    const filteredData = response.data.filter(employee => {
      return employee.firstName === firstName && employee.lastName === lastName;
    });

    console.log("FilteredData:", filteredData);

    if (filteredData.length > 0) {
      const { email, password } = filteredData[0];
      console.log("email: ", email);
      console.log("password", password);
      const emp_name = `${firstName} ${lastName}`;
        console.log("emp_name: ", emp_name);
        loginUser(emp_name);
      handleSubmit({ email, password });
    }
    if (filteredData.length <= 0) {
      console.log("Employee data is not in database");
    }
  } catch (error) {
    console.error('Error fetching employee data:', error);
  }
};

const handleSubmit = async (values) => {
  try {
    setLoading(true); // Set loading to true when login is initiated
    setLoadingMessage("Logging in..."); // Set a loading message
    console.log("values", values);

    // Simulate a 3-second delay before completing the sign-in process
    setTimeout(async () => {
      const response = await axios.post("http://localhost:8080/api/auth/login", values);
      const token = response.data.token;
      localStorage.setItem("token", token);
      console.log("token:", token);
      console.log("response: " , response);
      navigate("/employeedashboard");
      setLoading(false); // Set loading back to false after the delay
    }, 2000); // 3000 milliseconds (3 seconds) delay
  } catch (error) {
    console.error("Error during login:", error);
    // Display an error message to the user
    setLoading(false); // Set loading back to false in case of an error
  }
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
    <Typography variant="h1" component="h1" sx={{ mb: '20px', color: '#32a896', mt: '75px'}} >
        Employee Voice Login
      </Typography>
    </h1>
    </section>
  
    <div style={containerStyle}>
      <Typography variant="body1" component="p" sx={{ mb: '5px'}}>
        Click on the start button to start recording your voice.
            </Typography>
            <Typography variant="body1" component="p" sx={{ mb: '20px'}}>
        Make sure voice must not be larger than 15 seconds.
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
      <div>
    {/* Your other JSX elements */}
    {showLoginButton && (
      <button onClick={LoginByfetchEmployeeData}>
        Login
      </button>
    )}
      </div>
      <Link to="/loginemp">
    <p>Sign in with email and password</p>
    </Link>
    </div>
  </div>
);
};