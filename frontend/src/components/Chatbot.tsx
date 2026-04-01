import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user', text: string }[]>([
    { sender: 'bot', text: 'Hello! How can I help you with the NeuroDetect dashboard today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { sender: 'user' as const, text: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, { message: userMessage });
      setTimeout(() => {
        setMessages((prev: any) => [...prev, { sender: 'bot', text: res.data.response }]);
        setIsTyping(false);
      }, 600);
    } catch (err) {
      setMessages((prev: any) => [...prev, { sender: 'bot', text: "I'm having trouble connecting to the medical intelligence server. Please try again later." }]);
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="animate-slide-up"
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', width: '64px', height: '64px', borderRadius: '32px',
            background: 'var(--accent-gradient)', border: 'none', color: 'white',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)', cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, transition: 'all 0.3s'
          }}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: 'fixed', bottom: '2rem', right: '2rem', width: '360px', height: '500px',
            background: 'var(--bg-secondary)', backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-light)', borderRadius: '20px', 
            boxShadow: '0 12px 64px rgba(0, 0, 0, 0.6)',
            display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden'
          }}
          className="animate-slide-up"
        >
          {/* Header */}
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
              <Bot size={20} color="var(--accent-pu)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
                  background: msg.sender === 'user' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                  color: 'white', fontSize: '0.85rem', lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div style={{ fontSize: '0.75rem', opacity: 0.6, paddingLeft: '4px' }}>Expert is thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Clean Tech Input Area */}
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-light)' }}>
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
              />
              <button
                onClick={handleSend}
                className="chat-send-btn"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
