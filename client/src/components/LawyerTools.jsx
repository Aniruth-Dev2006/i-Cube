import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from './Header';
import Settings from './Settings';
import { FileText, Link2, BookOpen, Zap, PenTool, Briefcase, Clock, TrendingUp, CheckCircle, MessageSquare, Scale } from 'lucide-react';

function LawyerTools() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCases, setActiveCases] = useState(24);
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

  const professionalTools = [
    {
      title: 'Section Cross-Linking',
      description: 'Shows related legal provisions',
      benefit: 'Faster legal reasoning',
      icon: Link2,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-100 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20'
    },
    {
      title: 'Case Summary Tool',
      description: '1-page summary of long judgments',
      benefit: 'Saves hours',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-100 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20'
    },
    {
      title: 'Draft Templates',
      description: 'Petition/notice structures',
      benefit: 'Faster drafting',
      icon: BookOpen,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-500/10',
      borderColor: 'border-emerald-200 dark:border-emerald-500/20'
    },
    {
      title: 'Argument Builder',
      description: 'Points for/against a charge',
      benefit: 'Court prep support',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-100 dark:bg-amber-500/10',
      borderColor: 'border-amber-200 dark:border-amber-500/20'
    },
    {
      title: 'Legal Language Rewriter',
      description: 'Makes arguments more formal',
      benefit: 'Better court drafting',
      icon: PenTool,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-100 dark:bg-pink-500/10',
      borderColor: 'border-pink-200 dark:border-pink-500/20'
    }
  ];

  const quickActions = [
    { title: 'Recent Judgments', count: '120+ cases', color: 'bg-indigo-100 dark:bg-indigo-500/10', icon: Scale },
    { title: 'Draft Library', count: '50+ templates', color: 'bg-teal-100 dark:bg-teal-500/10', icon: FileText },
    { title: 'Legal Precedents', count: '500+ citations', color: 'bg-violet-100 dark:bg-violet-500/10', icon: BookOpen },
    { title: 'Court Dates', count: '8 upcoming', color: 'bg-orange-100 dark:bg-orange-500/10', icon: Clock }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-100/50 dark:from-background dark:via-background dark:to-background">
      <Header user={user} />
      <Settings />

      <main className="page-transition container mx-auto max-w-7xl px-4 pt-24 pb-8">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-500/10 dark:to-indigo-500/10 p-6 shadow-lg border border-purple-200 dark:border-purple-500/20">
              <Briefcase className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Advocate Professional Suite</h1>
          <p className="text-sm text-muted-foreground">AI-Powered Tools for Legal Practice Excellence</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Professional Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Tools */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-foreground">Professional Tools</h2>
              <div className="grid gap-4">
                {professionalTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => navigate('/legal-assistant')}
                      className={`group text-left rounded-2xl border ${tool.borderColor} ${tool.bgColor} p-5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-lg`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`rounded-xl bg-gradient-to-br ${tool.color} p-3 shadow-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-start justify-between">
                            <h3 className="text-lg font-bold text-foreground">{tool.title}</h3>
                            <span className="rounded-full bg-white dark:bg-background px-3 py-1 text-xs font-semibold shadow-sm">
                              {tool.benefit}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - AI Assistant & Support */}
          <div className="space-y-6">
            {/* AI Legal Assistant */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 p-6 shadow-lg">
              <div className="mb-4 text-center">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-3 shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="mb-1 font-bold text-foreground">Legal AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Ask complex legal queries instantly</p>
              </div>
              
              <div className="mb-4 space-y-2">
                <button onClick={() => navigate('/legal-assistant')} className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-background px-3 py-2 text-left text-xs transition-all hover:scale-[1.02] hover:shadow-md">
                  Draft a bail application for Section 302
                </button>
                <button onClick={() => navigate('/legal-assistant')} className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-background px-3 py-2 text-left text-xs transition-all hover:scale-[1.02] hover:shadow-md">
                  Summarize Supreme Court judgment
                </button>
                <button onClick={() => navigate('/legal-assistant')} className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-background px-3 py-2 text-left text-xs transition-all hover:scale-[1.02] hover:shadow-md">
                  Find precedents for contract breach
                </button>
              </div>

              <button
                onClick={() => navigate('/legal-assistant')}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
              >
                Open AI Assistant
              </button>
            </div>

            {/* Practice Insights */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-foreground">Practice Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <span className="font-bold text-green-600">78%</span>
                </div>legal-assistan
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Case Duration</span>
                  <span className="font-bold text-foreground">8.2 months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Clients Served</span>
                  <span className="font-bold text-foreground">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cases This Year</span>
                  <span className="font-bold text-purple-600">42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LawyerTools;
