import { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchLawyers.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function SearchLawyers() {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDomains();
    fetchLawyers();
  }, []);

  useEffect(() => {
    filterLawyers();
  }, [lawyers, searchTerm, selectedDomain]);

  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/lawyers/domains`);
      if (response.data.success) {
        setDomains(['All', ...response.data.data]);
      }
    } catch (err) {
      console.error('Error fetching domains:', err);
    }
  };

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/lawyers`);
      if (response.data.success) {
        setLawyers(response.data.data);
        setFilteredLawyers(response.data.data);
      }
    } catch (err) {
      setError('Failed to load lawyers. Please try again.');
      console.error('Error fetching lawyers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLawyers = () => {
    let filtered = [...lawyers];

    // Filter by domain
    if (selectedDomain !== 'All') {
      filtered = filtered.filter(lawyer => lawyer.domain === selectedDomain);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lawyer =>
        lawyer.name.toLowerCase().includes(term) ||
        lawyer.domain.toLowerCase().includes(term)
      );
    }

    setFilteredLawyers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  if (loading) {
    return (
      <div className="search-lawyers-container">
        <div className="loading">Loading lawyers...</div>
      </div>
    );
  }

  return (
    <div className="search-lawyers-container">
      <div className="search-lawyers-header">
        <h1>🔍 Find Your Legal Expert</h1>
        <p>Connect with experienced lawyers specializing in various legal domains</p>
      </div>

      {/* Featured Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">👨‍⚖️</div>
          <div className="stat-number">{lawyers.length}+</div>
          <div className="stat-label">Expert Lawyers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-number">{domains.length - 1}</div>
          <div className="stat-label">Legal Domains</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">100%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-section">
        <h2 className="section-title">Search & Filter</h2>
        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name or domain..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="domain-filter">
            <label htmlFor="domain-select">Legal Domain:</label>
            <select
              id="domain-select"
              value={selectedDomain}
              onChange={handleDomainChange}
              className="domain-select"
            >
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Legal Domains Info */}
      <div className="domains-info">
        <h3>📚 Available Legal Domains</h3>
        <div className="domain-tags">
          {domains.filter(d => d !== 'All').map((domain) => (
            <span 
              key={domain} 
              className={`domain-tag ${selectedDomain === domain ? 'active' : ''}`}
              onClick={() => setSelectedDomain(domain)}
            >
              {domain}
            </span>
          ))}
        </div>
      </div>

      <div className="results-summary">
        <p>
          <strong>{filteredLawyers.length}</strong> {filteredLawyers.length === 1 ? 'lawyer' : 'lawyers'} 
          {selectedDomain !== 'All' && <span> in <strong>{selectedDomain}</strong></span>}
        </p>
      </div>

      <div className="lawyers-grid">
        {filteredLawyers.length > 0 ? (
          filteredLawyers.map((lawyer) => (
            <div key={lawyer._id} className="lawyer-card">
              <div className="lawyer-avatar">
                {lawyer.name.charAt(0).toUpperCase()}
              </div>
              <div className="lawyer-info">
                <h3>{lawyer.name}</h3>
                <p className="lawyer-domain">⚖️ {lawyer.domain}</p>
                <div className="lawyer-badges">
                  <span className="badge">✓ Verified</span>
                  <span className="badge">🏆 Expert</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">😔</div>
            <p>No lawyers found matching your criteria.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedDomain('All'); }}>
              🔄 Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="info-footer">
        <div className="info-card">
          <h4>💼 Professional Service</h4>
          <p>All lawyers are verified and experienced professionals</p>
        </div>
        <div className="info-card">
          <h4>🔒 Confidential</h4>
          <p>Your consultations are completely confidential</p>
        </div>
        <div className="info-card">
          <h4>📞 24/7 Support</h4>
          <p>Get legal assistance whenever you need it</p>
        </div>
      </div>
    </div>
  );
}

export default SearchLawyers;
