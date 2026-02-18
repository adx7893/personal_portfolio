import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateChatResponse } from '../services/geminiService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi! I'm your AI assistant. Ask me anything about this template portfolio." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const responseText = await generateChatResponse(userText);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection interrupted.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check for API key across Vite and runtime-injected env styles.
  const hasApiKey = Boolean(
    import.meta.env?.VITE_GEMINI_API_KEY ||
    import.meta.env?.VITE_API_KEY ||
    window.ENV?.GEMINI_API_KEY ||
    window.ENV?.API_KEY
  );

  return (
    <>
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
              className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl w-[calc(100vw-1rem)] max-w-[380px] h-[70vh] max-h-[500px] sm:h-[500px] mb-3 sm:mb-4 pointer-events-auto flex flex-col overflow-hidden relative transition-colors duration-300"
            >
               {/* Decorative Gradient line */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
               
              {/* Header */}
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/20"></div>
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white font-mono tracking-wide">Assistant</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Online
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[90%] sm:max-w-[85%] p-3 text-sm leading-relaxed relative ${
                        msg.role === 'user' 
                          ? 'bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-100 rounded-2xl rounded-tr-sm' 
                          : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-2xl rounded-tl-sm'
                      } ${msg.isError ? 'border-red-500/50 bg-red-900/10 text-red-700 dark:text-red-200' : ''}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                       <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                       <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-2 relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 rounded-lg text-zinc-400 dark:text-zinc-400 hover:text-white disabled:opacity-50 disabled:hover:bg-zinc-100 dark:disabled:hover:bg-zinc-800 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {!hasApiKey && (
                   <div className="mt-2 text-[10px] text-red-500 dark:text-red-400 flex items-center gap-1 justify-center opacity-80">
                      <AlertCircle className="w-3 h-3" /> API Key Missing
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`pointer-events-auto p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group border border-zinc-200 dark:border-zinc-800 ${isOpen ? 'bg-zinc-900 text-white dark:bg-white dark:text-black' : 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white'}`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 group-hover:text-indigo-600 transition-colors" />}
        </button>
      </div>
    </>
  );
};

export { ChatWidget };
