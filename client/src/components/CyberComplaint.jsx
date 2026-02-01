import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, Send } from 'lucide-react';
import Header from './Header';
import Settings from './Settings';
import { authService } from '../services/authService';
import './CyberComplaint.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function CyberComplaint() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.user);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

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
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
      </div>

      <Header user={user} />
      <Settings />

      <main className="container mx-auto max-w-3xl px-4 pt-24 pb-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Cyber Crime Complaint</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Report cyber crimes and get assistance from authorities
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter complaint subject"
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium">
                Complaint Details *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your complaint in detail..."
                rows="8"
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {status.message && (
              <div
                className={`rounded-lg px-4 py-3 text-sm ${
                  status.type === 'success'
                    ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200'
                    : 'border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
                }`}
              >
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted p-4">
          <h3 className="mb-2 text-sm font-medium">Important Information</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Provide accurate and complete information</li>
            <li>• Include all relevant details about the incident</li>
            <li>• You will receive a confirmation email once submitted</li>
            <li>• Authorities will review your complaint</li>
            <li>• Keep any evidence related to the cyber crime</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default CyberComplaint;
