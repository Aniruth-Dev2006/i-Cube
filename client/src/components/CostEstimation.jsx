import { useState } from 'react';
import axios from 'axios';
import './CostEstimation.css';

// Function to render markdown text with bold formatting
function renderMarkdownText(text) {
  if (!text) return text;
  
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
}

function CostEstimation({ onClose }) {
  const [formData, setFormData] = useState({
    scenario: '',
    caseType: 'civil',
    complexity: 'moderate',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.scenario.trim()) {
      setError('Please describe your legal scenario');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3000/api/cost-estimate', formData);
      setResult(response.data);
    } catch (err) {
      console.error('Cost estimation error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to generate cost estimate. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      scenario: '',
      caseType: 'civil',
      complexity: 'moderate',
      location: ''
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="cost-modal-overlay" onClick={onClose}>
      <div className="cost-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cost-header">
          <h2>
            <span>💰</span>
            Legal Cost Estimation
          </h2>
          <button className="cost-close" onClick={onClose}>
            ×
          </button>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="cost-form">
            <div className="form-group">
              <label htmlFor="scenario">
                Legal Scenario Description *
                <span className="label-hint">Describe your case in detail</span>
              </label>
              <textarea
                id="scenario"
                name="scenario"
                value={formData.scenario}
                onChange={handleChange}
                placeholder="E.g., I need to file a property dispute case regarding a 2000 sq ft plot in Mumbai. The dispute involves boundary issues with my neighbor..."
                rows={6}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="caseType">Case Type *</label>
                <select
                  id="caseType"
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  required
                >
                  <option value="civil">Civil Law</option>
                  <option value="criminal">Criminal Law</option>
                  <option value="property">Property Law</option>
                  <option value="family">Family Law</option>
                  <option value="corporate">Corporate Law</option>
                  <option value="cyber">Cyber Law</option>
                  <option value="consumer">Consumer Law</option>
                  <option value="labour">Labour Law</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="complexity">Case Complexity *</label>
                <select
                  id="complexity"
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  required
                >
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">
                Location/City
                <span className="label-hint">Optional - helps provide accurate regional estimates</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="E.g., Mumbai, Delhi, Bangalore..."
              />
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={handleReset} className="btn-reset">
                Reset
              </button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Analyzing...' : 'Get Cost Estimate'}
              </button>
            </div>
          </form>
        ) : (
          <div className="cost-result">
            <div className="result-header">
              <h3>Cost Estimation Report</h3>
              {result.confidence_score && (
                <div className="confidence-badge" style={{
                  backgroundColor: result.confidence_score >= 0.85 ? '#4CAF50' : '#FF9800'
                }}>
                  Confidence: {(result.confidence_score * 100).toFixed(0)}%
                </div>
              )}
            </div>

            <div className="result-content">
              {result.estimate.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;
                
                // Check if line is a heading
                if (trimmedLine.startsWith('**') && trimmedLine.endsWith(':**')) {
                  return (
                    <h4 key={index} className="cost-heading">
                      {renderMarkdownText(trimmedLine)}
                    </h4>
                  );
                }
                
                // Check if line is a numbered item
                if (trimmedLine.match(/^\d+\.\s/)) {
                  return (
                    <div key={index} className="cost-list-item">
                      {renderMarkdownText(trimmedLine)}
                    </div>
                  );
                }
                
                // Regular paragraph
                return (
                  <p key={index} className="cost-paragraph">
                    {renderMarkdownText(trimmedLine)}
                  </p>
                );
              })}
            </div>

            <div className="result-disclaimer">
              <strong>⚠️ Important Disclaimer:</strong>
              <p>This is an AI-generated estimate based on general information. Actual costs may vary significantly based on specific case details, lawyer experience, court procedures, and regional variations. Please consult with legal professionals for accurate cost assessment.</p>
            </div>

            <div className="result-actions">
              <button onClick={handleReset} className="btn-new-estimate">
                New Estimate
              </button>
              <button onClick={onClose} className="btn-done">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CostEstimation;
