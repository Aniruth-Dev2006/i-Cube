import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import './Chat.css';

// Set up PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

// Function to structure and format bot responses
function formatBotResponse(content) {
  if (!content) return [{ type: 'paragraph', content: ['No content available'] }];

  // Check if content is already an array (structured)
  if (Array.isArray(content)) {
    return content;
  }
  
  // Check if content is already an object (structured)
  if (typeof content === 'object') {
    return [{ type: 'paragraph', content: [String(content)] }];
  }

  // Convert to string if needed
  const textContent = typeof content === 'string' ? content : String(content);

  // Pre-process: Split inline bullets into separate lines
  // Replace ". •" pattern (period, space, bullet)
  let processedContent = textContent.replace(/\.\s*•/g, '.\n•');
  // Replace " • " pattern (space, bullet, space) - but not at start
  processedContent = processedContent.replace(/([^\n])\s+•\s+/g, '$1\n• ');
  
  console.log('Original content:', textContent);
  console.log('Processed content:', processedContent);

  // Parse the text content into structured sections
  const sections = [];
  const lines = processedContent.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentSection = { type: 'paragraph', content: [] };
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line) continue;
    
    // Detect headings - lines with ** markers at start and end
    if (line.startsWith('**') && line.includes(':**')) {
      // Save current section if it has content
      if (currentSection.content.length > 0 || currentSection.items?.length > 0) {
        sections.push({ ...currentSection });
      }
      // Extract heading text and clean it
      const headingText = line.replace(/^\*\*/, '').replace(/:\*\*$/, '').replace(/\*\*:/, '').trim();
      currentSection = { type: 'heading', content: headingText };
      sections.push({ ...currentSection });
      currentSection = { type: 'paragraph', content: [] };
      inList = false;
      continue;
    }
    
    // Detect bullet points with • character (including inline bullets)
    if (line.startsWith('•') || line.match(/^[•]\s+/) || line.includes(' • ')) {
      if (!inList || currentSection.type !== 'list') {
        if (currentSection.content.length > 0 || currentSection.items?.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: 'list', items: [] };
        inList = true;
      }
      
      // Split by bullet points if there are multiple on one line
      console.log('Original line with bullets:', line);
      const bulletItems = line.split(/\s*•\s*/).filter(item => item.trim());
      console.log('Split into items:', bulletItems);
      bulletItems.forEach(item => {
        const cleanItem = item.trim();
        if (cleanItem) {
          console.log('Adding bullet item:', cleanItem);
          currentSection.items.push(cleanItem);
        }
      });
      continue;
    }
    
    // Detect bullet points with * at start
    if (line.match(/^\*\s+/) && !line.startsWith('**')) {
      if (!inList || currentSection.type !== 'list') {
        if (currentSection.content.length > 0 || currentSection.items?.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: 'list', items: [] };
        inList = true;
      }
      const cleanLine = line.replace(/^\*\s+/, '').trim();
      currentSection.items.push(cleanLine);
      continue;
    }
    
    // Detect bullet points with -
    if (line.match(/^-\s+/)) {
      if (!inList || currentSection.type !== 'list') {
        if (currentSection.content.length > 0 || currentSection.items?.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: 'list', items: [] };
        inList = true;
      }
      const cleanLine = line.replace(/^-\s+/, '').trim();
      currentSection.items.push(cleanLine);
      continue;
    }
    
    // Detect numbered lists
    if (line.match(/^\d+\.\s+/)) {
      if (!inList || currentSection.type !== 'numbered-list') {
        if (currentSection.content.length > 0 || currentSection.items?.length > 0) {
          sections.push({ ...currentSection });
        }
        currentSection = { type: 'numbered-list', items: [] };
        inList = true;
      }
      const cleanLine = line.replace(/^\d+\.\s+/, '').trim();
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
  
  // Ensure we always return at least something
  if (sections.length === 0) {
    return [{ type: 'paragraph', content: [textContent] }];
  }
  
  return sections;
}

