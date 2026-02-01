import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Briefcase, Mail, Phone } from 'lucide-react';
import Header from './Header';
import Settings from './Settings';
import { authService } from '../services/authService';
import './SearchLawyers.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function SearchLawyers() {
  const [user, setUser] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [domains, setDomains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    fetchDomains();
    fetchLawyers();
  }, [navigate]);

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading lawyers...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <Header user={user} />
      <Settings />

      <main className="container mx-auto max-w-7xl px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Find Legal Experts</h1>
          <p className="text-sm text-muted-foreground">
            Connect with experienced lawyers specializing in various legal domains
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or domain..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={selectedDomain}
            onChange={handleDomainChange}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-48"
          >
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            <strong>{filteredLawyers.length}</strong> {filteredLawyers.length === 1 ? 'lawyer' : 'lawyers'}
            {selectedDomain !== 'All' && <span> in <strong>{selectedDomain}</strong></span>}
          </p>
        </div>

        {/* Lawyers Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLawyers.length > 0 ? (
            filteredLawyers.map((lawyer) => (
              <div key={lawyer._id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                    {lawyer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{lawyer.name}</h3>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {lawyer.domain}
                    </p>
                  </div>
                </div>
                {lawyer.location && (
                  <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {lawyer.location}
                  </p>
                )}
                {lawyer.email && (
                  <p className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {lawyer.email}
                  </p>
                )}
                {lawyer.phone && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {lawyer.phone}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-muted-foreground">No lawyers found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDomain('All');
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SearchLawyers;
