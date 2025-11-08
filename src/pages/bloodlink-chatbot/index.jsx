import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Send, Bot, User } from 'lucide-react';
import Header from '../../components/ui/Header';
import aiChatService from '../../services/aiChatService';

export default function BloodLinkChatbot() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm the BloodLink AI Assistant. 🩸

I can help you with:
• Blood donation eligibility
• Blood type information
• Donation process
• Frequency guidelines
• Platform features
• Emergency procedures

How can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Add placeholder for assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      // Prepare messages for Gemini (skip the initial greeting, only send conversation)
      const geminiMessages = messages
        .slice(1) // Skip the initial assistant greeting
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content
        }));
      
      // Add the new user message
      geminiMessages.push({ role: 'user', content: userMessage });

      // System prompt for BloodLink context
      const systemPrompt = `You are the BloodLink AI Assistant, an expert on blood donation. 
You help users with:
- Blood donation eligibility requirements
- Blood type information and compatibility
- Donation process and procedures
- Frequency guidelines
- BloodLink platform features
- Emergency blood request procedures

Provide accurate, helpful, and concise information about blood donation.`;

      // Stream the response from Gemini
      await aiChatService.streamChat(geminiMessages, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content += chunk;
          return newMessages;
        });
      }, { system: systemPrompt });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = 
          "I apologize, but I'm having trouble connecting to the AI service right now. Please try again or contact support.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  const quickQuestions = [
    "Can I donate blood?",
    "What's the rarest blood type?",
    "How often can I donate?",
    "How does the donation process work?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
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
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">BloodLink AI Assistant</h1>
              <p className="text-sm text-text-secondary">Your guide to blood donation</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden" style={{ height: 'calc(100vh - 320px)' }}>
          {/* Messages */}
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white'
                      : 'bg-accent text-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="bg-muted p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-accent rounded-2xl p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-border bg-card">
              <p className="text-sm text-text-secondary mb-3 font-medium">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-left p-3 text-sm bg-accent hover:bg-accent/80 rounded-lg border border-border transition-colors text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about blood donation..."
                className="flex-1 p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-primary to-primary/80 text-white p-3 rounded-xl hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
