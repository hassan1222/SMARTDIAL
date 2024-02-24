import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { useUser } from "../../userContext";

const Item = ({ title, to, icon, selected, setSelected, sendToChatbot }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { firstName, lastName } = useParams();
  const { user } = useUser();


  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => {
        setSelected(title);
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = ({ firstName, lastName, isSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const { user } = useUser();

  useEffect(() => {
    // Fetch employee data from the database
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/employee");
        const data = await response.json();
        console.log("Fetched employee data:", data);
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      }
    };

    fetchEmployeeData();
  }, []);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  EMPLOYEES
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    {user.username}
                  </Typography>
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Employee
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/employeedashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              sendToChatbot={() => {}}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>

            <Item
              title="Customer Information"
              to="/customer"
              icon={<ContactsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              sendToChatbot={() => {}}
            />
            <Item
              title="Add Customer"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              sendToChatbot={() => {}}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
         
<Item
  title="Speech to Text"
  to="/speechtotext"
  icon={<RecordVoiceOverOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
  sendToChatbot={() => {}}
/>

<Item
  title="Notifications"
  to="/empnoti"
  icon={<NotificationsOutlinedIcon />}
  selected={selected}
  setSelected={setSelected}
  sendToChatbot={() => {}}
/>
            <Item
              title="Help/support"
              to="/displayhelp"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              sendToChatbot={() => {}}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Chatbot
            </Typography>
            <Item
              title="Chatbot"
              to={`/chatbot`}
              icon={<ChatOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              sendToChatbot={() => {}}

            />
            

            <Typography
              sx={{ m: "304px 0 5px 20px" }}
            >
               
            </Typography>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
