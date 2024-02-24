// Chat.js
import axios from "axios";
import { useState, useEffect } from "react";
import { Box, Button, useTheme, TextField } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import Side from "../global/Side";
import Topbar from "../global/Topbar";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from 'react-router-dom';

const Chat = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isSide, setIsSide] = useState(true);
    const [heading, setHeading] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const isNonMobile = useMediaQuery("(min-width:600px)");

    useEffect(() => {
        if (!localStorage.getItem('adminToken')) { navigate('/loginAdm'); return; }
    }, []);

    const handleUploadAudio = async () => {
        if (!audioFile || !heading) {
            console.log("Please provide both heading and audio file.");
            return;
        }
    
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('heading', heading);
    
        try {
            const response = await axios.post('http://localhost:5001/practice', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

    
            console.log('Server Response:', response.data);
    
            // You can perform additional actions based on the server response
    
        } catch (error) {
            if (error.response) {
                // The request was made, but the server responded with a non-success status
                console.log('Server Error Response:', error.response.data);
                console.log('Server Error Status:', error.response.status);
                console.log('Server Error Headers:', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log('No response received from server:', error.request);
            } else {
                // Something happened in setting up the request that triggered an error
                console.log('Error setting up request:', error.message);
            }
    
            console.log('Error uploading audio:', error.config);
        }
    };
    return (
        <div className="app">
            <Side isSide={isSide} />
            <main className="content">
                <Topbar setIsSide={setIsSide} />
                <Box m="20px">
                    <Header title="Audio Practice" subtitle="Add audios so that employees can practice them" />

                    <Box display="flex" flexDirection="column" alignItems="flex-start" marginTop="20px">
                        <TextField
                            label="Heading"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={heading}
                            onChange={(e) => setHeading(e.target.value)}
                        />
                    </Box>

                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files[0])}
                    />

                    <Button variant="contained" color="primary" onClick={handleUploadAudio}>
                        Upload Audio
                    </Button>
                </Box>
            </main>
        </div>
    );
};

export default Chat;
