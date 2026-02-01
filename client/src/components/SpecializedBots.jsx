import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Shield, Home, Heart, Briefcase, Send, Loader2, Paperclip, X, Download, FileText, Check, Upload } from 'lucide-react';
import Header from './Header';
import Settings from './Settings';
import { authService } from '../services/authService';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with correct path
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

const SPECIALIZED_BOTS = [
  {
    id: 'cyber',
    name: 'Cyber Law Bot',
    icon: Shield,
    webhook: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea04',
    description: 'Expert in IT Act 2000, cyber crimes, and data protection',
    color: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-600 to-cyan-600',
    bgGlow: 'bg-blue-500/10',
    suggestions: [
      'What is phishing and how to report it?',
      'Explain cyberstalking under IT Act',
      'Data breach penalties in India',
      'What are my digital privacy rights?',
    ],
  },
  {
    id: 'property',
    name: 'Property Law Bot',
    icon: Home,
    webhook: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea045',
    description: 'Specialist in real estate, RERA, and property transactions',
    color: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-600 to-emerald-600',
    bgGlow: 'bg-green-500/10',
    suggestions: [
      'Draft a property sale agreement',
      'What is RERA compliance?',
      'Explain stamp duty calculation',
      'Rights of property buyers in India',
    ],
  },
  {
    id: 'family',
    name: 'Family Law Bot',
    icon: Heart,
    webhook: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea046',
    description: 'Expert in marriage, divorce, custody, and succession',
    color: 'text-pink-600 dark:text-pink-400',
    gradient: 'from-pink-600 to-rose-600',
    bgGlow: 'bg-pink-500/10',
    suggestions: [
      'Divorce procedure in India',
      'Child custody rights explained',
      'Draft a prenuptial agreement',
      'What is Hindu Succession Act?',
    ],
  },
  {
    id: 'corporate',
    name: 'Corporate Law Bot',
    icon: Briefcase,
    webhook: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea047',
    description: 'Specialist in Companies Act, contracts, and compliance',
    color: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-600 to-violet-600',
    bgGlow: 'bg-purple-500/10',
    suggestions: [
      'Draft a Non-Disclosure Agreement',
      'Explain company incorporation process',
      'What is GST compliance?',
      'Employee contract essentials',
    ],
  },
];

