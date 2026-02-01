import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './EditProfile.css';

const API_URL = 'http://localhost:3000';

function EditProfile({ user, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(
    user?.picture ? (user.picture.startsWith('http') ? user.picture : `${API_URL}${user.picture}`) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load fresh user data from backend
    const loadUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.user) {
          setFormData({
            name: response.user.name || '',
            email: response.user.email || ''
          });
          const pictureUrl = response.user.picture 
            ? (response.user.picture.startsWith('http') ? response.user.picture : `${API_URL}${response.user.picture}`)
            : '';
          setPreview(pictureUrl);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };
    loadUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      if (selectedFile) {
        formDataToSend.append('picture', selectedFile);
      }

      const response = await authService.updateProfile(formDataToSend);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onUpdate(response.user);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={onCancel}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="profile-picture-section">
            <div className="picture-preview">
              {preview ? (
                <img src={preview} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {formData.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="upload-section">
              <label htmlFor="picture" className="upload-btn">
                Choose Photo
              </label>
              <input
                type="file"
                id="picture"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <p className="upload-hint">Max size: 5MB</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
