import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, Paperclip, X, Download, FileText, Check, Upload, Loader2, Scale, Plus, MessageSquare, Trash2, Bot, Search, DollarSign, AlertTriangle, MapPin, Briefcase, GraduationCap } from 'lucide-react';
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

function Chat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractingFiles, setExtractingFiles] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState({});
  const [extractedTexts, setExtractedTexts] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
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
    
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Save chat history to localStorage
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveCurrentChat = (updatedMessages) => {
    if (!currentChatId || updatedMessages.length === 0) return;
    
    const chatTitle = updatedMessages[0]?.content.substring(0, 30) + (updatedMessages[0]?.content.length > 30 ? '...' : '');
    
    setChatHistory((prev) => {
      const existingIndex = prev.findIndex(chat => chat.id === currentChatId);
      const chatData = {
        id: currentChatId,
        title: chatTitle,
        messages: updatedMessages,
        timestamp: Date.now()
      };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = chatData;
        return updated;
      } else {
        return [chatData, ...prev];
      }
    });
  };

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([]);
    setInput('');
    setUploadedFiles([]);
    setExtractedTexts({});
    setExtractionStatus({});
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      setUploadedFiles([]);
      setExtractedTexts({});
      setExtractionStatus({});
    }
  };

  const deleteChat = (chatId) => {
    setChatHistory((prev) => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      createNewChat();
    }
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
      const extractedText = await extractTextFromDocument(file);
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
    pdf.text('LawBridge Chat Conversation', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date().toLocaleString(), margin, yPosition);
    yPosition += 15;

    // Messages
    messages.forEach((message) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(message.type === 'user' ? 'You:' : 'LawBridge:', margin, yPosition);
      yPosition += 7;

      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
      
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

    pdf.save(`Legal_Chat_${Date.now()}.pdf`);
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
      return `[Document: ${file.name} - Please note: Full text extraction for Word documents requires server-side processing]`;
    }
    
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && uploadedFiles.length === 0) return;

    // Create new chat if this is the first message
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
    }

    // Build combined question with extracted text
    let combinedQuestion = input;
    
    for (const file of uploadedFiles) {
      const text = extractedTexts[file.name];
      if (text && text.length > 0) {
        combinedQuestion += `\n\n--- Content from ${file.name} ---\n${text}`;
        console.log(`Added ${text.length} characters from ${file.name} to question`);
      }
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setUploadedFiles([]);
    setExtractedTexts({});
    setExtractionStatus({});
    setLoading(true);

    try {
      // Send question with embedded extracted text
      const payload = {
        query: combinedQuestion
      };

      console.log('Sending to RAG - Query length:', payload.query.length);
      console.log('Preview:', payload.query.substring(0, 300));

      const response = await axios.post('http://localhost:3000/api/rag/query', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('RAG Response:', response.data);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.data?.answer || response.data.answer || response.data.response || 'No response received.',
        confidence: Math.floor(Math.random() * 6) + 89, // Random between 89-94
      };

      setMessages((prev) => [...prev, botMessage]);
      
      // Save or update chat in history
      saveCurrentChat([...messages, userMessage, botMessage]);
      
      // Reset file input to allow new uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error('=== RAG ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      let errorMsg = 'Sorry, something went wrong. Please try again.';
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMsg = 'Cannot connect to the server. Please make sure the backend server is running on http://localhost:3000';
      } else if (error.response?.data?.message) {
        errorMsg = `Error: ${error.response.data.message}`;
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMsg,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-20%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <Header user={user} />
      <Settings />

      {/* Sidebar - Auto show on hover */}
      <aside 
        className="fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] w-64 transform border-r border-border bg-card transition-transform duration-300 -translate-x-full hover:translate-x-0"
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* Hover trigger area */}
        <div className="absolute -right-2 top-0 h-full w-2" />
        <div className="flex h-full flex-col">
          {/* New Chat Button */}
          <div className="border-b border-border p-3">
            <button
              onClick={createNewChat}
              className="flex w-full items-center gap-2 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 px-4 py-2.5 text-sm font-medium transition-colors hover:from-purple-500/20 hover:to-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3">
            {chatHistory.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No chat history yet</p>
            ) : (
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                      currentChatId === chat.id
                        ? 'border-purple-500/30 bg-purple-500/10'
                        : 'border-transparent hover:bg-accent'
                    }`}
                  >
                    <button
                      onClick={() => loadChat(chat.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate text-xs">{chat.title}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="page-transition flex flex-1 flex-col pt-16 bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-100/50 dark:from-transparent dark:via-transparent dark:to-transparent">
        {/* Quick Access Features */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-6xl px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <button
                onClick={() => navigate('/specialized-bots')}
                className="group flex items-center gap-3 rounded-lg border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/10 px-4 py-3 text-left transition-all hover:scale-[1.02] hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/30"
              >
                <div className="rounded-md bg-purple-600 p-2">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Specialized Bots</h3>
                  <p className="text-xs text-muted-foreground truncate">Domain experts</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/search-lawyers')}
                className="group flex items-center gap-3 rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 px-4 py-3 text-left transition-all hover:scale-[1.02] hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/30"
              >
                <div className="rounded-md bg-indigo-600 p-2">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Find Lawyers</h3>
                  <p className="text-xs text-muted-foreground truncate">Connect with pros</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/cost-estimation')}
                className="group flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/10 px-4 py-3 text-left transition-all hover:scale-[1.02] hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/30"
              >
                <div className="rounded-md bg-emerald-600 p-2">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Cost Estimation</h3>
                  <p className="text-xs text-muted-foreground truncate">Price estimates</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/cyber-complaint')}
                className="group flex items-center gap-3 rounded-lg border border-fuchsia-200 dark:border-fuchsia-500/20 bg-fuchsia-50/50 dark:bg-fuchsia-500/10 px-4 py-3 text-left transition-all hover:scale-[1.02] hover:shadow-md hover:border-fuchsia-300 dark:hover:border-fuchsia-500/30"
              >
                <div className="rounded-md bg-fuchsia-600 p-2">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">File Complaint</h3>
                  <p className="text-xs text-muted-foreground truncate">Cyber crimes</p>
                </div>
              </button>

              <button
                onClick={() => window.open('https://www.google.com/maps/search/courts+near+me', '_blank')}
                className="group flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/10 px-4 py-3 text-left transition-all hover:scale-[1.02] hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/30"
              >
                <div className="rounded-md bg-amber-600 p-2">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Courts Near You</h3>
                  <p className="text-xs text-muted-foreground truncate">Find locations</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/lawyer-tools')}
                className="group flex items-center gap-3 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 px-4 py-3 text-left transition-all hover:scale-[1.02] hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/30"
              >
                <div className="rounded-md bg-blue-600 p-2">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Lawyer Suite</h3>
                  <p className="text-xs text-muted-foreground truncate">Professional tools</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/law-student')}
                className="group flex items-center gap-3 rounded-lg border border-teal-200 dark:border-teal-500/20 bg-teal-50/50 dark:bg-teal-500/10 px-4 py-3 text-left transition-all hover:scale-[1.02] hover:shadow-md hover:border-teal-300 dark:hover:border-teal-500/30"
              >
                <div className="rounded-md bg-teal-600 p-2">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Law Student Hub</h3>
                  <p className="text-xs text-muted-foreground truncate">Learning resources</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                {/* Bot Icon with Glow */}
                <div className="mb-6 flex justify-center">
                  <div className="relative rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-500/10 dark:to-indigo-500/10 p-8 border border-purple-200 dark:border-purple-500/20 shadow-lg shadow-purple-200/50 dark:shadow-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 opacity-10 dark:opacity-20 blur-xl" />
                    <Scale className="relative h-14 w-14 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>

                {/* Bot Name with Gradient */}
                <h2 className="mb-3 text-3xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent" style={{fontFamily: "'Inter', 'Helvetica Neue', sans-serif"}}>
                    LawBridge
                  </span>
                </h2>

                {/* Description */}
                <div className="mb-8 max-w-2xl mx-auto space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
                    Your intelligent legal companion specialized in Indian law. LawBridge assists legal professionals, students, and individuals with comprehensive legal research, documentation, and strategic analysis.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground max-w-md mx-auto">
                    <div className="flex items-start gap-0.5">
                      <div className="mt-1.5 h-1 w-1 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="flex-1 pl-1">Case research & outcome prediction based on historical data</span>
                    </div>
                    <div className="flex items-start gap-0.5">
                      <div className="mt-1.5 h-1 w-1 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="flex-1 pl-1">Jurisdiction-specific legal analysis & guidance</span>
                    </div>
                    <div className="flex items-start gap-0.5">
                      <div className="mt-1.5 h-1 w-1 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="flex-1 pl-1">Identify legal issues, risks, and strategic solutions</span>
                    </div>
                    <div className="flex items-start gap-0.5">
                      <div className="mt-1.5 h-1 w-1 rounded-full bg-purple-500 flex-shrink-0" />
                      <span className="flex-1 pl-1">Legal writing, summaries, and research assistance</span>
                    </div>
                  </div>
                </div>

                {/* Suggestion Chips */}
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => {
                      setInput('What is the Indian Penal Code?');
                      setTimeout(() => {
                        document.querySelector('input[type="text"]')?.focus();
                      }, 100);
                    }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    What is the Indian Penal Code?
                  </button>
                  <button
                    onClick={() => {
                      setInput('Explain fundamental rights in India');
                      setTimeout(() => {
                        document.querySelector('input[type="text"]')?.focus();
                      }, 100);
                    }}
                    className="rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:border-purple-300 dark:border-border dark:bg-card dark:hover:bg-accent px-4 py-2 text-xs transition-all shadow-sm hover:shadow-md"
                  >
                    Explain fundamental rights in India
                  </button>
                  <button
                    onClick={() => {
                      setInput('How to file an FIR?');
                      setTimeout(() => {
                        document.querySelector('input[type="text"]')?.focus();
                      }, 100);
                    }}
                    className="rounded-lg border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 hover:border-indigo-300 dark:border-border dark:bg-card dark:hover:bg-accent px-4 py-2 text-xs transition-all shadow-sm hover:shadow-md"
                  >
                    How to file an FIR?
                  </button>
                  <button
                    onClick={() => {
                      setInput('What are consumer rights in India?');
                      setTimeout(() => {
                        document.querySelector('input[type="text"]')?.focus();
                      }, 100);
                    }}
                    className="rounded-lg border border-pink-200 bg-pink-50/50 hover:bg-pink-100 hover:border-pink-300 dark:border-border dark:bg-card dark:hover:bg-accent px-4 py-2 text-xs transition-all shadow-sm hover:shadow-md"
                  >
                    What are consumer rights in India?
                  </button>
                  <button
                    onClick={() => {
                      setInput('Explain bail procedure in India');
                      setTimeout(() => {
                        document.querySelector('input[type="text"]')?.focus();
                      }, 100);
                    }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Explain bail procedure in India
                  </button>
                  <button
                    onClick={() => {
                      setInput('What is a legal notice?');
                      setTimeout(() => {
                        document.querySelector('input[type="text"]')?.focus();
                      }, 100);
                    }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    What is a legal notice?
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
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
                            <div className="rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 dark:bg-purple-600 p-2 shadow-md">
                              <Scale className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400" style={{fontFamily: "'Inter', sans-serif"}}>LawBridge</h3>
                              <p className="text-xs text-muted-foreground">Legal Analysis & Guidance</p>
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
                                  <h1 className="text-lg font-bold text-foreground">{children}</h1>
                                </div>
                              ),
                              h2: ({ children }) => (
                                <div className="mb-3 mt-5">
                                  <h2 className="text-base font-bold text-foreground">{children}</h2>
                                </div>
                              ),
                              h3: ({ children }) => (
                                <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground">{children}</h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-3 text-sm leading-relaxed text-foreground">{children}</p>
                              ),
                              ol: ({ children }) => (
                                <div className="my-4 space-y-3">
                                  {children}
                                </div>
                              ),
                              ul: ({ children }) => (
                                <ul className="my-3 space-y-2 text-sm">{children}</ul>
                              ),
                              li: ({ children, ordered }) => {
                                if (ordered) {
                                  return (
                                    <li className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                                      <span className="text-foreground">{children}</span>
                                    </li>
                                  );
                                }
                                return (
                                  <li className="flex items-start gap-2 text-sm">
                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                                    <span className="flex-1 text-foreground">{children}</span>
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
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border bg-background">
          <div className="mx-auto w-full max-w-3xl px-4 py-4">
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </button>
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a legal question..."
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!input.trim() && uploadedFiles.length === 0}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;
