import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';

function Chat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Build conversation history for context (don't include current message)
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await axios.post('http://localhost:3000/rag/query', {
        query: userMessage.content,
        conversation_history: conversationHistory,
        max_results: 5
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.data.answer,
        sources: response.data.data.sources,
        confidence_score: response.data.data.confidence_score
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to get response. Please make sure the RAG service is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h2>
            <span>🤖</span>
            Legal Assistant
          </h2>
          <button className="chat-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-chat-icon">💬</div>
              <h3>Start a Conversation</h3>
              <p>Ask me anything about Indian law including civil, criminal, cyber, consumer, family, property law and more</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  {message.content}
                  {message.type === 'bot' && message.confidence_score && (
                    <div className="confidence-badge" style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      display: 'inline-block',
                      backgroundColor: message.confidence_score >= 0.7 ? '#4CAF50' : message.confidence_score >= 0.5 ? '#FF9800' : '#f44336',
                      color: 'white'
                    }}>
                      Confidence: {(message.confidence_score * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about any area of Indian law - civil, criminal, cyber, consumer, family, property..."
              rows={1}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
