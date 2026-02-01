import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from './Header';
import Settings from './Settings';
import { MessageSquare, DollarSign, AlertTriangle, Search, Bot, Scale, BookOpen, Gavel, MapPin, Briefcase } from 'lucide-react';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Constitutional Background Pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <Header user={user} />
      <Settings />

      <main className="page-transition relative container mx-auto max-w-7xl px-4 pt-24 pb-8">
        {/* Top Quote Banner */}
        <div className="mb-6 overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-purple-500/10 p-5 shadow-lg backdrop-blur-sm">
          <div className="relative">
            <div className="absolute -left-2 top-0 h-full w-1 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
            <div className="pl-6">
              <p className="mb-2 text-base font-semibold italic leading-relaxed text-foreground">
                "Justice delayed is justice denied."
              </p>
              <p className="text-xs font-medium text-purple-400">— William E. Gladstone</p>
            </div>
          </div>
        </div>

        {/* Typewriter Description */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-100/50 via-cyan-100/30 to-blue-100/50 p-8 shadow-xl backdrop-blur-sm dark:from-blue-950/50 dark:via-cyan-950/30 dark:to-blue-950/50">
          {/* Glow effect */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl dark:bg-cyan-500/10" />
            <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl dark:bg-blue-500/10" />
          </div>
          
          <style>{`
            @keyframes fadeSlideIn {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            .animate-item-1 {
              animation: fadeSlideIn 0.6s ease-out 0.3s forwards;
              opacity: 0;
            }
            .animate-item-2 {
              animation: fadeSlideIn 0.6s ease-out 0.9s forwards;
              opacity: 0;
            }
            .animate-item-3 {
              animation: fadeSlideIn 0.6s ease-out 1.5s forwards;
              opacity: 0;
            }
            .animate-item-4 {
              animation: fadeSlideIn 0.6s ease-out 2.1s forwards;
              opacity: 0;
            }
          `}</style>
          
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-4 py-1.5 dark:bg-cyan-500/10">
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-600 dark:bg-cyan-400" />
              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-400">Your Legal Assistant</span>
            </div>
            <div className="space-y-3">
              <div className="animate-item-1 flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                <p className="text-sm leading-relaxed text-gray-900 dark:text-foreground">
                  <strong className="font-semibold">Instant Access to Indian Law</strong> — Get immediate legal information and guidance
                </p>
              </div>
              <div className="animate-item-2 flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                <p className="text-sm leading-relaxed text-gray-900 dark:text-foreground">
                  <strong className="font-semibold">Understand Your Rights</strong> — Clear explanations of your legal rights and obligations
                </p>
              </div>
              <div className="animate-item-3 flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                <p className="text-sm leading-relaxed text-gray-900 dark:text-foreground">
                  <strong className="font-semibold">Draft Legal Documents</strong> — AI-powered assistance for creating legal paperwork
                </p>
              </div>
              <div className="animate-item-4 flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
                <p className="text-sm leading-relaxed text-gray-900 dark:text-foreground">
                  <strong className="font-semibold">Find the Right Lawyer</strong> — Connect with verified legal professionals for your case
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section with Sidebar */}
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr,320px]">
          {/* Left: Welcome & Core Features */}
          <div>
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold">Legal Assistant Dashboard</h1>
              <p className="text-muted-foreground">
                Your comprehensive legal tools and resources powered by AI
              </p>
            </div>

            {/* Core Functionalities */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Core Services</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => navigate('/chat')}
                  className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-blue-500/30"
                >
                  <div className="absolute right-4 top-4 opacity-10">
                    <MessageSquare className="h-12 w-12" />
                  </div>
                  <MessageSquare className="mb-3 h-6 w-6 text-blue-500" />
                  <h3 className="mb-1 text-lg font-semibold">AI Legal Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant legal guidance powered by advanced AI
                  </p>
                </button>

                <button
                  onClick={() => navigate('/specialized-bots')}
                  className="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-6 text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-purple-500/30"
                >
                  <div className="absolute right-4 top-4 opacity-10">
                    <Bot className="h-12 w-12" />
                  </div>
                  <Bot className="mb-3 h-6 w-6 text-purple-500" />
                  <h3 className="mb-1 text-lg font-semibold">Specialized Bots</h3>
                  <p className="text-sm text-muted-foreground">
                    Expert AI bots for Cyber, Property, Family & Corporate Law
                  </p>
                </button>

                <button
                  onClick={() => navigate('/search-lawyers')}
                  className="group relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 p-6 text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-indigo-500/30"
                >
                  <div className="absolute right-4 top-4 opacity-10">
                    <Search className="h-12 w-12" />
                  </div>
                  <Search className="mb-3 h-6 w-6 text-indigo-500" />
                  <h3 className="mb-1 text-lg font-semibold">Find Lawyers</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with verified legal professionals near you
                  </p>
                </button>

                <button
                  onClick={() => navigate('/cost-estimation')}
                  className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-6 text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-emerald-500/30"
                >
                  <div className="absolute right-4 top-4 opacity-10">
                    <DollarSign className="h-12 w-12" />
                  </div>
                  <DollarSign className="mb-3 h-6 w-6 text-emerald-500" />
                  <h3 className="mb-1 text-lg font-semibold">Cost Estimation</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimate legal consultation and case costs
                  </p>
                </button>

                <button
                  onClick={() => navigate('/law-student')}
                  className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-blue-500/30"
                >
                  <div className="absolute right-4 top-4 opacity-10">
                    <BookOpen className="h-12 w-12" />
                  </div>
                  <BookOpen className="mb-3 h-6 w-6 text-blue-500" />
                  <h3 className="mb-1 text-lg font-semibold">Law Student Hub</h3>
                  <p className="text-sm text-muted-foreground">
                    Smart study tools, notes & exam prep for law students
                  </p>
                </button>

                <button
                  onClick={() => navigate('/lawyer-tools')}
                  className="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-6 text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-purple-500/30"
                >
                  <div className="absolute right-4 top-4 opacity-10">
                    <Briefcase className="h-12 w-12" />
                  </div>
                  <Briefcase className="mb-3 h-6 w-6 text-purple-500" />
                  <h3 className="mb-1 text-lg font-semibold">Advocate Suite</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional tools for drafting, analysis & case prep
                  </p>
                </button>
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Additional Services</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => navigate('/cyber-complaint')}
                  className="group rounded-xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-600/15 to-fuchsia-500/15 p-5 text-left shadow-sm transition-all hover:scale-[1.01] hover:shadow-md hover:border-fuchsia-500/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-fuchsia-600/20 p-2">
                      <AlertTriangle className="h-5 w-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">File Cyber Complaint</h3>
                      <p className="text-sm text-muted-foreground">
                        Report cyber crimes and fraudulent activities to authorities
                      </p>
                    </div>
                  </div>
                </button>

                {/* Courts Near You */}
                <div className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-amber-600/20 p-2">
                      <MapPin className="h-5 w-5 text-amber-400" />
                    </div>
                    <h3 className="font-semibold">Courts Near You</h3>
                  </div>
                  <div className="relative h-32 overflow-hidden rounded-lg border border-amber-500/20 bg-amber-950/20">
                    <iframe
                      src="https://www.openstreetmap.org/export/embed.html?bbox=77.5%2C12.9%2C77.7%2C13.1&layer=mapnik&marker=13.0%2C77.6"
                      className="h-full w-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      title="Courts Near You"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            window.open(`https://www.google.com/maps/search/courts+near+me/@${latitude},${longitude},15z`, '_blank');
                          },
                          () => {
                            window.open('https://www.google.com/maps/search/courts+near+me/', '_blank');
                          }
                        );
                      } else {
                        window.open('https://www.google.com/maps/search/courts+near+me/', '_blank');
                      }
                    }}
                    className="mt-3 w-full rounded-lg bg-amber-600/20 px-3 py-2 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-600/30"
                  >
                    Find Courts Near Me
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar with Legal Resources */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Statue of Justice */}
              <div className="rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-600/15 via-background to-fuchsia-500/15 p-6 shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 p-3">
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mb-4 flex justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80" 
                    alt="Statue of Justice"
                    className="h-48 w-full rounded-lg object-cover shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{ display: 'none' }} className="h-48 w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                    <Scale className="h-16 w-16 text-amber-600" />
                    <p className="mt-2 text-xs text-muted-foreground">Lady Justice</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="mb-1 text-sm font-semibold">Justitia - Lady Justice</p>
                  <p className="text-xs italic text-muted-foreground">
                    Symbol of fair and equal administration of law
                  </p>
                </div>
              </div>

              {/* Quote Card */}
              <div className="rounded-xl border border-border bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-5 shadow-md">
                <Scale className="mb-3 h-5 w-5 text-purple-500" />
                <p className="mb-2 text-sm italic text-foreground">
                  "The law must be stable, but it must not stand still."
                </p>
                <p className="text-xs font-medium text-muted-foreground">— Roscoe Pound</p>
              </div>

              {/* Quick Facts */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-md">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <h3 className="text-sm font-semibold">Did You Know?</h3>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-1 text-xs font-medium">Indian Constitution</p>
                    <p className="text-[10px] text-muted-foreground">World's longest written constitution with 448 articles</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-1 text-xs font-medium">Supreme Court</p>
                    <p className="text-[10px] text-muted-foreground">Established on 28th January 1950</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-1 text-xs font-medium">Article 32</p>
                    <p className="text-[10px] text-muted-foreground">Right to Constitutional Remedies - Heart of the Constitution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Constitutional Information */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Constitutional Foundation</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Preamble */}
            <div className="rounded-xl border border-border bg-gradient-to-br from-orange-500/10 via-background to-green-500/10 p-6 shadow-md backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-orange-500 to-green-500 p-2">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold">Indian Constitution Preamble</h3>
              </div>
              <p className="mb-4 text-sm italic leading-relaxed text-muted-foreground">
                "WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a{' '}
                <span className="font-semibold text-foreground">SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC</span>..."
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-2 text-center">
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">JUSTICE</p>
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 text-center">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">LIBERTY</p>
                </div>
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2 text-center">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">EQUALITY</p>
                </div>
              </div>
            </div>

            {/* Fundamental Rights */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-2">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold">Key Fundamental Rights</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="mb-0.5 text-xs font-semibold">Article 14</p>
                  <p className="text-[10px] text-muted-foreground">Equality before law</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="mb-0.5 text-xs font-semibold">Article 19</p>
                  <p className="text-[10px] text-muted-foreground">Six fundamental rights</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="mb-0.5 text-xs font-semibold">Article 21</p>
                  <p className="text-[10px] text-muted-foreground">Life & personal liberty</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="mb-0.5 text-xs font-semibold">Article 32</p>
                  <p className="text-[10px] text-muted-foreground">Constitutional remedies</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Quotes - Bottom Section */}
        <div className="mb-8 lg:hidden">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <Scale className="mb-3 h-5 w-5 text-indigo-500" />
            <p className="mb-2 text-sm italic text-muted-foreground">
              "The law must be stable, but it must not stand still."
            </p>
            <p className="text-xs font-medium text-muted-foreground">— Roscoe Pound</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
