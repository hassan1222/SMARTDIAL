const colors = require('colors')
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const bodyParser = require('body-parser');
const { PythonShell } = require('python-shell');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');



const audioDirectory = path.join(__dirname, 'audio');

const app = express();
const port = 8080;
const { errorHandler } = require('./middleware/errorMiddleware');
const customerRoutes = require('./routes/customerRoutes');
const employeeRoutes = require("./routes/employeeRoutes");
const notification = require("./routes/notification");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Define static paths
const SIGNIN_AUDIO_PATH = 'E:/uni/FYP/FYP-2/SmartDial1/SmartDial1/signin_audio';
const SIGNUP_AUDIO_PATH = 'E:/uni/FYP/FYP-2/SmartDial1/SmartDial1/signup_audio';

app.post('/predictSpeaker', async (req, res) => {
  try {
    const sound1Path = path.join(SIGNIN_AUDIO_PATH, 'test_Audio.wav');

    // Get a list of all files in the signup directory
    const signupFiles = await fs.promises.readdir(SIGNUP_AUDIO_PATH); // Use fs.promises.readdir instead of fs.readdir

    for (const signupFile of signupFiles) {
      const signupFilePath = path.join(SIGNUP_AUDIO_PATH, signupFile);
      console.log("reading file(from server):", signupFilePath);

      // Read the contents of the signup audio file
      const sound2Buffer = await fs.promises.readFile(signupFilePath); // Use fs.promises.readFile instead of fs.readFile

      // Make API call
      const response = await makeApiCall(sound1Path, sound2Buffer);

      console.log(response.statusCode);
      console.log(response.data.hasError);
      console.log(response.data.statusMessage);
      console.log(response.data.data.resultMessage);

      // Check if the response is successful
      if (
        response.statusCode === 200 &&
        response.data.hasError === false &&
        response.data.statusMessage === 'Login Successful' &&
        response.data.data.resultMessage === 'The two voices belong to the same person.'
      ) {
        console.log("filename(server): ", signupFile);
        console.log("Speaker found");
        // Send the API response back to the client
        res.json({ success: true, fileName: signupFile });
        return; // Stop iterating once a successful response is received
      }
    }
    console.log("Couldn't detect Speaker");

    // If no successful response is received
    res.json({ success: false, fileName: null });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const makeApiCall = async (sound1Path, sound2Buffer) => {
  try {
    const sound1Data = await fs.promises.readFile(sound1Path);
    
    const data = new FormData();
    data.append('sound1', new Blob([sound1Data], { type: 'audio/wav' }), 'test_Audio.wav');
    data.append('sound2', new Blob([sound2Buffer], { type: 'audio/wav' }));
    console.log("API Called successfully");

    const options = {
      method: 'POST',
      url: 'https://speaker-verification1.p.rapidapi.com/Verification',
      headers: {
        'X-RapidAPI-Key': '32dd28c097mshe4bc100202264b1p1ea5b1jsn839997ab333b',
        'X-RapidAPI-Host': 'speaker-verification1.p.rapidapi.com',
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
      },
      data: data,
    };

    const response = await axios.request(options);
    return { statusCode: response.status, statusMessage: response.statusText, data: response.data };
  } catch (error) {
    console.error('Error making API call:', error);
    return { statusCode: 500, statusMessage: 'Internal Server Error', data: { error: 'API call failed' } };
  }
};




// register employee audio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, SIGNUP_AUDIO_PATH);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname || 'error_saving_name.wav';
    // console.log('Received file name:', fileName);
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

app.post('/register_audioo', upload.single('audio'), (req, res) => {
  // console.log('Backend route triggered');
  
  const fileName = req.file.originalname || 'error_saving_name.wav';
  console.log('Received file name:', fileName);

  // Handle the uploaded file if needed
  res.send('File saved successfully');
});



// For logging in audio
const loginAudioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for login audio
    cb(null, SIGNIN_AUDIO_PATH);
  },
  filename: function (req, file, cb) {
    const fileName = 'test_audio.wav';
    cb(null, fileName);
  }
});

const loginAudioUpload = multer({ storage: loginAudioStorage });

app.post('/login_audio', loginAudioUpload.single('audio'), (req, res) => {
  const fileName = 'test_audio.wav';
  console.log('Received file name:', fileName);

  // Your additional logic here for login audio if needed

  res.send('File saved successfully');
});


app.post('/api/separate-audio', async (req, res) => {
  try {
    const { audioUrl } = req.body;

    const options = {
      mode: 'text',
      pythonPath: 'C:/Users/user/AppData/Local/Programs/Python/Python311/python.exe', // Corrected the Python path
      scriptPath: __dirname,
      args: [audioUrl],
    };

    PythonShell.run('separate_audio_script.py', options, (err) => {
      if (err) {
        console.error('Error during Python script execution:', err);
        res.status(500).json({ message: 'An error occurred during audio separation' });
      } else {
        console.log('Audio separation successful');
        res.status(200).json({ message: 'Audio separation successful' });
      }
    });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'An error occurred' });
  }
});

// Error handler middleware
app.use(errorHandler);

// Routes

app.use('/api', customerRoutes);
app.use("/api", employeeRoutes);
app.use("/api/auth", authRouter);
app.use("/api", adminRoutes);
app.use("/api", notification);

// Connect to MongoDB
mongoose
  .connect(
    'mongodb+srv://admin:hassan@cluster0.vowocd1.mongodb.net/customer?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server after successful connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error);
  });

  app.get('/getLatestAudioFile', (req, res) => {
    fs.readdir(audioDirectory, (err, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error reading directory' });
      }
  
      const audioFiles = files
        .filter(file => file.endsWith('.wav'))
        .map(file => ({ name: file, modified: fs.statSync(path.join(audioDirectory, file)).mtime }))
        .sort((a, b) => b.modified - a.modified);
  
      if (audioFiles.length > 0) {
        res.json(audioFiles[0].name); // Return the latest audio file's name
      } else {
        res.json(null); // No audio files found
      }
    });
  });
  
  // Watch the audio directory for changes
  fs.watch(audioDirectory, (eventType, filename) => {
    if (eventType === 'rename' && filename && filename.endsWith('.wav')) {
      const filePath = path.join(audioDirectory, filename);
      console.log(`New audio file added: ${filePath}`);
      // Now you can process the added file using the `filePath`.
    }
  });