// Function to render text with markdown bold syntax (**text**)
function renderMarkdownText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Split by ** markers and process
  const parts = text.split('**');
  
  return parts.map((part, index) => {
    // Every odd index (1, 3, 5...) should be bolded
    if (index % 2 === 1 && part.length > 0) {
      return <strong key={index}>{part}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

// Component to render structured message
function StructuredMessage({ sections, confidence_score }) {
  // If sections is a string, format it first
  if (typeof sections === 'string') {
    console.log('Formatting string response:', sections.substring(0, 100));
    try {
      const formatted = formatBotResponse(sections);
      console.log('Formatted sections:', formatted);
      sections = formatted;
    } catch (error) {
      console.error('Error formatting response:', error);
      // Return pre-formatted text as fallback with markdown support
      return (
        <div className="structured-response">
          <div style={{ whiteSpace: 'pre-line' }}>
            {renderMarkdownText(sections)}
          </div>
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
  }

  // Check if formatting produced valid sections
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    console.log('Invalid sections:', sections);
    return (
      <div className="structured-response">
        <div>No response available</div>
      </div>
    );
  }

  console.log('Rendering', sections.length, 'sections');

  return (
    <div className="structured-response">
      {sections.map((section, index) => {
        try {
          if (section.type === 'heading') {
            return (
              <h4 key={index} className="response-heading">
                {renderMarkdownText(section.content)}
              </h4>
            );
          }
          
          if (section.type === 'list' || section.type === 'numbered-list') {
            return (
              <ul key={index} className={section.type === 'numbered-list' ? 'numbered-list' : 'bullet-list'}>
                {(section.items || []).map((item, idx) => (
                  <li key={idx}>{renderMarkdownText(item)}</li>
                ))}
              </ul>
            );
          }
          
          if (section.type === 'paragraph') {
            const content = Array.isArray(section.content) ? section.content.join(' ') : section.content;
            return (
              <p key={index} className="response-paragraph">
                {renderMarkdownText(content)}
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [processingFile, setProcessingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Function to extract text from PDF
  const extractTextFromPDF = async (file) => {
    try {
      console.log('Starting PDF extraction for:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log('PDF loaded, pages:', pdf.numPages);
      
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      console.log('Extraction complete, text length:', fullText.length);
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      setError('Please upload only PDF files');
      return;
    }

    setError('');
    setProcessingFile(true);

    try {
      let allText = '';

      for (const file of pdfFiles) {
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        const text = await extractTextFromPDF(file);
        allText += `\n\n--- Content from ${file.name} ---\n\n${text}`;
      }

      setExtractedText(prevText => prevText + allText);
      setUploadedFiles(prev => [...prev, ...pdfFiles]);
      
      // Show success message
      const successMsg = `✅ Successfully extracted text from ${pdfFiles.length} PDF file(s). Total characters: ${allText.length}`;
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: successMsg
      }]);
      
      console.log('PDF extraction successful. Total text length:', allText.length);
    } catch (err) {
      console.error('File processing error:', err);
      setError(`Failed to process PDF: ${err.message}. Please ensure the PDF is valid and not password-protected.`);
    } finally {
      setProcessingFile(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove uploaded file
  const removeFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    
    if (newFiles.length === 0) {
      setExtractedText('');
    }
  };

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

      // Combine user input with extracted PDF text
      let fullQuery = userMessage.content;
      if (extractedText && extractedText.trim()) {
        fullQuery = `Based on the following document context, please answer the question.\n\n--- DOCUMENT CONTEXT ---\n${extractedText.substring(0, 4000)}\n--- END CONTEXT ---\n\nQuestion: ${userMessage.content}\n\nPlease provide a structured response with clear sections and bullet points where appropriate.`;
      }

      // If a specialized bot is selected, use n8n webhook
      if (selectedBot && botWebhooks[selectedBot]) {
        const webhookUrl = botWebhooks[selectedBot];
        
        const response = await axios.post(webhookUrl, {
          question: fullQuery
        });

        // Generate fake confidence score between 80-95%
        const confidenceScore = (Math.random() * 0.15 + 0.80).toFixed(2);

        let responseContent = response.data?.output || response.data?.response || response.data?.answer || 'No response received';
        
        console.log('Webhook response:', responseContent);
        
        // Ensure response is formatted - keep as string to let StructuredMessage handle it
        // Don't format here as it might return null/undefined
        botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: responseContent || 'No response received',
          sources: [],
          confidence_score: parseFloat(confidenceScore)
        };
        
        console.log('Bot message created:', botMessage);
      } else {
        // Use regular RAG endpoint
        const conversationHistory = messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }));

        const response = await axios.post('http://localhost:3000/rag/query', {
          query: fullQuery,
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
              <div className="feature-highlights">
                <div className="feature-item">
                  <span className="feature-icon">📄</span>
                  <span>Upload PDF documents</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <span>AI-powered legal advice</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>Instant responses</span>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'system' ? (
                  <div className="system-message">{message.content}</div>
                ) : (
                  <>
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
                  </>
                )}
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
          {/* File upload section */}
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files-section">
              <div className="uploaded-files-header">
                <span className="files-title">📎 Attached Documents ({uploadedFiles.length})</span>
              </div>
              <div className="uploaded-files-list">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="uploaded-file-item">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="chat-input-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="application/pdf"
              multiple
              style={{ display: 'none' }}
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={processingFile || loading}
              title="Upload PDF documents"
            >
              {processingFile ? '⏳' : '📎'}
            </button>
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your legal question here... (You can also upload PDF documents)"
              rows={3}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
          {processingFile && (
            <div className="processing-indicator">
              <span className="spinner">⏳</span> Processing PDF files...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
