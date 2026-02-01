import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ChatPage from './components/ChatPage';
import CostEstimation from './components/CostEstimation';
import SearchLawyers from './components/SearchLawyers';
import CyberComplaint from './components/CyberComplaint';
import SpecializedBots from './components/SpecializedBots';
import LawStudent from './components/LawStudent';
import LawyerTools from './components/LawyerTools';
import LegalAssistant from './components/LegalAssistant';
import './App.css';

function App() {
  console.log('App component rendering...');
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/specialized-bots" element={<SpecializedBots />} />
          <Route path="/cost-estimation" element={<CostEstimation />} />
          <Route path="/search-lawyers" element={<SearchLawyers />} />
          <Route path="/cyber-complaint" element={<CyberComplaint />} />
          <Route path="/law-student" element={<LawStudent />} />
          <Route path="/lawyer-tools" element={<LawyerTools />} />
          <Route path="/legal-assistant" element={<LegalAssistant />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
