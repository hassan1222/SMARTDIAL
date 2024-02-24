import { Routes, Route } from "react-router-dom";
import Dashboard from "./scenes/dashboard";
import Invoices from "./scenes/invoices";
import Customer from "./scenes/customers";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import FAQ from "./scenes/faq";
import AoE from "./scenes/aoe";
import Employee from "./scenes/emplist";
import Empform from "./scenes/empform";
import AdminLogin from "./scenes/alogin";
import Login from "./scenes/elogin";
import AdminProfile  from "./scenes/alogout";
import AdminRegistration from "./scenes/aregister";
import Notification from "./scenes/notification";
import Empnotification from "./scenes/empnotif";
import Voicelogin from "./scenes/voicelogin";
import Reports from "./scenes/reports";
import Help from "./scenes/help";
import Helpemp from "./scenes/helpemp";
import Helpsupport from "./scenes/helpsupport";
import Helpsupportemp from "./scenes/helpsupportemp";
import Chat from "./scenes/chat";
import Chatbot from "./scenes/chatbot";
import EmployeeVoice from "./scenes/empvoice";
import Generate from "./scenes/generatereport";
import Recordd from "./scenes/recordvoice";
import Disgenerate from "./scenes/disgenerate";
import Disrecord  from "./scenes/disrecord";
import ViewReports from "./scenes/viewReports";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { UserProvider } from "./userContext";


function App() {
  const [theme, colorMode] = useMode();

  return (
    <UserProvider>
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
            <Routes>
              <Route path="/" element={<AoE/>} />
              <Route path="/loginemp" element={<Login/>} />
              <Route path="/empnoti" element={<Empnotification/>} />
              <Route path="/notification" element={<Notification/>} />
              <Route path="/adminr" element={<AdminRegistration/>} />
              <Route path="/profile" element={<AdminProfile/>} />
              <Route path="/loginAdm" element={<AdminLogin/>} />
              <Route path="/employeedashboard" element={<Dashboard />} />
              <Route path="/customer" element={<Customer />} />
              <Route path="/call" element={<Invoices />} />
              <Route path="/form" element={<Form />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/speechtotext" element={<FAQ />} />
              <Route path="/empform" element={<Empform />} />
              <Route path="/emplist" element={<Employee />} />
              <Route path="/voicelogin" element={<Voicelogin />} />
              <Route path="/reports" element={<Reports/>} />
              <Route path="/helpsupport" element={<Help/>} />
              <Route path="/helpemp" element={<Helpemp/>} />
              <Route path="/displayhelp" element={<Helpsupport/>} />
              <Route path="/displayhelpemp" element={<Helpsupportemp/>} />
              <Route path="/chat" element={<Chat/>} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/EmployeeVoice/:firstName-:lastName" element={<EmployeeVoice />} />
              <Route path="/generatereport" element={<Generate />} />
              <Route path="/recordvoice" element={<Recordd />} />
              <Route path="/disrecord" element={<Disrecord />} />
              <Route path="/disgenerate" element={<Disgenerate/>} />
              <Route path="/viewreports" element={<ViewReports/>} />
            </Routes>
      </ThemeProvider>
      </ColorModeContext.Provider>
      </UserProvider>
  );
}

export default App;