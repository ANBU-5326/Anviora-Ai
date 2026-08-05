import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { mentorService } from '../../services/mentorService';
import { chatService } from '../../services/chatService';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [initialWelcomeDone, setInitialWelcomeDone] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const dbMsgs = await chatService.getChatMessages();
        if (dbMsgs && dbMsgs.length > 0) {
          setMessages(dbMsgs.map(m => ({
            sender: m.role === 'user' ? 'user' : 'mentor',
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
          setInitialWelcomeDone(true);
        } else {
          // No history, show initial welcome
          const welcome = {
            sender: 'mentor',
            text: "Hello! I am your AI career mentor. How can I help you with your placement preparation today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([welcome]);
          // Save welcome message to DB
          await chatService.saveChatMessage('assistant', welcome.text);
          setInitialWelcomeDone(true);
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
        // Fallback welcome
        setMessages([{
          sender: 'mentor',
          text: "Hello! I am your AI career mentor. How can I help you with your placement preparation today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Save user message to database
      await chatService.saveChatMessage('user', userMessage.text);
      
      const reply = await mentorService.sendMessage(userMessage.text, messages);
      
      // Save AI reply to database
      await chatService.saveChatMessage('assistant', reply.text);

      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reach the AI server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="chat-container fade-in">
      <div className="chat-header glass-panel">
        <div className="header-info">
          <div className="bot-icon-glow">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="chat-title">ANVIORA AI Chat</h1>
            <span className="chat-status">
              <span className="status-dot"></span> Online & Ready
            </span>
          </div>
        </div>
      </div>

      <div className="chat-messages-wrapper glass-panel">
        <div className="messages-scroll-area">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'mentor';
            return (
              <div
                key={idx}
                className={`message-bubble-row ${isBot ? 'bot-row' : 'user-row'}`}
              >
                <div className="avatar-wrapper">
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="message-content-wrapper">
                  <div className="message-text">
                    {msg.text}
                  </div>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="message-bubble-row bot-row loading-row">
              <div className="avatar-wrapper pulse">
                <Bot size={16} />
              </div>
              <div className="message-content-wrapper">
                <div className="typing-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error-card">
              <AlertCircle size={20} />
              <div className="error-text-container">
                <span className="error-heading">Connection Error</span>
                <span className="error-desc">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="error-dismiss-btn">Dismiss</button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-wrapper">
        <form onSubmit={handleSend} className="input-form">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message here..."
            disabled={loading}
            rows={1}
            className="chat-textarea"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="send-button"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
