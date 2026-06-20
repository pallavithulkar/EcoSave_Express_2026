import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Wrench,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export default function LeakAssistant({ chatHistory, onSendChatMessage, onResetChat }) {
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');
    setIsLoading(true);

    try {
      await onSendChatMessage(userText);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse model messages (which could be stored as JSON strings)
  const parseModelMessage = (msg) => {
    if (msg.role === 'user') {
      return { text: msg.text };
    }
    
    try {
      const parsed = JSON.parse(msg.text);
      return {
        text: parsed.message,
        metadata: parsed.impactMetadata
      };
    } catch (e) {
      // Return raw text if not JSON
      return { text: msg.text };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Droplets className="w-6 h-6 text-brand-gold animate-bounce" />
            Leakage Assistant Chat
          </h2>
          <p className="text-gray-400 text-sm">
            Chat in Hinglish with Boond to isolate plumbing leaks, estimate water bills leakage, and audit conservation steps.
          </p>
        </div>
        
        {chatHistory.length > 0 && (
          <button 
            onClick={onResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border text-xs text-gray-400 hover:text-white hover:border-brand-border-glow transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Chat
          </button>
        )}
      </div>

      {/* CHAT MAIN INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: MASCOT BIO CARD (col-span-1) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glow-card rounded-2xl p-5 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-brand-gold/10 border-2 border-brand-gold p-1 shadow-glow-gold relative">
              <img 
                src="/boond.png" 
                alt="Boond Mascot Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-brand-dark-bg"></span>
            </div>

            <h3 className="text-base font-extrabold text-white mt-3 font-display">Boond</h3>
            <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded-full mt-1">
              Water Hero Mascot
            </span>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              "Namaste! Main hoon Boond. Mere sath Hinglish me baat karein aur apne ghar ke water leakage aur pumping costs ko save kijiye!"
            </p>

            <div className="w-full border-t border-brand-border/40 mt-5 pt-4 text-left space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Leak Suggestions:</span>
              <button 
                onClick={() => setInputMsg('Bathroom ka flush tank leak ho raha hai, continuously flush chal raha hai')}
                className="w-full text-left text-[10px] text-brand-gold hover:underline block truncate"
              >
                💧 Bathroom flush leak
              </button>
              <button 
                onClick={() => setInputMsg('Kitchen ka tap tap-tap drip kar raha hai')}
                className="w-full text-left text-[10px] text-brand-gold hover:underline block truncate"
              >
                💧 Kitchen tap dripping
              </button>
              <button 
                onClick={() => setInputMsg('Chhat par se overhead tank leak ho raha hai')}
                className="w-full text-left text-[10px] text-brand-gold hover:underline block truncate"
              >
                💧 Overhead tank overflow
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT INTERACTIVE WINDOW (col-span-3) */}
        <div className="lg:col-span-3 flex flex-col glow-card rounded-2xl overflow-hidden h-[450px]">
          
          {/* Chat Window Header */}
          <div className="bg-brand-card px-5 py-3 border-b border-brand-border/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/30 p-0.5">
              <img src="/boond.png" alt="Boond icon" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-display leading-none">Boond</div>
              <span className="text-[9px] text-emerald-400 font-medium">Hinglish Water Advisor • Online</span>
            </div>
          </div>

          {/* Messages Board */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-dark-bg/20">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <Droplets className="w-10 h-10 text-brand-gold/30 mb-2 animate-bounce" />
                <span className="text-xs font-semibold text-gray-400">No messages logged yet.</span>
                <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-normal">
                  Type a leakage issue in Hinglish (e.g. "nal se leak ho raha hai") to chat with Boond!
                </p>
              </div>
            ) : (
              chatHistory.map((msg, i) => {
                const isUser = msg.role === 'user';
                const parsed = parseModelMessage(msg);

                return (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-border flex items-center justify-center text-[10px] font-bold overflow-hidden border border-brand-border-glow">
                      {isUser ? (
                        <span className="text-white">ME</span>
                      ) : (
                        <img src="/boond.png" alt="Boond Avatar" className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Chat Bubble Content */}
                    <div className="space-y-2">
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-brand-gold text-brand-dark-bg font-medium rounded-tr-none' 
                          : 'bg-brand-card text-gray-200 border border-brand-border rounded-tl-none'
                      }`}>
                        {parsed.text}
                      </div>

                      {/* Render impact metadata card if present in Boond response */}
                      {!isUser && parsed.metadata && (parsed.metadata.rupeeImpact > 0 || parsed.metadata.waterImpactLitres > 0) && (
                        <div className="glow-card rounded-xl p-3 border border-brand-gold/30 bg-brand-dark-bg/60 w-72 space-y-2.5 animate-fadeIn">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5" /> Leakage Impact Estimates
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-brand-card border border-brand-border">
                              <span className="text-[9px] text-gray-400 uppercase block font-semibold">Monthly Cost</span>
                              {/* LARGEST BOLDEST NUMBER */}
                              <span className="text-base font-black text-brand-emerald font-display">₹{parsed.metadata.rupeeImpact}</span>
                              <span className="text-[8px] text-gray-400 block mt-0.5">wasted per month</span>
                            </div>
                            <div className="p-2 rounded-lg bg-brand-card border border-brand-border">
                              <span className="text-[9px] text-gray-400 uppercase block font-semibold">Water Wasted</span>
                              {/* Secondary details smaller */}
                              <span className="text-sm font-bold text-brand-blue font-display">{parsed.metadata.waterImpactLitres}L</span>
                              <span className="text-[8px] text-gray-400 block mt-0.5">litres/month</span>
                            </div>
                          </div>

                          {parsed.metadata.actionItem && (
                            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-brand-emerald/10 border border-brand-emerald/20 text-[9px]">
                              <Wrench className="w-3 h-3 text-brand-emerald flex-shrink-0" />
                              <span className="text-gray-300 font-medium leading-tight">
                                Recommended Fix: <strong className="text-brand-emerald font-bold">{parsed.metadata.actionItem}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-border overflow-hidden">
                  <img src="/boond.png" alt="Boond Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-brand-card border border-brand-border rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce delay-200"></span>
                  <span>Boond is checking leakage database...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Footer Form */}
          <form onSubmit={handleSubmit} className="bg-brand-card border-t border-brand-border/60 p-3 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask Boond in Hinglish (e.g. 'Bathroom tape tapak raha hai...')" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-4 py-2 text-xs rounded-xl bg-brand-dark-bg border border-brand-border focus:border-brand-gold focus:outline-none text-white font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMsg.trim()}
              className={`p-2.5 rounded-xl transition-all ${
                isLoading || !inputMsg.trim()
                  ? 'bg-brand-border text-gray-500 cursor-not-allowed'
                  : 'bg-brand-gold text-brand-dark-bg hover:bg-yellow-600 hover:scale-[1.03]'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
