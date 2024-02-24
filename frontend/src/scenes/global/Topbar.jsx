import { Box, IconButton, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [showSignOut, setShowSignOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Perform sign-out logic here
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    navigate("/");
  };

  const handleClickPersonIcon = () => {
    setShowSignOut(!showSignOut);
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      ></Box>

      {/* ICONS */}
      <Box display="flex" alignItems="center">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleClickPersonIcon}>
          <PersonOutlinedIcon />
        </IconButton>
        {showSignOut && (
          <Box position="relative">
            <Box
              position="absolute"
              top="50%"
              left="-100px"
              transform="translateY(-50%)"
              backgroundColor="#fff"
              padding={1}
              borderRadius={4}
              boxShadow={3}
              zIndex={1}
            >
              <Button
                onClick={handleSignOut}
                color="primary"
                variant="contained"
              >
                Sign Out
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Topbar;
