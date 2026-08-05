import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, Bot, User, Mic, MicOff, Upload,
  BookOpen, Code2, Briefcase, FileText, Target, Zap,
  ChevronDown, X, Plus, Trash2, Star, Clock, TrendingUp,
  Award, Brain, Lightbulb, BarChart2, Moon, Sun, RefreshCw
} from 'lucide-react';

import { mentorService } from '../../services/mentorService';

// ─── Markdown renderer (lightweight) ────────────────────────────────────────
const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<div class="anv-code-block"><div class="anv-code-lang">${lang || 'code'}</div><pre><code>${escHtml(code.trim())}</code></pre></div>`)
    .replace(/`([^`]+)`/g, '<code class="anv-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="anv-md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h3 class="anv-md-h2">$1</h3>')
    .replace(/^- (.+)$/gm, '<li class="anv-md-li">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, s => `<ul class="anv-md-ul">${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupldc])(.+)$/gm, m => m ? m : '')
    .replace(/\n/g, '<br/>');
};
const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ─── Quick topic categories ──────────────────────────────────────────────────
const QUICK_TOPICS = [
  { icon: Code2, label: 'DSA Help', prompt: 'Give me a 30-day DSA preparation plan for placement season', color: '#7c3aed' },
  { icon: FileText, label: 'Resume Review', prompt: 'What are the top 5 mistakes Indian students make on their resumes?', color: '#0891b2' },
  { icon: Briefcase, label: 'Placement Prep', prompt: 'How do I prepare for TCS NQT and get shortlisted?', color: '#059669' },
  { icon: Brain, label: 'Project Ideas', prompt: 'Suggest 3 final year AI/ML project ideas that will impress recruiters', color: '#dc2626' },
  { icon: Target, label: 'Career Roadmap', prompt: 'I want to become a Full Stack Developer. Give me a 6-month roadmap', color: '#d97706' },
  { icon: BarChart2, label: 'Skill Analysis', prompt: 'What skills should a CSE student have by 3rd year to get good placements?', color: '#7c3aed' },
];

const SUGGESTED_PROMPTS = [
  'How do I crack Google with a 7 CGPA?',
  'Best way to prepare System Design in 2 months?',
  'Review my project: I built a React + Node app',
  'What salary should I expect as a fresher?',
  'How to get internship at a product startup?',
  'Difference between service and product companies?',
];

// ─── Typing indicator ────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block',
        animation: `anvDot 1.2s ${i * 0.2}s infinite ease-in-out`
      }} />
    ))}
  </div>
);

// ─── Message bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onFeedback }) => {
  const isMentor = msg.sender === 'mentor';
  const [liked, setLiked] = useState(null);

  return (
    <div style={{
      display: 'flex', gap: 10, alignSelf: isMentor ? 'flex-start' : 'flex-end',
      flexDirection: isMentor ? 'row' : 'row-reverse', maxWidth: '82%', animation: 'anvSlideIn 0.25s ease'
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: isMentor ? 'rgba(124,58,237,0.12)' : 'rgba(6,182,212,0.12)',
        color: isMentor ? '#7c3aed' : '#0891b2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${isMentor ? 'rgba(124,58,237,0.25)' : 'rgba(6,182,212,0.25)'}`,
        marginTop: 2
      }}>
        {isMentor ? <Bot size={16} /> : <User size={16} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isMentor ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          background: isMentor ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent-purple), #6d28d9)',
          border: isMentor ? '0.5px solid var(--border-color)' : 'none',
          color: isMentor ? 'var(--text-primary)' : '#fff',
          fontSize: '0.9rem', lineHeight: 1.6,
          boxShadow: isMentor ? 'none' : '0 4px 14px rgba(124,58,237,0.3)'
        }}>
          {isMentor ? (
            <div
              className="anv-markdown"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
            />
          ) : msg.text}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: isMentor ? 'flex-start' : 'flex-end' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{msg.timestamp}</span>
          {isMentor && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => { setLiked(true); onFeedback?.(msg, 'helpful'); }}
                title="Helpful" style={{
                  background: liked === true ? 'rgba(5,150,105,0.15)' : 'transparent',
                  border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4,
                  color: liked === true ? '#059669' : 'var(--txt-muted, #64748b)', fontSize: 12
                }}>✓</button>
              <button onClick={() => { setLiked(false); onFeedback?.(msg, 'unhelpful'); }}
                title="Not helpful" style={{
                  background: liked === false ? 'rgba(220,38,38,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4,
                  color: liked === false ? '#dc2626' : 'var(--txt-muted, #64748b)', fontSize: 12
                }}>✗</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Context setup panel ─────────────────────────────────────────────────────
