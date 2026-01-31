import { useState } from 'react';
import axios from 'axios';
import './CyberComplaint.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function CyberComplaint() {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_URL}/api/complaint/submit-complaint`, formData);
      
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Mail sent successfully' });
        setFormData({ subject: '', message: '' });
      } else {
        setStatus({ type: 'error', message: 'Failed to send complaint' });
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to submit complaint. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-complaint-container">
      <div className="cyber-complaint-header">
        <h1>Cyber Crime Complaint Registration</h1>
        <p>Report cyber crimes and get assistance from authorities</p>
      </div>

      <div className="complaint-form-wrapper">
        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter complaint subject"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Complaint Details *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your complaint in detail..."
              rows="8"
              required
              disabled={loading}
            />
          </div>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>

        <div className="complaint-info">
          <h3>Important Information</h3>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Include all relevant details about the incident</li>
            <li>You will receive a confirmation email once submitted</li>
            <li>Authorities will review your complaint</li>
            <li>Keep any evidence related to the cyber crime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CyberComplaint;
