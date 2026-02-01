import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../services/authService';
import Header from './Header';
import Settings from './Settings';
import { BookOpen, FileText, Clock, TrendingUp, MessageSquare, BookMarked, Target, Lightbulb, Award, Calendar, Scale, Gavel, Send, Loader2, Sparkles, X, Edit2, Save, Pencil, Trash2, Plus } from 'lucide-react';

function LawStudent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [tempProgress, setTempProgress] = useState(0);
  const [tempModuleTitle, setTempModuleTitle] = useState('');
  const [tempModuleTopics, setTempModuleTopics] = useState(0);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [tempNoteContent, setTempNoteContent] = useState('');
  const [tempNoteTitle, setTempNoteTitle] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [learningModules, setLearningModules] = useState([]);
  const [quickNotes, setQuickNotes] = useState([]);
  const [examNotes, setExamNotes] = useState([]);
  const [editingExamNote, setEditingExamNote] = useState(null);
  const [tempExamNoteTitle, setTempExamNoteTitle] = useState('');
  const [tempExamNoteContent, setTempExamNoteContent] = useState('');
  const [tempExamNoteSubject, setTempExamNoteSubject] = useState('');
  const [isAddingExamNote, setIsAddingExamNote] = useState(false);
  const [examNoteType, setExamNoteType] = useState('revision');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  // Initialize default data
  const defaultModules = [
    {
      title: 'Constitutional Law',
      topics: 42,
      progress: 65,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-500/10',
      icon: Scale,
      isActive: true
    },
    {
      title: 'Criminal Law & IPC',
      topics: 38,
      progress: 48,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-500/10',
      icon: Gavel,
      isActive: false
    },
    {
      title: 'Contract Law',
      topics: 28,
      progress: 72,
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-500/10',
      icon: FileText,
      isActive: false
    },
    {
      title: 'Civil Procedure',
      topics: 35,
      progress: 55,
      color: 'from-amber-400 to-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-500/10',
      icon: BookOpen,
      isActive: false
    }
  ];

  const defaultNotes = [
    { 
      id: 1,
      title: 'Fundamental Rights', 
      articles: 'Art 14-35', 
      color: 'bg-pink-100 dark:bg-pink-500/10', 
      content: 'Add your notes about Fundamental Rights here...' 
    },
    { 
      id: 2,
      title: 'Important Amendments', 
      count: '12 key points', 
      color: 'bg-indigo-100 dark:bg-indigo-500/10', 
      content: 'Add notes about important amendments...' 
    },
    { 
      id: 3,
      title: 'Landmark Cases', 
      count: '25 cases', 
      color: 'bg-teal-100 dark:bg-teal-500/10', 
      content: 'Add your list of landmark cases...' 
    },
    { 
      id: 4,
      title: 'Legal Maxims', 
      count: '50+ maxims', 
      color: 'bg-orange-100 dark:bg-orange-500/10', 
      content: 'Add legal maxims you need to remember...' 
    }
  ];

  // Load user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Test backend connection first
        try {
          const testResponse = await axios.get('http://localhost:3000/api/law-student/test');
          console.log('🌐 Backend connection test:', testResponse.data);
        } catch (testError) {
          console.error('❌ Backend not reachable:', testError.message);
          console.error('Make sure server is running on port 3000');
        }

        const response = await authService.getCurrentUser();
        console.log('🔐 Auth response:', response);
        
        // Backend returns 'id', not '_id'
        const userId = response.user?.id || response.user?._id;
        
        if (!userId) {
          console.error('❌ No user ID found in response:', response);
          navigate('/login');
          return;
        }
        
        // Normalize user object to always have _id
        const normalizedUser = {
          ...response.user,
          _id: userId
        };
        
        setUser(normalizedUser);
        console.log('✅ User authenticated:', normalizedUser.email, 'ID:', userId);
        
        // Load user's learning data from backend
        await loadUserProgress(userId);
      } catch (error) {
        console.error('❌ Auth error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const loadUserProgress = async (userId) => {
    try {
      console.log('🔑 Loading progress for user ID:', userId);
      const response = await axios.get(`http://localhost:3000/api/law-student/progress/${userId}`);
      console.log('📥 Loaded data from backend:', response.data);
      console.log('📦 Full loaded data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.modules && response.data.modules.length > 0) {
        // Restore icons from defaultModules
        const modulesWithIcons = response.data.modules.map((mod, idx) => ({
          ...mod,
          icon: defaultModules[idx]?.icon || Scale
        }));
        setLearningModules(modulesWithIcons);
        console.log('✅ Loaded modules:', modulesWithIcons.length, modulesWithIcons);
      } else {
        setLearningModules(defaultModules);
        console.log('ℹ️ Using default modules');
      }

      if (response.data.notes && response.data.notes.length > 0) {
        setQuickNotes(response.data.notes);
        console.log('✅ Loaded notes:', response.data.notes.length, response.data.notes);
      } else {
        setQuickNotes(defaultNotes);
        console.log('ℹ️ Using default notes');
      }

      if (response.data.studyTime) {
        setStudyTime(response.data.studyTime);
        console.log('✅ Loaded study time:', response.data.studyTime);
      }

      if (response.data.examNotes && response.data.examNotes.length > 0) {
        setExamNotes(response.data.examNotes);
        console.log('✅ Loaded exam notes:', response.data.examNotes.length, response.data.examNotes);
      } else {
        console.log('ℹ️ No exam notes found in backend');
      }

      if (response.data.chatHistory && response.data.chatHistory.length > 0) {
        setChatMessages(response.data.chatHistory);
        console.log('✅ Loaded chat history:', response.data.chatHistory.length);
      }

      // Mark data as loaded to enable auto-save
      setIsDataLoaded(true);
      console.log('🎉 All data loaded from backend for user:', userId);
    } catch (error) {
      console.error('❌ Error loading progress:', error.response?.data || error.message);
      console.log('ℹ️ Using defaults for user:', userId);
      setLearningModules(defaultModules);
      setQuickNotes(defaultNotes);
      setIsDataLoaded(true); // Enable auto-save even with defaults
      
      // Save defaults immediately for new users
      console.log('💾 Saving default data for new user...');
      setTimeout(() => {
        if (user?._id) {
          saveUserProgress();
        }
      }, 500);
    }
  };

  const saveUserProgress = async () => {
    if (!user?._id) {
      console.warn('⚠️ Cannot save: No user ID available');
      return;
    }

    try {
      console.log('🔍 Current state before saving:');
      console.log('  - learningModules:', learningModules.length);
      console.log('  - quickNotes:', quickNotes.length);
      console.log('  - examNotes:', examNotes.length, examNotes);
      console.log('  - chatMessages:', chatMessages.length, chatMessages.slice(0, 2));
      console.log('  - studyTime:', studyTime);
      
      // Remove icon property before saving (can't serialize functions)
      const modulesWithoutIcons = learningModules.map(({ icon, ...rest }) => rest);

      const dataToSave = {
        userId: user._id,
        modules: modulesWithoutIcons,
        notes: quickNotes,
        studyTime,
        examNotes,
        chatHistory: chatMessages
      };

      console.log('💾 Saving to backend for user:', user._id, {
        modules: modulesWithoutIcons.length,
        notes: quickNotes.length,
        examNotes: examNotes.length,
        chatMessages: chatMessages.length,
        studyTime
      });
      console.log('📦 Full data being saved:', JSON.stringify(dataToSave, null, 2));
      console.log('🔍 examNotes array:', examNotes);
      console.log('🔍 chatMessages array:', chatMessages.slice(0, 3)); // Show first 3 messages

      const response = await axios.post('http://localhost:3000/api/law-student/progress', dataToSave);
      console.log('✅ Progress saved successfully for user:', user._id);
      console.log('📨 Server response:', response.data);
    } catch (error) {
      console.error('❌ Failed to save progress for user:', user._id, error.response?.data || error.message);
      console.error('Full error:', error);
    }
  };

  // Save to backend when data changes (with debouncing)
  useEffect(() => {
    if (user?._id && isDataLoaded && learningModules.length > 0) {
      const timer = setTimeout(() => {
        saveUserProgress();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [learningModules, user, isDataLoaded]);

  useEffect(() => {
    if (user?._id && isDataLoaded && quickNotes.length > 0) {
      const timer = setTimeout(() => {
        saveUserProgress();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [quickNotes, user, isDataLoaded]);

  useEffect(() => {
    if (user?._id && isDataLoaded && studyTime > 0) {
      const timer = setTimeout(() => {
        saveUserProgress();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [studyTime, user, isDataLoaded]);

  useEffect(() => {
    if (user?._id && isDataLoaded && examNotes.length > 0) {
      const timer = setTimeout(() => {
        console.log('⏰ useEffect auto-save triggered for examNotes');
        console.log('📊 examNotes length in useEffect:', examNotes.length);
        console.log('📊 examNotes content:', examNotes);
        saveUserProgress();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [examNotes, user, isDataLoaded]);

  useEffect(() => {
    if (user?._id && isDataLoaded && chatMessages.length > 0) {
      const timer = setTimeout(() => {
        saveUserProgress();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [chatMessages, user, isDataLoaded]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/law-student/chat', {
        message: userMessage
      });

      setChatMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: response.data.response,
          confidence: response.data.confidence
        }
      ]);

      // Auto-update learning progress based on topic discussed
      updateProgressFromChat(userMessage);

    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: `Error: ${error.response?.data?.details || error.message || 'Connection failed. Please check if the server is running.'}`,
          confidence: null
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickQuery = (query) => {
    setChatInput(query);
    setChatOpen(true);
    // Send message after state updates
    setTimeout(async () => {
      const userMessage = query;
      setChatMessages(prev => [...prev, { type: 'user', content: userMessage }]);
      setChatLoading(true);

      try {
        const response = await axios.post('http://localhost:3000/api/law-student/chat', {
          message: userMessage
        });

        setChatMessages(prev => [
          ...prev,
          {
            type: 'bot',
            content: response.data.response,
            confidence: response.data.confidence
          }
        ]);
      } catch (error) {
        console.error('Chat error:', error);
        setChatMessages(prev => [
          ...prev,
          {
            type: 'bot',
            content: `Error: ${error.response?.data?.details || error.message || 'Failed to connect to AI service. Please ensure the server is running.'}`,
            confidence: null
          }
        ]);
      } finally {
        setChatLoading(false);
      }
    }, 100);
  };

  const handleGenerateNotes = async (topic) => {
    setGeneratingNotes(true);
    setSelectedModule(topic);

    try {
      const response = await axios.post('http://localhost:3000/api/law-student/generate-notes', {
        topic: topic
      });

      setChatMessages([
        {
          type: 'bot',
          content: response.data.notes,
          confidence: 92
        }
      ]);
      setChatOpen(true);
    } catch (error) {
      console.error('Generate notes error:', error);
      setChatMessages([
        {
          type: 'bot',
          content: `Failed to generate notes: ${error.response?.data?.details || error.message}. Please check server console for details.`,
          confidence: null
        }
      ]);
      setChatOpen(true);
    } finally {
      setGeneratingNotes(false);
    }
  };

  const handleModuleClick = (index) => {
    const newModules = learningModules.map((module, i) => ({
      ...module,
      isActive: i === index
    }));
    setLearningModules(newModules);
    handleGenerateNotes(newModules[index].title);
  };

  const handleEditProgress = (e, index) => {
    e.stopPropagation();
    setEditingModule(index);
    setTempProgress(learningModules[index].progress);
    setTempModuleTitle(learningModules[index].title);
    setTempModuleTopics(learningModules[index].topics);
  };

  const handleSaveProgress = async () => {
    if (editingModule !== null) {
      const newModules = [...learningModules];
      newModules[editingModule] = {
        ...newModules[editingModule],
        progress: Math.min(100, Math.max(0, tempProgress)),
        title: tempModuleTitle,
        topics: Math.max(0, tempModuleTopics)
      };
      setLearningModules(newModules);
      setEditingModule(null);
      
      // Immediate save after edit
      if (user?._id) {
        setTimeout(() => saveUserProgress(), 100);
      }
    }
  };

  const handleAddModule = () => {
    setIsAddingModule(true);
    setTempModuleTitle('');
    setTempModuleTopics(0);
    setTempProgress(0);
  };

  const handleSaveNewModule = async () => {
    if (tempModuleTitle.trim()) {
      const colors = [
        { color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-500/10', icon: Scale },
        { color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-500/10', icon: Gavel },
        { color: 'from-emerald-400 to-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-500/10', icon: FileText },
        { color: 'from-amber-400 to-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-500/10', icon: BookOpen },
        { color: 'from-pink-400 to-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-500/10', icon: Scale },
        { color: 'from-indigo-400 to-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-500/10', icon: Gavel }
      ];
      const randomTheme = colors[Math.floor(Math.random() * colors.length)];

      const newModule = {
        title: tempModuleTitle,
        topics: tempModuleTopics,
        progress: tempProgress,
        color: randomTheme.color,
        bgColor: randomTheme.bgColor,
        icon: randomTheme.icon,
        isActive: false
      };

      setLearningModules([...learningModules, newModule]);
      setIsAddingModule(false);
      setTempModuleTitle('');
      setTempModuleTopics(0);
      setTempProgress(0);
      
      // Immediate save after adding
      if (user?._id) {
        setTimeout(() => saveUserProgress(), 100);
      }
    }
  };

  const handleDeleteModule = (e, index) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this module?')) {
      const newModules = learningModules.filter((_, idx) => idx !== index);
      setLearningModules(newModules);
      
      // Immediate save after delete
      if (user?._id) {
        setTimeout(() => saveUserProgress(), 100);
      }
    }
  };

  const handleEditNote = (e, index) => {
    e.stopPropagation();
    setEditingNote(index);
    setTempNoteTitle(quickNotes[index].title);
    setTempNoteContent(quickNotes[index].content || '');
  };

  const handleSaveNote = () => {
    if (editingNote !== null) {
      const newNotes = [...quickNotes];
      newNotes[editingNote] = {
        ...newNotes[editingNote],
        title: tempNoteTitle,
        content: tempNoteContent
      };
      setQuickNotes(newNotes);
      setEditingNote(null);
      setTempNoteTitle('');
      setTempNoteContent('');
      
      // Immediate save after edit
      if (user?._id) {
        setTimeout(() => saveUserProgress(), 100);
      }
    }
  };

  const handleAddNote = () => {
    setIsAddingNote(true);
    setTempNoteTitle('');
    setTempNoteContent('');
  };

  const handleSaveNewNote = () => {
    if (tempNoteTitle.trim()) {
      const colors = [
        'bg-pink-100 dark:bg-pink-500/10',
        'bg-indigo-100 dark:bg-indigo-500/10',
        'bg-teal-100 dark:bg-teal-500/10',
        'bg-orange-100 dark:bg-orange-500/10',
        'bg-purple-100 dark:bg-purple-500/10',
        'bg-blue-100 dark:bg-blue-500/10'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newNote = {
        id: Date.now(),
        title: tempNoteTitle,
        content: tempNoteContent || 'Add your notes here...',
        color: randomColor
      };

      setQuickNotes([...quickNotes, newNote]);
      setIsAddingNote(false);
      setTempNoteTitle('');
      setTempNoteContent('');
      
      // Immediate save after adding
      if (user?._id) {
        setTimeout(() => saveUserProgress(), 100);
      }
    }
  };

  const handleDeleteNote = (e, index) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      const newNotes = quickNotes.filter((_, idx) => idx !== index);
      setQuickNotes(newNotes);
      
      // Immediate save after delete
      if (user?._id) {
        setTimeout(() => saveUserProgress(), 100);
      }
    }
  };

  const handleViewNote = (index) => {
    const note = quickNotes[index];
    setChatMessages([
      {
        type: 'bot',
        content: `**${note.title}**\n\n${note.content}`,
        confidence: null
      }
    ]);
    setChatOpen(true);
  };

  // Exam Notes CRUD Functions
  const handleAddExamNote = (type) => {
    setIsAddingExamNote(true);
    setExamNoteType(type);
    setTempExamNoteTitle('');
    setTempExamNoteContent('');
    setTempExamNoteSubject('');
  };

  const handleSaveNewExamNote = () => {
    if (tempExamNoteTitle.trim() && tempExamNoteContent.trim()) {
      const newExamNote = {
        id: Date.now(),
        title: tempExamNoteTitle,
        content: tempExamNoteContent,
        subject: tempExamNoteSubject || 'General',
        type: examNoteType,
        createdAt: new Date().toISOString()
      };

      console.log('➕ Adding new exam note:', newExamNote);
      const updatedExamNotes = [...examNotes, newExamNote];
      console.log('🔄 Previous examNotes length:', examNotes.length);
      console.log('🔄 New examNotes length:', updatedExamNotes.length);
      console.log('🔄 New examNotes array:', updatedExamNotes);
      
      setExamNotes(updatedExamNotes);
      setIsAddingExamNote(false);
      setTempExamNoteTitle('');
      setTempExamNoteContent('');
      setTempExamNoteSubject('');
      
      // Force immediate save with updated state
      if (user?._id && isDataLoaded) {
        setTimeout(() => {
          console.log('💾 Triggering save after adding exam note');
          console.log('🔍 ExamNotes state at save time:', examNotes.length);
          saveUserProgress();
        }, 500); // Increased timeout
      }
    }
  };

  const handleEditExamNote = (e, index) => {
    e.stopPropagation();
    const note = examNotes[index];
    setEditingExamNote(index);
    setTempExamNoteTitle(note.title);
    setTempExamNoteContent(note.content);
    setTempExamNoteSubject(note.subject);
    setExamNoteType(note.type);
  };

  const handleSaveExamNote = () => {
    if (editingExamNote !== null && tempExamNoteTitle.trim() && tempExamNoteContent.trim()) {
      const newExamNotes = [...examNotes];
      newExamNotes[editingExamNote] = {
        ...newExamNotes[editingExamNote],
        title: tempExamNoteTitle,
        content: tempExamNoteContent,
        subject: tempExamNoteSubject
      };
      
      console.log('✏️ Updating exam note at index:', editingExamNote);
      setExamNotes(newExamNotes);
      setEditingExamNote(null);
      setTempExamNoteTitle('');
      setTempExamNoteContent('');
      setTempExamNoteSubject('');
      
      // Immediate save after edit - wait for state to settle
      if (user?._id && isDataLoaded) {
        setTimeout(() => {
          console.log('💾 Triggering save after editing exam note');
          saveUserProgress();
        }, 200);
      }
    }
  };

  const handleDeleteExamNote = (e, index) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this exam note?')) {
      const newExamNotes = examNotes.filter((_, idx) => idx !== index);
      console.log('🗑️ Deleting exam note at index:', index);
      setExamNotes(newExamNotes);
      
      // Immediate save after delete - wait for state to settle
      if (user?._id && isDataLoaded) {
        setTimeout(() => {
          console.log('💾 Triggering save after deleting exam note');
          saveUserProgress();
        }, 200);
      }
    }
  };

  const handleViewExamNote = (index) => {
    const note = examNotes[index];
    setChatMessages([
      {
        type: 'bot',
        content: `**${note.title}**\n\n*Subject: ${note.subject}*\n\n${note.content}`,
        confidence: null
      }
    ]);
    setChatOpen(true);
  };

  const updateProgressFromChat = (message) => {
    const messageLower = message.toLowerCase();
    const progressIncrement = 2; // Increase progress by 2% per relevant chat
    const topicsIncrement = 1; // Add 1 topic per relevant chat

    setLearningModules(prevModules => {
      const updatedModules = prevModules.map(module => {
        // Check if message is related to this module
        const isRelevant = 
          (messageLower.includes('constitutional') && module.title.includes('Constitutional')) ||
          (messageLower.includes('criminal') && module.title.includes('Criminal')) ||
          (messageLower.includes('ipc') && module.title.includes('IPC')) ||
          (messageLower.includes('contract') && module.title.includes('Contract')) ||
          (messageLower.includes('civil') && module.title.includes('Civil')) ||
          (messageLower.includes('procedure') && module.title.includes('Procedure')) ||
          (messageLower.includes('article') && module.title.includes('Constitutional')) ||
          (messageLower.includes('section') && (module.title.includes('Criminal') || module.title.includes('IPC')));

        if (isRelevant) {
          return {
            ...module,
            progress: Math.min(100, module.progress + progressIncrement),
            topics: module.topics + topicsIncrement
          };
        }
        return module;
      });
      
      // Immediate save after chat progress update
      if (user?._id && isDataLoaded) {
        setTimeout(() => saveUserProgress(), 100);
      }
      
      return updatedModules;
    });
  };

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

      <main className="page-transition container mx-auto max-w-6xl px-4 pt-24 pb-8">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-500/10 dark:to-indigo-500/10 p-6 shadow-lg">
              <BookOpen className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Law Student Hub</h1>
          <p className="text-sm text-muted-foreground">Master Indian Law with Smart Study Tools & AI Tutor</p>
        </div>

        {/* Study Timer */}
        <div className="mb-6 rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-sm font-semibold text-muted-foreground">Today's Study Time</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatTime(studyTime)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`rounded-xl px-6 py-3 font-semibold shadow-md transition-all hover:scale-105 ${
                  isTimerRunning
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isTimerRunning ? 'Pause' : 'Start Study'}
              </button>
              <button
                onClick={() => setStudyTime(0)}
                className="rounded-xl border border-border bg-card px-4 py-3 font-semibold transition-all hover:bg-accent"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Learning Modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Progress */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Your Learning Progress</h2>
                <button
                  onClick={handleAddModule}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Add Module
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {learningModules.map((module, index) => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleModuleClick(index)}
                      disabled={generatingNotes}
                      className={`group cursor-pointer rounded-2xl border ${
                        module.isActive ? 'border-purple-300 dark:border-purple-500' : 'border-border'
                      } ${module.bgColor} p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg ${
                        generatingNotes ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className={`rounded-lg bg-gradient-to-br ${module.color} p-2.5`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white dark:bg-background px-2.5 py-1 text-xs font-semibold shadow-sm">
                            {module.topics} topics
                          </span>
                          <button
                            onClick={(e) => handleEditProgress(e, index)}
                            className="rounded-full bg-white dark:bg-background p-1.5 shadow-sm transition-all hover:scale-110 hover:bg-purple-100 dark:hover:bg-purple-500/20"
                            title="Edit module"
                          >
                            <Edit2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteModule(e, index)}
                            className="rounded-full bg-white dark:bg-background p-1.5 shadow-sm transition-all hover:scale-110 hover:bg-red-100 dark:hover:bg-red-500/20"
                            title="Delete module"
                          >
                            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                      <h3 className="mb-2 font-bold text-foreground">{module.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/50 dark:bg-background/50">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${module.color} transition-all`}
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-foreground">{module.progress}%</span>
                      </div>
                      {module.isActive && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                          <Sparkles className="h-3 w-3" />
                          <span>Click for AI notes</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Notes Access */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Quick Notes & References</h2>
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  Add Note
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickNotes.map((note, index) => (
                  <div
                    key={index}
                    className={`relative rounded-xl border border-border ${note.color} p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md ${
                      generatingNotes ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <BookMarked className="h-5 w-5 text-foreground" />
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewNote(index);
                          }}
                          disabled={generatingNotes}
                          className="rounded-full bg-white dark:bg-background p-1 shadow-sm transition-all hover:scale-110 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                          title="View notes"
                        >
                          <BookOpen className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => handleEditNote(e, index)}
                          disabled={generatingNotes}
                          className="rounded-full bg-white dark:bg-background p-1 shadow-sm transition-all hover:scale-110 hover:bg-purple-100 dark:hover:bg-purple-500/20"
                          title="Edit notes"
                        >
                          <Pencil className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(e, index)}
                          disabled={generatingNotes}
                          className="rounded-full bg-white dark:bg-background p-1 shadow-sm transition-all hover:scale-110 hover:bg-red-100 dark:hover:bg-red-500/20"
                          title="Delete note"
                        >
                          <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-foreground">{note.title}</h3>
                    <p className="text-xs text-muted-foreground">{note.articles || note.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Prep Tools */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 p-2.5">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Exam Preparation</h2>
                </div>
              </div>

              {/* Revision Notes Section */}
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-foreground">Revision Notes</h3>
                  </div>
                  <button
                    onClick={() => handleAddExamNote('revision')}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white transition-all hover:scale-105"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {examNotes.filter(note => note.type === 'revision').length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No revision notes yet. Click "Add" to create one.</p>
                  ) : (
                    examNotes.filter(note => note.type === 'revision').map((note, index) => {
                      const actualIndex = examNotes.findIndex(n => n.id === note.id);
                      return (
                        <div
                          key={note.id}
                          className="group relative rounded-lg border border-amber-200 dark:border-amber-500/20 bg-white dark:bg-background p-3 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 cursor-pointer" onClick={() => handleViewExamNote(actualIndex)}>
                              <p className="text-xs font-semibold text-foreground">{note.title}</p>
                              <p className="text-xs text-muted-foreground">Subject: {note.subject}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => handleEditExamNote(e, actualIndex)}
                                className="rounded-full bg-purple-100 dark:bg-purple-500/20 p-1 transition-all hover:scale-110"
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteExamNote(e, actualIndex)}
                                className="rounded-full bg-red-100 dark:bg-red-500/20 p-1 transition-all hover:scale-110"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Key Points Section */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-foreground">Key Points</h3>
                  </div>
                  <button
                    onClick={() => handleAddExamNote('keypoint')}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white transition-all hover:scale-105"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {examNotes.filter(note => note.type === 'keypoint').length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No key points yet. Click "Add" to create one.</p>
                  ) : (
                    examNotes.filter(note => note.type === 'keypoint').map((note, index) => {
                      const actualIndex = examNotes.findIndex(n => n.id === note.id);
                      return (
                        <div
                          key={note.id}
                          className="group relative rounded-lg border border-amber-200 dark:border-amber-500/20 bg-white dark:bg-background p-3 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 cursor-pointer" onClick={() => handleViewExamNote(actualIndex)}>
                              <p className="text-xs font-semibold text-foreground">{note.title}</p>
                              <p className="text-xs text-muted-foreground">Subject: {note.subject}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => handleEditExamNote(e, actualIndex)}
                                className="rounded-full bg-purple-100 dark:bg-purple-500/20 p-1 transition-all hover:scale-110"
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteExamNote(e, actualIndex)}
                                className="rounded-full bg-red-100 dark:bg-red-500/20 p-1 transition-all hover:scale-110"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Student Assistant Bot */}
          <div className="space-y-6">
            {/* AI Study Assistant */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 p-6 shadow-lg">
              <div className="mb-4 text-center">
                <div className="mb-3 flex justify-center">
                  <div className="rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-3 shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="mb-1 font-bold text-foreground">Study Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by Groq AI • Ask anything</p>
              </div>
              
              <div className="mb-4 space-y-2">
                <button 
                  onClick={() => handleQuickQuery('Explain Article 21 in simple terms')}
                  className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-background px-3 py-2 text-left text-xs transition-all hover:scale-[1.02] hover:shadow-md"
                >
                  Explain Article 21 in simple terms
                </button>
                <button 
                  onClick={() => handleQuickQuery('Key differences: IPC vs CrPC')}
                  className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-background px-3 py-2 text-left text-xs transition-all hover:scale-[1.02] hover:shadow-md"
                >
                  Key differences: IPC vs CrPC
                </button>
                <button 
                  onClick={() => handleQuickQuery('Summarize contract essentials')}
                  className="w-full rounded-lg border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-background px-3 py-2 text-left text-xs transition-all hover:scale-[1.02] hover:shadow-md"
                >
                  Summarize contract essentials
                </button>
              </div>

              <button
                onClick={() => setChatOpen(true)}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
              >
                Open Study Assistant
              </button>
            </div>

            {/* Study Stats */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-foreground">This Week</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Topics Covered</span>
                  <span className="font-bold text-foreground">
                    {learningModules.reduce((sum, module) => sum + (module.topics || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Study Hours</span>
                  <span className="font-bold text-foreground">{(studyTime / 3600).toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Queries</span>
                  <span className="font-bold text-foreground">{chatMessages.filter(m => m.type === 'user').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Progress</span>
                  <span className="font-bold text-emerald-600">
                    {learningModules.length > 0 
                      ? Math.round(learningModules.reduce((sum, m) => sum + (m.progress || 0), 0) / learningModules.length)
                      : 0}% 🔥
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Window */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl h-[600px] rounded-2xl border border-border bg-background shadow-2xl flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 p-2">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Law Study Assistant</h3>
                  <p className="text-xs text-muted-foreground">Powered by Groq AI • Llama 3.3 70B</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <Sparkles className="mx-auto mb-3 h-12 w-12 text-indigo-500" />
                    <p className="text-sm text-muted-foreground">Ask me anything about Indian law!</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'user' ? (
                      <div className="max-w-[80%] rounded-lg bg-purple-600 dark:bg-purple-700 px-4 py-3 text-white">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ) : (
                      <div className="max-w-[90%] rounded-lg border border-border bg-card p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">AI Tutor</span>
                          {message.confidence && (
                            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 border border-green-500/20">
                              {message.confidence}% Confidence
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-foreground whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                          {message.content.split('\n').map((line, lineIdx) => {
                            // First, handle ** bold formatting for any line
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

                            // Check if line is a numbered heading (e.g., "1. Key Definition:" or "1. **Hacking**:")
                            if (/^\d+\.\s+/.test(line)) {
                              return (
                                <div key={lineIdx} className="my-2">
                                  {processBoldText(line)}
                                </div>
                              );
                            }
                            
                            // Check for bold text with **
                            if (line.includes('**')) {
                              return (
                                <div key={lineIdx} className="my-1">
                                  {processBoldText(line)}
                                </div>
                              );
                            }
                            
                            // Regular line
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
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about any legal concept..."
                  disabled={chatLoading}
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Progress Modal */}
      {editingModule !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className={`rounded-lg bg-gradient-to-br ${learningModules[editingModule].color} p-2.5`}>
                <Edit2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Edit Learning Module</h3>
                <p className="text-xs text-muted-foreground">Update module details</p>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Module Title
                </label>
                <input
                  type="text"
                  value={tempModuleTitle}
                  onChange={(e) => setTempModuleTitle(e.target.value)}
                  placeholder="e.g., Constitutional Law"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Topics Count
                </label>
                <input
                  type="number"
                  value={tempModuleTopics}
                  onChange={(e) => setTempModuleTopics(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Progress: {tempProgress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempProgress}
                  onChange={(e) => setTempProgress(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingModule(null)}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold transition-all hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105"
              >
                <Save className="inline h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {isAddingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 p-2.5">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Add Learning Module</h3>
                <p className="text-xs text-muted-foreground">Create a new subject to track</p>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Module Title *
                </label>
                <input
                  type="text"
                  value={tempModuleTitle}
                  onChange={(e) => setTempModuleTitle(e.target.value)}
                  placeholder="e.g., Property Law, Taxation Law"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Topics Count
                </label>
                <input
                  type="number"
                  value={tempModuleTopics}
                  onChange={(e) => setTempModuleTopics(parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Initial Progress: {tempProgress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempProgress}
                  onChange={(e) => setTempProgress(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAddingModule(false);
                  setTempModuleTitle('');
                  setTempModuleTopics(0);
                  setTempProgress(0);
                }}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold transition-all hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewModule}
                disabled={!tempModuleTitle.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="inline h-4 w-4 mr-2" />
                Add Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className={`rounded-lg ${quickNotes[editingNote].color} p-2.5`}>
                <Pencil className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Edit Notes</h3>
                <p className="text-xs text-muted-foreground">{quickNotes[editingNote].title}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Note Title
              </label>
              <input
                type="text"
                value={tempNoteTitle}
                onChange={(e) => setTempNoteTitle(e.target.value)}
                placeholder="e.g., Constitutional Law Notes"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              
              <label className="mb-2 block text-sm font-medium text-foreground">
                Your Notes
              </label>
              <textarea
                value={tempNoteContent}
                onChange={(e) => setTempNoteContent(e.target.value)}
                rows="10"
                placeholder="Add your notes, important points, mnemonics, or anything you want to remember..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingNote(null)}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold transition-all hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105"
              >
                <Save className="inline h-4 w-4 mr-2" />
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 p-2.5">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Add New Note</h3>
                <p className="text-xs text-muted-foreground">Create a custom note for your studies</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Note Title *
              </label>
              <input
                type="text"
                value={tempNoteTitle}
                onChange={(e) => setTempNoteTitle(e.target.value)}
                placeholder="e.g., IPC Sections, Case Laws, Study Tips..."
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              
              <label className="mb-2 block text-sm font-medium text-foreground">
                Note Content
              </label>
              <textarea
                value={tempNoteContent}
                onChange={(e) => setTempNoteContent(e.target.value)}
                rows="10"
                placeholder="Add your notes, important points, mnemonics, or anything you want to remember..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setTempNoteTitle('');
                  setTempNoteContent('');
                }}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold transition-all hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewNote}
                disabled={!tempNoteTitle.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="inline h-4 w-4 mr-2" />
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam Note Modal */}
      {isAddingExamNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 p-2.5">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Add {examNoteType === 'revision' ? 'Revision Note' : 'Key Point'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {examNoteType === 'revision' ? 'Create a revision summary for exam prep' : 'Add an important key point to remember'}
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Title *
                </label>
                <input
                  type="text"
                  value={tempExamNoteTitle}
                  onChange={(e) => setTempExamNoteTitle(e.target.value)}
                  placeholder={examNoteType === 'revision' ? 'e.g., Constitutional Law Chapter 3' : 'e.g., Important IPC Sections'}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Subject
                </label>
                <input
                  type="text"
                  value={tempExamNoteSubject}
                  onChange={(e) => setTempExamNoteSubject(e.target.value)}
                  placeholder="e.g., Constitutional Law, Criminal Law, etc."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Content *
                </label>
                <textarea
                  value={tempExamNoteContent}
                  onChange={(e) => setTempExamNoteContent(e.target.value)}
                  rows="12"
                  placeholder={examNoteType === 'revision' 
                    ? 'Add revision notes, summaries, important points...\n\nExample:\n• Article 14: Equality before law\n• Article 21: Right to life and personal liberty\n• Article 32: Right to Constitutional Remedies'
                    : 'Add key points to remember...\n\nExample:\n1. Section 302 - Murder (Life imprisonment or death)\n2. Section 304 - Culpable homicide not amounting to murder\n3. Section 307 - Attempt to murder'}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAddingExamNote(false);
                  setTempExamNoteTitle('');
                  setTempExamNoteContent('');
                  setTempExamNoteSubject('');
                }}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold transition-all hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewExamNote}
                disabled={!tempExamNoteTitle.trim() || !tempExamNoteContent.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="inline h-4 w-4 mr-2" />
                Create {examNoteType === 'revision' ? 'Revision Note' : 'Key Point'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exam Note Modal */}
      {editingExamNote !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 p-2.5">
                <Pencil className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Edit {examNoteType === 'revision' ? 'Revision Note' : 'Key Point'}
                </h3>
                <p className="text-xs text-muted-foreground">Update your exam preparation notes</p>
              </div>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Title *
                </label>
                <input
                  type="text"
                  value={tempExamNoteTitle}
                  onChange={(e) => setTempExamNoteTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Subject
                </label>
                <input
                  type="text"
                  value={tempExamNoteSubject}
                  onChange={(e) => setTempExamNoteSubject(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Content *
                </label>
                <textarea
                  value={tempExamNoteContent}
                  onChange={(e) => setTempExamNoteContent(e.target.value)}
                  rows="12"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingExamNote(null);
                  setTempExamNoteTitle('');
                  setTempExamNoteContent('');
                  setTempExamNoteSubject('');
                }}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold transition-all hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExamNote}
                disabled={!tempExamNoteTitle.trim() || !tempExamNoteContent.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="inline h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LawStudent;
