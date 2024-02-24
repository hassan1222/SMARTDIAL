import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import { useNavigate } from 'react-router-dom';


const Bar = () => {
  const [isSidebar, setIsSidebar] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/loginemp'); return; }
  }, []);

  return (
    <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
    <Box m="20px">
      <Header title="Bar Chart" subtitle="Simple Bar Chart" />
      <Box height="75vh">
        <BarChart />
      </Box>
    </Box>
     </main>
     </div>
  );
};

export default Bar;