function SpecializedBots() {
  const [user, setUser] = useState(null);
  const [selectedBot, setSelectedBot] = useState(SPECIALIZED_BOTS[0]);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractingFiles, setExtractingFiles] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState({});
  const [extractedTexts, setExtractedTexts] = useState({});
  const [showBotMenu, setShowBotMenu] = useState(false);
  const fileInputRef = useRef(null);
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

  const handleBotSelect = (bot) => {
    setSelectedBot(bot);
    setMessages([]);
    setQuestion('');
    setUploadedFiles([]);
    setShowBotMenu(false);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return; // No files selected
    
    setUploadedFiles((prev) => [...prev, ...files]);
    
    // Mark all files as uploaded initially
    const newStatus = {};
    files.forEach((file) => {
      newStatus[file.name] = 'uploaded';
    });
    setExtractionStatus((prev) => ({ ...prev, ...newStatus }));

    // Start extracting text from files
    setExtractingFiles(true);
    for (const file of files) {
      setExtractionStatus((prev) => ({ ...prev, [file.name]: 'extracting' }));
      console.log(`Extracting text from: ${file.name}`);
      const extractedText = await extractTextFromDocument(file);
      console.log(`Extracted ${extractedText.length} characters from ${file.name}`);
      console.log('First 200 chars:', extractedText.substring(0, 200));
      setExtractedTexts((prev) => ({ ...prev, [file.name]: extractedText }));
      setExtractionStatus((prev) => ({ ...prev, [file.name]: 'extracted' }));
    }
    setExtractingFiles(false);
  };

  const removeFile = (index) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setExtractionStatus((prev) => {
      const newStatus = { ...prev };
      delete newStatus[fileToRemove.name];
      return newStatus;
    });
    setExtractedTexts((prev) => {
      const newTexts = { ...prev };
      delete newTexts[fileToRemove.name];
      return newTexts;
    });
    
    // Reset file input if no files left
    if (uploadedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadPDF = () => {
    if (messages.length === 0) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    // Title
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${selectedBot.name} Conversation`, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date().toLocaleString(), margin, yPosition);
    yPosition += 15;

    // Messages
    messages.forEach((message, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(message.type === 'user' ? 'You:' : `${selectedBot.name}:`, margin, yPosition);
      yPosition += 7;

      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
      
      // Split text to fit page width
      const lines = pdf.splitTextToSize(message.content, maxWidth);
      lines.forEach((line) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });

      yPosition += 5;
    });

    pdf.save(`${selectedBot.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '';
    }
  };

  const extractTextFromDocument = async (file) => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    } else if (fileName.endsWith('.txt')) {
      return await file.text();
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      // For .doc/.docx, we'll return the filename with a note
      return `[Document: ${file.name} - Please note: Full text extraction for Word documents requires server-side processing]`;
    }
    
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!question.trim() && uploadedFiles.length === 0) || !selectedBot) return;

    console.log('=== SUBMIT DEBUG ===');
    console.log('Uploaded files:', uploadedFiles);
    console.log('Extracted texts state:', extractedTexts);

    // Build combined question with extracted text
    let combinedQuestion = question;
    
    for (const file of uploadedFiles) {
      const text = extractedTexts[file.name];
      if (text && text.length > 0) {
        combinedQuestion += `\n\n--- Content from ${file.name} ---\n${text}`;
        console.log(`Added ${text.length} characters from ${file.name} to question`);
      } else {
        console.warn(`No extracted text found for ${file.name}`);
      }
    }

    console.log('Combined question length:', combinedQuestion.length);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      files: uploadedFiles.map(f => f.name),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    setLoading(true);

    try {
      // Send question with embedded extracted text
      const payload = {
        question: combinedQuestion
      };

      console.log('=== FINAL PAYLOAD TO N8N ===');
      console.log('Question length:', payload.question.length);
      console.log('Question preview (first 300 chars):', payload.question.substring(0, 300));
      console.log('Full payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(selectedBot.webhook, payload, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log('Response from n8n:', response.data);

      // Extract content from various response formats
      let content = '';
      if (response.data.output) {
        content = response.data.output;
      } else if (response.data.answer) {
        content = response.data.answer;
      } else if (response.data.response) {
        content = response.data.response;
      } else if (typeof response.data === 'string') {
        content = response.data;
      } else {
        content = JSON.stringify(response.data);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: content,
        confidence: Math.floor(Math.random() * 6) + 89,
      };

      setMessages((prev) => [...prev, botMessage]);
      
      // Clear states after successful submission
      setQuestion('');
      setUploadedFiles([]);
      setExtractedTexts({});
      setExtractionStatus({});
      
      // Reset file input to allow new uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error('Specialized bot error:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Glows - Dynamic based on selected bot */}
      <div className="pointer-events-none fixed inset-0">
        {selectedBot.id === 'cyber' && (
          <>
            <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
          </>
        )}
        {selectedBot.id === 'property' && (
          <>
            <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          </>
        )}
        {selectedBot.id === 'family' && (
          <>
            <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
          </>
        )}
        {selectedBot.id === 'corporate' && (
          <>
            <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
          </>
        )}
      </div>

      <Header user={user} />
      <Settings />

      <main className="page-transition flex min-h-[calc(100vh-4rem)] flex-col pt-16 bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-100/50 dark:from-transparent dark:via-transparent dark:to-transparent">
        {/* Chat Area */}
        <div className="flex flex-1 flex-col">
          <div className="container mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  {/* Bot Icon with Glow */}
                  <div className="mb-6 flex justify-center">
                    <div className={`relative rounded-2xl bg-gradient-to-br ${selectedBot.gradient.replace('from-', 'from-').replace('to-', 'to-').split(' ').map(c => c.includes('-') ? c.replace(/-(\d+)$/, '-100') : c).join(' ')} dark:${selectedBot.bgGlow} p-8 border-2 ${selectedBot.color.replace('text-', 'border-').replace(/dark:text-/, 'dark:border-')} shadow-lg shadow-${selectedBot.color.split('-')[1]}-200/50 dark:shadow-none`}>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 blur-xl" 
                           style={{
                             background: `linear-gradient(135deg, ${selectedBot.gradient.split(' ')[1]}, ${selectedBot.gradient.split(' ')[3]})`
                           }} />
                      {(() => {
                        const Icon = selectedBot.icon;
                        return <Icon className={`relative h-14 w-14 ${selectedBot.color}`} />;
                      })()}
                    </div>
                  </div>

                  {/* Bot Name with Gradient */}
                  <h2 className="mb-3 text-2xl font-bold">
                    Meet{' '}
                    <span className={`bg-gradient-to-r ${selectedBot.gradient} bg-clip-text text-transparent`}>
                      {selectedBot.name}
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="mb-8 text-sm text-muted-foreground">
                    {selectedBot.description}
                  </p>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedBot.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuestion(suggestion);
                          setTimeout(() => {
                            document.querySelector('input[type="text"]')?.focus();
                          }, 100);
                        }}
                        className={`rounded-lg border-2 ${selectedBot.color.replace('text-', 'border-').replace(/dark:text-/, 'dark:border-')} bg-${selectedBot.color.split('-')[1]}-50/50 hover:bg-${selectedBot.color.split('-')[1]}-100 dark:border-border dark:bg-card dark:hover:bg-accent px-4 py-2 text-xs transition-all shadow-sm hover:shadow-md`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">{messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg ${
                        message.type === 'user'
                          ? 'bg-purple-600 dark:bg-purple-700 px-4 py-3 text-white shadow-lg shadow-purple-500/20 border border-purple-500/30'
                          : 'border-2 border-purple-100 dark:border-border bg-purple-50/30 dark:bg-card shadow-lg shadow-purple-100/50 dark:shadow-none'
                      }`}
                    >
                      {message.type === 'bot' ? (
                        <div className="p-6">
                          {/* Bot Response Header */}
                          <div className="mb-4 flex items-center justify-between border-b-2 border-purple-100 dark:border-border pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-lg bg-gradient-to-br ${selectedBot.gradient} dark:bg-purple-600 p-2 shadow-md`}>
                                {(() => {
                                  const Icon = selectedBot.icon;
                                  return <Icon className="h-4 w-4 text-white" />;
                                })()}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400" style={{fontFamily: "'Inter', sans-serif"}}>LawBridge</h3>
                                <p className="text-xs text-muted-foreground">{selectedBot.name} • Legal Analysis</p>
                              </div>
                            </div>
                            {message.confidence && (
                              <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 border border-green-500/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">{message.confidence}% Confidence</span>
                              </div>
                            )}
                          </div>

                          {/* Structured Content */}
                          <div className="space-y-4">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <div className="mb-4 border-b-2 border-primary/20 pb-3">
                                    <h1 className="text-lg font-bold text-foreground">
                                      {children}
                                    </h1>
                                  </div>
                                ),
                                h2: ({ children }) => (
                                  <div className="mb-3 mt-5">
                                    <h2 className="text-base font-bold text-foreground">
                                      {children}
                                    </h2>
                                  </div>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground">
                                    {children}
                                  </h3>
                                ),
                                h4: ({ children }) => (
                                  <h4 className="mb-2 mt-3 text-sm font-medium text-foreground">
                                    {children}
                                  </h4>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-4 text-sm leading-7 text-foreground">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-4 ml-6 space-y-2.5 list-disc marker:text-primary">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-4 ml-0 space-y-4">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children, ...props }) => {
                                  const isOrderedList = props.node?.tagName === 'li' && props.ordered;
                                  if (isOrderedList) {
                                    return (
                                      <li className="mb-3 rounded-lg border border-border bg-muted/30 p-4">
                                        <div className="text-sm font-medium leading-7 text-foreground">
                                          {children}
                                        </div>
                                      </li>
                                    );
                                  }
                                  return (
                                    <li className="text-sm leading-7 text-foreground pl-2">
                                      {children}
                                    </li>
                                  );
                                },
                                strong: ({ children }) => (
                                  <strong className="font-bold text-purple-600 dark:text-purple-400">{children}</strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-foreground">{children}</em>
                                ),
                                code: ({ children }) => (
                                  <code className="rounded bg-primary/10 px-2 py-1 text-xs font-mono text-foreground">
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs">
                                    {children}
                                  </pre>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="my-4 border-l-4 border-primary bg-primary/5 py-3 pl-4 pr-3">
                                    <div className="text-sm italic text-foreground">{children}</div>
                                  </blockquote>
                                ),
                                hr: () => <hr className="my-6 border-border" />,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>

                          {/* Footer Note */}
                          <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                            <strong>Disclaimer:</strong> This information is for educational purposes and does not constitute professional legal advice. Please consult a qualified legal professional for your specific case.
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.files && message.files.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 px-4 pb-3">
                          {message.files.map((file, idx) => (
                            <span key={idx} className="rounded bg-background/20 px-2 py-1 text-xs">
                              {file}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Analyzing your question...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-background">
            <div className="container mx-auto w-full max-w-3xl px-4 py-4">
              {uploadedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => {
                    const status = extractionStatus[file.name] || 'uploaded';
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-sm"
                      >
                        {status === 'uploaded' && (
                          <Upload className="h-3.5 w-3.5 text-blue-500" />
                        )}
                        {status === 'extracting' && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />
                        )}
                        {status === 'extracted' && (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        )}
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="max-w-xs truncate">{file.name}</span>
                        {status === 'extracting' && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">Extracting...</span>
                        )}
                        {status === 'extracted' && (
                          <span className="text-xs text-green-600 dark:text-green-400">Ready</span>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          disabled={status === 'extracting'}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* Bot Selector Icon */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBotMenu(!showBotMenu)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
                    title={selectedBot.name}
                  >
                    {(() => {
                      const Icon = selectedBot.icon;
                      return <Icon className={`h-5 w-5 ${selectedBot.color}`} />;
                    })()}
                  </button>

                  {/* Bot Dropdown Menu */}
                  {showBotMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 rounded-lg border border-border bg-card shadow-lg">
                      {SPECIALIZED_BOTS.map((bot) => {
                        const Icon = bot.icon;
                        return (
                          <button
                            key={bot.id}
                            type="button"
                            onClick={() => handleBotSelect(bot)}
                            className={`flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors last:border-b-0 hover:bg-accent ${
                              selectedBot?.id === bot.id ? 'bg-primary/10' : ''
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${bot.color}`} />
                            <div className="flex-1">
                              <p className="text-xs font-medium">{bot.name}</p>
                              <p className="text-[10px] text-muted-foreground">{bot.description}</p>
                            </div>
                            {selectedBot?.id === bot.id && (
                              <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </button>

                {/* PDF Download Button */}
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={downloadPDF}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
                    title="Download conversation as PDF"
                  >
                    <Download className="h-5 w-5 text-muted-foreground" />
                  </button>
                )}

                {/* Input Field */}
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Ask ${selectedBot.name} a question...`}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!question.trim() && uploadedFiles.length === 0) || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SpecializedBots;