const ContextPanel = ({ context, onSave, onClose }) => {
  const [form, setForm] = useState(context || { goal: '', semester: '', skills: '', target: '' });
  const goals = ['Full Stack Developer', 'AI/ML Engineer', 'Data Scientist', 'DevOps Engineer', 'Cloud Architect', 'Cyber Security', 'Mobile Developer', 'Product Manager'];
  const sems = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', 'Graduate'];

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '0.5px solid var(--border-color)',
        borderRadius: 16, padding: 28, width: '90%', maxWidth: 440
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Your Profile</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Helps ANVIORA personalize guidance</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {[
          { key: 'goal', label: 'Career Goal', type: 'select', options: goals },
          { key: 'semester', label: 'Current Semester', type: 'select', options: sems },
          { key: 'skills', label: 'Your Skills (comma separated)', type: 'text', placeholder: 'Python, React, SQL...' },
          { key: 'target', label: 'Target Company / Role', type: 'text', placeholder: 'Google, Startup, Service company...' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
            {f.type === 'select' ? (
              <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-primary)', border: '0.5px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 14 }}>
                <option value="">Select...</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type="text" value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-primary)', border: '0.5px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 14 }} />
            )}
          </div>
        ))}

        <button onClick={() => onSave(form)} style={{
          width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 4
        }}>Save & Personalize</button>
      </div>
    </div>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────
