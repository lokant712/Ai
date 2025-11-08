import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User } from 'lucide-react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import aiChatService from '../../services/aiChatService';

const ChatBotPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your blood donation assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Check if user is logged in
    const userSession = localStorage.getItem('userSession');
    if (!userSession) {
      navigate('/user-login');
      return;
    }
    const userData = JSON.parse(userSession);
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    navigate('/user-login');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setStreamingResponse('');

    try {
      // Use streaming for assistant response
      let accumulatedResponse = '';
      
      const handleChunk = (chunk) => {
        accumulatedResponse += chunk;
        setStreamingResponse(accumulatedResponse);
      };
      
      // Stream the response
      const finalResponse = await aiChatService.streamChat(newMessages, handleChunk);
      
      // Add complete response to messages
      setMessages([...newMessages, { role: 'assistant', content: finalResponse }]);
      setStreamingResponse('');
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
      setStreamingResponse('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        {/* Page Header */}
        <div className="bg-card rounded-2xl shadow-lg p-6 border border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blood Donation Assistant</h1>
              <p className="text-sm text-text-secondary">Ask about blood types, donation procedures, or emergency requests</p>
            </div>
          </div>
        </div>
        
        {/* Chat Container */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden" style={{ height: 'calc(100vh - 320px)' }}>
          {/* Messages */}
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl p-4 ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
                    : 'bg-accent text-foreground'
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                </div>
                {m.role === 'user' && (
                  <div className="bg-muted p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-foreground" />
                  </div>
                )}
              </div>
            ))}
        
            {/* Streaming response */}
            {streamingResponse && (
              <div className="flex gap-3">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[70%] rounded-2xl p-4 bg-accent text-foreground">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {streamingResponse}
                    <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                  </p>
                </div>
              </div>
            )}
        
            {/* Loading indicator */}
            {loading && !streamingResponse && (
              <div className="flex gap-3">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-accent rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
        
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about blood donation, donors, or emergency procedures..."
                disabled={loading}
                className="flex-1 p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-br from-primary to-primary/80 text-white p-3 rounded-xl hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;