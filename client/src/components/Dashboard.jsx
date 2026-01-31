import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import ThemeToggler from './ThemeToggler';
import EditProfile from './EditProfile';
import Chat from './Chat';
import CostEstimation from './CostEstimation';
import './Dashboard.css';

const API_URL = 'http://localhost:3000';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showBotDropdown, setShowBotDropdown] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [showCostEstimation, setShowCostEstimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.user);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    setShowEditProfile(false);
  };

  const handleSpecializedBot = (botType) => {
    setSelectedBot(botType);
    setShowBotDropdown(false);
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <ThemeToggler />
      
      <div className="dashboard-header">
        <div className="header-content">
          <h1>LegalBot Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="profile-info">
            <div className="user-avatar">
              {user?.picture ? (
                <img src={user.picture.startsWith('http') ? user.picture : `${API_URL}${user.picture}`} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <h2>Welcome, {user?.name}!</h2>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setShowEditProfile(true)} className="btn-edit-profile">
            Edit Profile
          </button>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Start Chat</h3>
            <p>Begin a conversation with your AI legal assistant</p>
            <button className="btn-card" onClick={() => setShowChat(true)}>Start Chatting</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>Cost Estimation Model</h3>
            <p>Estimate legal consultation and case costs</p>
            <button className="btn-card" onClick={() => setShowCostEstimation(true)}>Get Estimate</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🚨</div>
            <h3>Cyber Complaint Registration</h3>
            <p>File cyber crime complaints online</p>
            <button className="btn-card" onClick={() => navigate('/cyber-complaint')}>Register Complaint</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🔍</div>
            <h3>Search for Lawyers</h3>
            <p>Find and connect with verified legal professionals</p>
            <button className="btn-card" onClick={() => navigate('/search-lawyers')}>Search Lawyers</button>
          </div>

          <div className="dashboard-card specialized-card">
            <div className="card-icon">🤖</div>
            <h3>Specialized Bot</h3>
            <p>Access specialized legal bots for specific areas</p>
            <div className="dropdown-wrapper">
              <button 
                className="btn-dropdown" 
                onClick={() => setShowBotDropdown(!showBotDropdown)}
              >
                <span>Select Bot Type</span>
                <span className="dropdown-icon">{showBotDropdown ? '▲' : '▼'}</span>
              </button>
              {showBotDropdown && (
                <div className="dropdown-list">
                  <button className="dropdown-option" onClick={() => handleSpecializedBot('cyber')}>
                    <span className="option-icon">🛡️</span>
                    <span className="option-text">Cyber Law</span>
                  </button>
                  <button className="dropdown-option" onClick={() => handleSpecializedBot('family')}>
                    <span className="option-icon">👨‍👩‍👧</span>
                    <span className="option-text">Family Law</span>
                  </button>
                  <button className="dropdown-option" onClick={() => handleSpecializedBot('property')}>
                    <span className="option-icon">🏠</span>
                    <span className="option-text">Property Law</span>
                  </button>
                  <button className="dropdown-option" onClick={() => handleSpecializedBot('corporate')}>
                    <span className="option-icon">💼</span>
                    <span className="option-text">Corporate Law</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <EditProfile
          user={user}
          onUpdate={handleProfileUpdate}
          onCancel={() => setShowEditProfile(false)}
        />
      )}

      {showChat && (
        <Chat 
          onClose={() => {
            setShowChat(false);
            setSelectedBot(null);
          }} 
          selectedBot={selectedBot}
        />
      )}

      {showCostEstimation && (
        <CostEstimation onClose={() => setShowCostEstimation(false)} />
      )}
    </div>
  );
}

export default Dashboard;
