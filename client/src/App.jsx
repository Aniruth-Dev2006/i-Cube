import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import SearchLawyers from './components/SearchLawyers';
import CyberComplaint from './components/CyberComplaint';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search-lawyers" element={<SearchLawyers />} />
          <Route path="/cyber-complaint" element={<CyberComplaint />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