const AIMentor = () => {
  const STORAGE_KEY = 'anviora_mentor_history';
  const CTX_KEY = 'anviora_mentor_context';

  const loadHistory = () => {
    try {
      const s = sessionStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  };
  const loadContext = () => {
    try {
      const s = localStorage.getItem(CTX_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  };

  const savedCtx = loadContext();
  const defaultWelcome = savedCtx?.goal
    ? `Welcome back! Your goal is **${savedCtx.goal}** — let's keep moving. What would you like to work on today?`
    : `Hello! I'm your **ANVIORA AI Mentor**\n\nI can help you with:\n- Study plans and semester strategy\n- DSA, coding, and technical interviews\n- Project ideas with full architecture\n- Resume and ATS optimization\n- Placement preparation for specific companies\n- Career roadmaps from your current skills to your dream job\n\nSet your profile (top-right) for personalized guidance, or just ask me anything!`;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [context, setContext] = useState(savedCtx);
  const [showContext, setShowContext] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [listening, setListening] = useState(false);
  const [sessionStats, setSessionStats] = useState({ questions: 0, topics: [] });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const dbMsgs = await mentorService.getMentorMessages();
        if (dbMsgs && dbMsgs.length > 0) {
          setMessages(dbMsgs.map(m => ({
            sender: m.role === 'user' ? 'user' : 'mentor',
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        } else {
          // Empty DB history, save welcome
          const welcome = {
            sender: 'mentor',
            text: defaultWelcome,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([welcome]);
          await mentorService.saveMentorMessage('assistant', welcome.text);
        }
      } catch (e) {
        console.error("Failed to load mentor chat from DB, falling back to local Storage", e);
        const local = loadHistory();
        if (local) {
          setMessages(local);
        } else {
          setMessages([{
            sender: 'mentor',
            text: defaultWelcome,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      }
    };
    fetchHistory();
  }, [defaultWelcome]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  useEffect(() => {
    if (messages.length > 0) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); } catch {}
    }
  }, [messages]);

  const send = useCallback(async (text, fileContext = '') => {
    if (!text.trim() || thinking) return;
    const fullText = fileContext ? `[Uploaded file context: ${fileContext}]\n\nUser question: ${text}` : text;

    const userMsg = {
      sender: 'user', text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setUploadedFile(null);
    setThinking(true);
    setSessionStats(s => ({ questions: s.questions + 1, topics: [...s.topics.slice(-4), text.split(' ').slice(0, 3).join(' ')] }));

    try {
      // Save user message to database
      await mentorService.saveMentorMessage('user', text);

      const response = await mentorService.sendMessage(fullText, messages, context);
      
      // Save AI reply to database
      await mentorService.saveMentorMessage('assistant', response.text);

      setMessages(prev => [...prev, response]);
    } catch {
      setMessages(prev => [...prev, {
        sender: 'mentor',
        text: 'I had trouble connecting. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [thinking, messages, context]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    send(inputText, uploadedFile?.summary);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    await new Promise(r => setTimeout(r, 600));
    setUploadedFile({ name: file.name, summary: `File "${file.name}" (${(file.size / 1024).toFixed(1)} KB)` });
    setFileUploading(false);
    setInputText(prev => prev || `Please analyze my ${file.name.includes('resume') ? 'resume' : 'file'} and give detailed feedback`);
    inputRef.current?.focus();
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported in this browser. Try Chrome.'); return; }
    const r = new SR();
    r.lang = 'en-IN';
    r.continuous = false;
    r.onstart = () => setListening(true);
    r.onresult = e => { setInputText(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setListening(false); };

  const clearChat = () => {
    if (!window.confirm('Clear conversation history?')) return;
    const welcome = { sender: 'mentor', text: defaultWelcome, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([welcome]);
    setSessionStats({ questions: 0, topics: [] });
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const saveContext = (ctx) => {
    setContext(ctx);
    try { localStorage.setItem(CTX_KEY, JSON.stringify(ctx)); } catch {}
    setShowContext(false);
    const msg = {
      sender: 'mentor',
      text: `Profile updated! I now know you're aiming for **${ctx.goal || 'your goal'}** in semester **${ctx.semester || 'N/A'}**. I'll tailor all my advice specifically for you.\n\nWhat would you like to work on first?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, msg]);
  };

  return (
    <>
      <style>{`
        @keyframes anvSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes anvDot { 0%, 60%, 100% { transform: scale(1); opacity: 0.5; } 30% { transform: scale(1.4); opacity: 1; } }
        .anv-markdown h3.anv-md-h3 { font-size: 15px; font-weight: 500; margin: 12px 0 6px; color: var(--text-primary); }
        .anv-markdown ul.anv-md-ul { padding-left: 18px; margin: 6px 0; }
        .anv-markdown li.anv-md-li { margin: 4px 0; font-size: 0.88rem; }
        .anv-code-block { background: rgba(0,0,0,0.4); border-radius: 8px; padding: 12px; margin: 8px 0; overflow-x: auto; }
        .anv-code-lang { font-size: 10px; color: #7c3aed; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; letter-spacing: 1px; }
        .anv-code-block pre { margin: 0; font-size: 13px; font-family: 'JetBrains Mono', 'Fira Code', monospace; color: #a5f3fc; white-space: pre-wrap; }
        .anv-inline-code { background: rgba(124,58,237,0.15); color: #c4b5fd; padding: 1px 5px; border-radius: 4px; font-size: 0.85em; font-family: monospace; }
        .anv-topic-btn:hover { background: rgba(124,58,237,0.15) !important; border-color: rgba(124,58,237,0.4) !important; }
        .anv-sugg:hover { background: var(--bg-tertiary) !important; color: var(--text-primary) !important; }
        .anv-send:hover:not(:disabled) { background: #6d28d9 !important; }
        .anv-send:disabled { opacity: 0.4; cursor: not-allowed; }
        .anv-scroll::-webkit-scrollbar { width: 4px; }
        .anv-scroll::-webkit-scrollbar-track { background: transparent; }
        .anv-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 2px; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0 14px', borderBottom: '0.5px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(109,40,217,0.3))',
              border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Brain size={20} color="#a78bfa" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>AI Career Mentor</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {context?.goal ? `Goal: ${context.goal}` : 'Online — Ask anything'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {sessionStats.questions > 0 && (
              <div style={{ background: 'rgba(124,58,237,0.1)', border: '0.5px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={12} />{sessionStats.questions} messages
              </div>
            )}
            <button onClick={() => setShowContext(true)} title="Set your profile" style={{
              background: context ? 'rgba(124,58,237,0.15)' : 'var(--bg-tertiary)',
              border: `0.5px solid ${context ? 'rgba(124,58,237,0.4)' : 'var(--border-color)'}`,
              borderRadius: 8, padding: '6px 12px', color: context ? 'var(--accent-purple)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Target size={14} />{context ? 'Edit Profile' : 'Set Profile'}
            </button>
            <button onClick={clearChat} title="Clear chat" style={{
              background: 'transparent', border: '0.5px solid var(--border-color)', borderRadius: 8,
              padding: '6px 8px', color: 'var(--text-muted)', cursor: 'pointer'
            }}><Trash2 size={14} /></button>
          </div>
        </div>

        {/* ── Quick topic pills ── */}
        <div style={{ padding: '10px 0', borderBottom: '0.5px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {QUICK_TOPICS.map(t => (
              <button key={t.label} className="anv-topic-btn" onClick={() => send(t.prompt)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', whiteSpace: 'nowrap',
                  background: 'var(--bg-secondary)', border: '0.5px solid var(--border-color)',
                  borderRadius: 20, cursor: 'pointer', fontSize: 12.5, color: 'var(--text-secondary)',
                  transition: 'all 0.15s'
                }}>
                <t.icon size={13} color={t.color} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="anv-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

          {thinking && (
            <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start', animation: 'anvSlideIn 0.2s ease' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: 'rgba(124,58,237,0.12)',
                color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(124,58,237,0.25)', flexShrink: 0
              }}><Bot size={16} /></div>
              <div style={{
                padding: '10px 16px', borderRadius: '4px 16px 16px 16px',
                background: 'var(--bg-secondary)', border: '0.5px solid var(--border-color)'
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Uploaded file badge ── */}
        {uploadedFile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
            background: 'rgba(124,58,237,0.1)', border: '0.5px solid rgba(124,58,237,0.25)', borderRadius: 8, margin: '4px 0'
          }}>
            <FileText size={13} color="#a78bfa" />
            <span style={{ fontSize: 12, color: '#a78bfa', flex: 1 }}>{uploadedFile.name}</span>
            <button onClick={() => setUploadedFile(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a78bfa', display: 'flex' }}><X size={12} /></button>
          </div>
        )}

        {/* ── Suggestion chips (when input empty) ── */}
        {!inputText && messages.length < 4 && (
          <div style={{ paddingBottom: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Try asking</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED_PROMPTS.map(p => (
                <button key={p} className="anv-sugg" onClick={() => setInputText(p)}
                  style={{
                    fontSize: 12, padding: '4px 10px', background: 'var(--bg-secondary)',
                    border: '0.5px solid var(--border-color)', borderRadius: 12, cursor: 'pointer',
                    color: 'var(--text-secondary)', transition: 'all 0.15s'
                  }}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ── */}
        <div style={{ paddingTop: 10, borderTop: '0.5px solid var(--border-color)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {/* File upload */}
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg" onChange={handleFile} style={{ display: 'none' }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} title="Upload resume or file"
              style={{
                width: 40, height: 40, flexShrink: 0, background: 'var(--bg-secondary)',
                border: '0.5px solid var(--border-color)', borderRadius: 8, cursor: 'pointer',
                color: fileUploading ? 'var(--accent-purple)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: fileUploading ? 'anvDot 0.8s infinite' : 'none'
              }}>
              <Upload size={16} />
            </button>

            {/* Text input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Ask about DSA, projects, resume, placements, career..."
                rows={1}
                disabled={thinking}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'none', overflow: 'hidden',
                  background: 'var(--bg-secondary)', border: '0.5px solid var(--border-color)',
                  borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)', fontSize: '0.9rem',
                  lineHeight: 1.5, outline: 'none', transition: 'border 0.15s',
                  minHeight: 42, maxHeight: 120,
                  fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>

            {/* Voice input */}
            <button type="button" onClick={listening ? stopVoice : startVoice} title={listening ? 'Stop' : 'Voice input'}
              style={{
                width: 40, height: 40, flexShrink: 0,
                background: listening ? 'rgba(220,38,38,0.15)' : 'var(--bg-secondary)',
                border: `0.5px solid ${listening ? 'rgba(220,38,38,0.4)' : 'var(--border-color)'}`,
                borderRadius: 8, cursor: 'pointer',
                color: listening ? '#ef4444' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: listening ? 'anvDot 1s infinite' : 'none'
              }}>
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Send */}
            <button type="submit" className="anv-send" disabled={!inputText.trim() || thinking}
              style={{
                width: 40, height: 40, flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(124,58,237,0.3)'
              }}>
              <Send size={16} />
            </button>
          </form>
          <p style={{ fontSize: 10.5, color: 'var(--text-muted)', margin: '6px 0 0', textAlign: 'center' }}>
            Enter to send · Shift+Enter for new line · Upload resume for analysis
          </p>
        </div>

        {/* ── Context Panel (modal) ── */}
        {showContext && (
          <ContextPanel context={context} onSave={saveContext} onClose={() => setShowContext(false)} />
        )}
      </div>
    </>
  );
};

export default AIMentor;