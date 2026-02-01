import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from './Header';
import Settings from './Settings';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';
import { 
  MessageSquare, Send, Loader2, FileText, Download, Upload, 
  X, Link2, BookOpen, Zap, PenTool, Scale, Briefcase,
  Plus, Save, Edit2, Trash2, StickyNote, Sparkles, RotateCcw
} from 'lucide-react';
import './LegalAssistant.css';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
}

function LegalAssistant() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState(''); // 'uploading', 'extracting', 'extracted', 'error'
  const [quickNotes, setQuickNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, notes
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.user);
        loadUserData(response.user.id || response.user._id);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadUserData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/legal-assistant/data/${userId}`);
      if (response.data.success) {
        // Don't load chat history on reload - start fresh each time
        // setChatMessages(response.data.data.chatHistory || []);
        setQuickNotes(response.data.data.quickNotes || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = async () => {
    if (!user) return;
    try {
      await axios.post('http://localhost:3000/api/legal-assistant/data', {
        userId: user.id || user._id,
        chatHistory: chatMessages,
        quickNotes: quickNotes
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    if (user && (chatMessages.length > 0 || quickNotes.length > 0)) {
      const timer = setTimeout(saveUserData, 1000);
      return () => clearTimeout(timer);
    }
  }, [chatMessages, quickNotes, user]);

  const extractTextFromPDF = async (file) => {
    try {
      console.log('Starting PDF extraction for:', file.name, 'Size:', file.size);
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer loaded, size:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded, pages:', pdf.numPages);
      
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        console.log(`Page ${i}: Found ${textContent.items.length} text items`);
        
        const pageText = textContent.items.map(item => item.str).join(' ');
        console.log(`Page ${i}: Extracted ${pageText.length} characters`);
        
        fullText += pageText + '\n';
      }

      console.log('Total extracted text length:', fullText.length);
      return fullText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw error;
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedPdf(file);
    setUploadingPdf(true);
    setExtractionStatus('extracting');

    try {
      console.log('Extracting PDF:', file.name);
      
      // Extract text directly on frontend like SpecializedBots
      const extractedText = await extractTextFromPDF(file);
      
      console.log(`Extracted ${extractedText.length} characters from ${file.name}`);
      
      setPdfText(extractedText);
      setExtractionStatus('extracted');
      
      // Add system message
      const systemMessage = {
        type: 'system',
        content: `📄 PDF "${file.name}" uploaded successfully. ${extractedText.length} characters extracted. You can now ask questions about this document.`
      };
      
      setChatMessages(prev => {
        const messageExists = prev.some(msg => 
          msg.type === 'system' && msg.content.includes(file.name)
        );
        
        if (!messageExists) {
          return [...prev, systemMessage];
        }
        return prev;
      });
      
    } catch (error) {
      console.error('Error extracting PDF:', error);
      setExtractionStatus('error');
      alert('Failed to extract PDF. Please try again with a different file.');
      setSelectedPdf(null);
      setPdfText('');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Build combined question with PDF context if available
    let combinedMessage = inputMessage;
    
    if (pdfText && pdfText.length > 0) {
      combinedMessage += `\n\n--- Content from ${selectedPdf?.name || 'uploaded PDF'} ---\n${pdfText}`;
      console.log(`Added ${pdfText.length} characters from PDF to question`);
    }

    const userMessage = { type: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/legal-assistant/chat', {
        message: combinedMessage, // Send combined message with PDF content
        chatHistory: chatMessages.slice(-10)
      });

      if (response.data.success) {
        setChatMessages(prev => [...prev, {
          type: 'bot',
          content: response.data.response,
          confidence: response.data.confidence
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleToolRequest = (toolName, description) => {
    const toolPrompts = {
      'Section Cross-Linking': 'Please help me find related legal provisions and cross-references for ',
      'Case Summary Tool': 'Please provide a comprehensive 1-page summary of the following judgment or case: ',
      'Draft Templates': 'Please generate a legal draft template for ',
      'Argument Builder': 'Please help me build legal arguments (both for and against) regarding ',
      'Legal Language Rewriter': 'Please rewrite the following text in formal legal language: '
    };

    setInputMessage(toolPrompts[toolName] || `Help me with ${toolName}: `);
    setActiveTab('chat');
  };

  const downloadChatAsPdf = () => {
    if (chatMessages.length === 0) {
      alert('No conversation to export');
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    // Title
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Legal Assistant Conversation', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Date: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 15;

    // Messages
    chatMessages.forEach((message) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      // Skip system messages
      if (message.type === 'system') return;

      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(11);
      pdf.text(message.type === 'user' ? 'You:' : 'Legal AI:', margin, yPosition);
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

    pdf.save(`Legal_Conversation_${Date.now()}.pdf`);
  };

  const clearChat = () => {
    if (chatMessages.length === 0) return;
    
    if (confirm('Are you sure you want to clear the conversation? This cannot be undone.')) {
      setChatMessages([]);
      setPdfText('');
      setSelectedPdf(null);
      setExtractionStatus('');
    }
  };

  const handleSaveNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    if (editingNote) {
      setQuickNotes(prev => prev.map(note => 
        note.id === editingNote.id 
          ? { ...note, title: newNoteTitle, content: newNoteContent, updatedAt: new Date().toISOString() }
          : note
      ));
      setEditingNote(null);
    } else {
      const newNote = {
        id: Date.now(),
        title: newNoteTitle,
        content: newNoteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setQuickNotes(prev => [...prev, newNote]);
    }

    setNewNoteTitle('');
    setNewNoteContent('');
    setShowAddNote(false);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setShowAddNote(true);
  };

  const handleDeleteNote = (noteId) => {
    setQuickNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const professionalTools = [
    {
      title: 'Section Cross-Linking',
      description: 'Shows related legal provisions',
      icon: Link2,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-100 dark:bg-purple-500/10'
    },
    {
      title: 'Case Summary Tool',
      description: '1-page summary of long judgments',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-100 dark:bg-blue-500/10'
    },
    {
      title: 'Draft Templates',
      description: 'Petition/notice structures',
      icon: BookOpen,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-500/10'
    },
    {
      title: 'Argument Builder',
      description: 'Points for/against a charge',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-100 dark:bg-amber-500/10'
    },
    {
      title: 'Legal Language Rewriter',
      description: 'Makes arguments more formal',
      icon: PenTool,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-100 dark:bg-pink-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-100/50 dark:from-background dark:via-background dark:to-background">
      <Header user={user} />
      <Settings />

      <main className="page-transition container mx-auto max-w-7xl px-4 pt-24 pb-8">
        {/* Welcome Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-500/10 dark:to-indigo-500/10 p-4 shadow-lg border border-purple-200 dark:border-purple-500/20">
              <Scale className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Legal AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Professional AI-powered legal research and drafting</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Professional Tools */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Quick Tools</h2>
            <div className="space-y-3">
              {professionalTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleToolRequest(tool.title, tool.description)}
                    className={`group w-full text-left rounded-xl border border-border ${tool.bgColor} p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg bg-gradient-to-br ${tool.color} p-2 shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-foreground">{tool.title}</h3>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PDF Upload Section */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Legal Document
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPdf}
                className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
              >
                {uploadingPdf ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </span>
                ) : (
                  'Upload PDF'
                )}
              </button>
              {selectedPdf && (
                <div className="mt-2 text-xs">
                  <p className="text-muted-foreground flex items-center gap-2">
                    📄 {selectedPdf.name}
                    {extractionStatus === 'extracting' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Extracting...
                      </span>
                    )}
                    {extractionStatus === 'extracted' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                        <Sparkles className="h-3 w-3" />
                        Ready
                      </span>
                    )}
                    {extractionStatus === 'error' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                        <X className="h-3 w-3" />
                        Error
                      </span>
                    )}
                  </p>
                  {pdfText && (
                    <p className="text-muted-foreground mt-1">
                      {pdfText.length.toLocaleString()} characters extracted
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-border bg-muted/30">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                    activeTab === 'chat'
                      ? 'bg-card text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="inline-block h-4 w-4 mr-2" />
                  AI Assistant
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-all ${
                    activeTab === 'notes'
                      ? 'bg-card text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <StickyNote className="inline-block h-4 w-4 mr-2" />
                  Quick Notes ({quickNotes.length})
                </button>
              </div>

              {activeTab === 'chat' ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 p-2">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Legal AI Assistant</h3>
                        <p className="text-xs text-muted-foreground">Powered by Groq AI</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={clearChat}
                        disabled={chatMessages.length === 0}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-all hover:scale-105 hover:shadow-md disabled:opacity-50"
                        title="Clear conversation"
                      >
                        <RotateCcw className="inline-block h-4 w-4 mr-1" />
                        Clear
                      </button>
                      <button
                        onClick={downloadChatAsPdf}
                        disabled={chatMessages.length === 0}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition-all hover:scale-105 hover:shadow-md disabled:opacity-50"
                        title="Export conversation to PDF"
                      >
                        <Download className="inline-block h-4 w-4 mr-1" />
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <Sparkles className="mx-auto mb-3 h-12 w-12 text-indigo-500" />
                          <p className="text-sm font-semibold text-foreground mb-2">Welcome to your Legal AI Assistant</p>
                          <p className="text-xs text-muted-foreground">Ask legal questions, request drafts, or upload documents</p>
                        </div>
                      </div>
                    ) : (
                      chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            message.type === 'user' ? 'justify-end' : 
                            message.type === 'system' ? 'justify-center' : 'justify-start'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <div className="max-w-[80%] rounded-lg bg-purple-600 dark:bg-purple-700 px-4 py-3 text-white">
                              <p className="text-sm">{message.content}</p>
                            </div>
                          ) : message.type === 'system' ? (
                            <div className="max-w-[90%] rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-4 py-2">
                              <p className="text-xs text-blue-700 dark:text-blue-400">{message.content}</p>
                            </div>
                          ) : (
                            <div className="max-w-[90%] rounded-lg border border-border bg-muted/50 p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Legal AI</span>
                                {message.confidence && (
                                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20">
                                    {message.confidence}% Confidence
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-foreground whitespace-pre-wrap">
                                {message.content.split('\n').map((line, lineIdx) => {
                                  const processBoldText = (text) => {
                                    if (!text.includes('**')) return text;
                                    return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        const boldText = part.slice(2, -2);
                                        return <strong key={idx} className="font-bold text-indigo-600 dark:text-indigo-400">{boldText}</strong>;
                                      }
                                      return <span key={idx}>{part}</span>;
                                    });
                                  };

                                  if (/^\d+\.\s+/.test(line)) {
                                    return (
                                      <div key={lineIdx} className="my-1">
                                        {processBoldText(line)}
                                      </div>
                                    );
                                  }
                                  
                                  if (line.includes('**')) {
                                    return (
                                      <div key={lineIdx} className="my-1">
                                        {processBoldText(line)}
                                      </div>
                                    );
                                  }
                                  
                                  return <div key={lineIdx}>{line || '\u00A0'}</div>;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-lg border border-border bg-card p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-border bg-muted/30 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask legal questions, request drafts, or analyze documents..."
                        className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || chatLoading}
                        className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Notes Section */}
                  <div className="h-[660px] overflow-y-auto p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-foreground">Quick Access Notes</h3>
                      <button
                        onClick={() => {
                          setShowAddNote(!showAddNote);
                          setEditingNote(null);
                          setNewNoteTitle('');
                          setNewNoteContent('');
                        }}
                        className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
                      >
                        <Plus className="inline-block h-4 w-4 mr-1" />
                        New Note
                      </button>
                    </div>

                    {showAddNote && (
                      <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-lg">
                        <h4 className="mb-3 text-sm font-bold text-foreground">
                          {editingNote ? 'Edit Note' : 'Add New Note'}
                        </h4>
                        <input
                          type="text"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          placeholder="Note title..."
                          className="w-full mb-3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <textarea
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder="Note content..."
                          rows="4"
                          className="w-full mb-3 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveNote}
                            className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
                          >
                            <Save className="inline-block h-4 w-4 mr-1" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowAddNote(false);
                              setEditingNote(null);
                              setNewNoteTitle('');
                              setNewNoteContent('');
                            }}
                            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {quickNotes.length === 0 ? (
                        <div className="text-center py-12">
                          <StickyNote className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                          <p className="text-sm text-muted-foreground">No notes yet. Create your first note!</p>
                        </div>
                      ) : (
                        quickNotes.map((note) => (
                          <div
                            key={note.id}
                            className="rounded-xl border border-border bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-500/5 dark:to-indigo-500/5 p-4 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <h4 className="font-bold text-foreground">{note.title}</h4>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditNote(note)}
                                  className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/10 transition-all"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="rounded-lg p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Updated: {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LegalAssistant;
