import { Box, Button, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link } from 'react-router-dom';
import { Person } from '@mui/icons-material';

const AoE = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  return (
    <Box
      sx={{
        m: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h1" component="h1" sx={{ mb: '20px', color: '#4cceac'}} >
        Welcome to Smart Dial
      </Typography>

      <Typography variant="body1" component="p" sx={{ mb: '20px'}}>
        Click on the button to log in
      </Typography>

      <Box sx={{ m: '10px' }}>
        <Button
          startIcon={<Person />}
          variant="contained"
          component={Link}
          to="/loginAdm"
          
        >
          Admin
        </Button>
      </Box>
      <Box sx={{ m: '10px' }}>
        <Button
          startIcon={<Person />}
          variant="contained"
          component={Link}
          to="/voicelogin"
          
        >
          Employee
        </Button>
      </Box>
    </Box>
  );
};

export default AoE;

