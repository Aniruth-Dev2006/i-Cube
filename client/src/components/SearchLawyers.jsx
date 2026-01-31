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
        <h1>Search Lawyers</h1>
        <p>Find the right legal expert for your case</p>
      </div>

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
          <label htmlFor="domain-select">Filter by Domain:</label>
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

      {error && <div className="error-message">{error}</div>}

      <div className="results-summary">
        <p>Showing {filteredLawyers.length} {filteredLawyers.length === 1 ? 'lawyer' : 'lawyers'}</p>
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
                <p className="lawyer-domain">{lawyer.domain}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No lawyers found matching your criteria.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedDomain('All'); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchLawyers;
