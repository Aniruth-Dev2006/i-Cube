import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, Calculator } from 'lucide-react';
import Header from './Header';
import Settings from './Settings';
import { authService } from '../services/authService';

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

function CostEstimation() {
  const [user, setUser] = useState(null);
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <Header user={user} />
      <Settings />

      <main className="container mx-auto max-w-4xl px-4 pt-24 pb-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">Legal Cost Estimation</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Get an AI-powered estimate of legal consultation costs
          </p>
        </div>

        {!result ? (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="scenario" className="mb-2 block text-sm font-medium">
                  Legal Scenario Description *
                </label>
                <textarea
                  id="scenario"
                  name="scenario"
                  value={formData.scenario}
                  onChange={handleChange}
                  placeholder="E.g., I need to file a property dispute case regarding a 2000 sq ft plot in Mumbai..."
                  rows={6}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="caseType" className="mb-2 block text-sm font-medium">
                    Case Type *
                  </label>
                  <select
                    id="caseType"
                    name="caseType"
                    value={formData.caseType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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

                <div>
                  <label htmlFor="complexity" className="mb-2 block text-sm font-medium">
                    Case Complexity *
                  </label>
                  <select
                    id="complexity"
                    name="complexity"
                    value={formData.complexity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="simple">Simple</option>
                    <option value="moderate">Moderate</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-medium">
                  Location/City
                  <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="E.g., Mumbai, Delhi, Bangalore..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Get Cost Estimate'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cost Estimation Report</h3>
                {result.confidence_score && (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Confidence: {(result.confidence_score * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {result.estimate.split('\n').map((line, index) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  if (trimmedLine.startsWith('**') && trimmedLine.endsWith(':**')) {
                    return (
                      <h4 key={index} className="mt-4 text-base font-semibold">
                        {renderMarkdownText(trimmedLine)}
                      </h4>
                    );
                  }
                  
                  if (trimmedLine.match(/^\d+\.\s/)) {
                    return (
                      <p key={index} className="text-sm">
                        {renderMarkdownText(trimmedLine)}
                      </p>
                    );
                  }
                  
                  return (
                    <p key={index} className="text-sm text-muted-foreground">
                      {renderMarkdownText(trimmedLine)}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
              <h4 className="mb-2 text-sm font-semibold">Important Disclaimer:</h4>
              <p className="text-sm text-muted-foreground">
                This is an AI-generated estimate based on general information. Actual costs may vary significantly based on specific case details, lawyer experience, court procedures, and regional variations. Please consult with legal professionals for accurate cost assessment.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
              >
                New Estimate
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CostEstimation;
