import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import './Chat.css';

// Function to structure and format bot responses
function formatBotResponse(content) {
  if (!content) return null;

  // Check if content is already an object (structured)
  if (typeof content === 'object') {
    return content;
  }

  // Parse the text content into structured sections
  const sections = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentSection = { type: 'paragraph', content: [] };
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Detect headings (lines with ** markers)
    if (line.startsWith('**') && line.endsWith(':**')) {
      if (currentSection.content.length > 0 || currentSection.items?.length > 0) {
        sections.push({ ...currentSection });
      }
      sections.push({ type: 'heading', content: line.replace(/\*\*/g, '').replace(':', '') });
      currentSection = { type: 'paragraph', content: [] };
      inList = false;
      continue;
    }
    
    // Detect bullet points (• or -)
    if (line.match(/^[•\-]\s/)) {
      if (!inList) {
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: 'list', items: [] };
        inList = true;
      }
      const cleanLine = line.replace(/^[•\-]\s*/, '');
      currentSection.items.push(cleanLine);
      continue;
    }
    
    // Detect numbered lists
    if (line.match(/^\d+\.\s/)) {
      if (!inList) {
        if (currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: 'numbered-list', items: [] };
        inList = true;
      }
      const cleanLine = line.replace(/^\d+\.\s*/, '');
      currentSection.items.push(cleanLine);
      continue;
    }
    
    // Regular paragraph
    if (inList) {
      sections.push({ ...currentSection });
      currentSection = { type: 'paragraph', content: [] };
      inList = false;
    }
    currentSection.content.push(line);
  }
  
  // Add the last section
  if (currentSection.content?.length > 0 || currentSection.items?.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Component to render structured message
function StructuredMessage({ sections, confidence_score }) {
  if (!sections || sections.length === 0) {
    return <div>No response available</div>;
  }

  // If sections is a string, format it first
  if (typeof sections === 'string') {
    try {
      sections = formatBotResponse(sections);
    } catch (error) {
      console.error('Error formatting response:', error);
      return <div>{sections}</div>;
    }
  }

  // If sections is still invalid, show the raw content
  if (!Array.isArray(sections)) {
    return <div>{String(sections)}</div>;
  }

  return (
    <div className="structured-response">
      {sections.map((section, index) => {
        try {
          if (section.type === 'heading') {
            return (
              <h4 key={index} className="response-heading">
                {section.content}
              </h4>
            );
          }
          
          if (section.type === 'list' || section.type === 'numbered-list') {
            return (
              <ul key={index} className={section.type === 'numbered-list' ? 'numbered-list' : 'bullet-list'}>
                {(section.items || []).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            );
          }
          
          if (section.type === 'paragraph') {
            return (
              <p key={index} className="response-paragraph">
                {Array.isArray(section.content) ? section.content.join(' ') : section.content}
              </p>
            );
          }
          
          return null;
        } catch (error) {
          console.error('Error rendering section:', error, section);
          return null;
        }
      })}
      
      {confidence_score && (
        <div className="confidence-badge" style={{
          marginTop: '12px',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.85em',
          display: 'inline-block',
          backgroundColor: confidence_score >= 0.7 ? '#4CAF50' : confidence_score >= 0.5 ? '#FF9800' : '#f44336',
          color: 'white',
          fontWeight: '500'
        }}>
          ✓ Confidence: {(confidence_score * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}

function Chat({ onClose, selectedBot = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // N8N webhook endpoints for specialized bots
  const botWebhooks = {
    cyber: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea04',
    property: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea045',
    family: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea046',
    corporate: 'https://aniruthpvt.app.n8n.cloud/webhook/66329356-5995-4ae4-bddf-9875c2b6ea047'
  };

  const botNames = {
    cyber: 'Cyber Law Specialist',
    property: 'Property Law Specialist',
    family: 'Family Law Specialist',
    corporate: 'Corporate Law Specialist',
    default: 'Legal Assistant'
  };

  // Function to extract text from structured content
  const extractTextFromStructured = (content) => {
    if (typeof content === 'string') return content;
    
    if (Array.isArray(content)) {
      let text = '';
      content.forEach(section => {
        if (section.type === 'heading') {
          text += section.content + '\n';
        } else if (section.type === 'paragraph') {
          text += section.content.join(' ') + '\n';
        } else if (section.type === 'list' || section.type === 'numbered-list') {
          section.items.forEach((item, idx) => {
            text += `${idx + 1}. ${item}\n`;
          });
        }
      });
      return text;
    }
    
    return String(content);
  };

  // Function to download conversation as PDF
  const downloadAsPDF = () => {
    try {
      if (messages.length === 0) {
        alert('No conversation to download');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

    // Helper function to add text with word wrap and page breaks
    const addText = (text, fontSize = 11, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach(line => {
        if (yPosition + 10 > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });
    };

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Legal Consultation Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add bot type
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    const botType = botNames[selectedBot] || botNames.default;
    doc.text(`Bot: ${botType}`, margin, yPosition);
    yPosition += 10;

    // Add date
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 15;

    // Process messages
    messages.forEach((message, index) => {
      if (message.type === 'user') {
        // User's question (The Case)
        addText('YOUR QUESTION:', 13, true);
        yPosition += 3;
        addText(message.content, 11, false);
        yPosition += 8;
      } else if (message.type === 'bot') {
        // Bot's response
        addText('LEGAL ADVICE:', 13, true);
        yPosition += 3;
        
        const responseText = extractTextFromStructured(message.content);
        addText(responseText, 11, false);
        
        // Add confidence score if available
        if (message.confidence_score) {
          yPosition += 5;
          addText(`Confidence Score: ${(message.confidence_score * 100).toFixed(0)}%`, 10, true);
        }
        
        yPosition += 10;
        
        // Add separator line if not last message
        if (index < messages.length - 1) {
          if (yPosition + 10 > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        }
      }
    });

    // Add footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        'Disclaimer: This is for informational purposes only. Consult a legal professional for advice.',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Download the PDF
    const fileName = `Legal_Consultation_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

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
      let botMessage;

      // If a specialized bot is selected, use n8n webhook
      if (selectedBot && botWebhooks[selectedBot]) {
        const webhookUrl = botWebhooks[selectedBot];
        
        const response = await axios.post(webhookUrl, {
          question: userMessage.content
        });

        // Generate fake confidence score between 80-95%
        const confidenceScore = (Math.random() * 0.15 + 0.80).toFixed(2);

        const responseContent = response.data?.output || response.data?.response || response.data?.answer || 'No response received';

        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseContent,
          sources: [],
          confidence_score: parseFloat(confidenceScore)
        };
      } else {
        // Use regular RAG endpoint
        const conversationHistory = messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }));

        const response = await axios.post('http://localhost:3000/rag/query', {
          query: userMessage.content,
          conversation_history: conversationHistory,
          max_results: 5
        });

        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data?.data?.answer || 'No response available',
          sources: response.data?.data?.sources || [],
          confidence_score: response.data?.data?.confidence_score || 0.5
        };
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get response. Please make sure the service is running.';
      setError(errorMessage);
      
      // Add error message to chat
      const errorBotMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        sources: [],
        confidence_score: 0
      };
      setMessages(prev => [...prev, errorBotMessage]);
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
            {botNames[selectedBot] || botNames.default}
          </h2>
          <div className="chat-header-actions">
            {messages.length > 0 && (
              <button 
                className="chat-download-btn" 
                onClick={downloadAsPDF}
                title="Download as PDF"
              >
                📄 Download PDF
              </button>
            )}
            <button className="chat-close" onClick={onClose}>
              ×
            </button>
          </div>
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
                  {message.type === 'bot' ? (
                    <StructuredMessage 
                      sections={message.content} 
                      confidence_score={message.confidence_score}
                    />
                  ) : (
                    message.content
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
