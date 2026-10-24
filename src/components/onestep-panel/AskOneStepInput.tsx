import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';

interface AskOneStepInputProps {
  currentGoal: string;
  currentInstruction: string;
}

export const AskOneStepInput: React.FC<AskOneStepInputProps> = ({
  currentGoal,
  currentInstruction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `I'm tracking your target: "${currentInstruction}". Click the highlighted area on your left to advance!`,
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulated contextual response
    setTimeout(() => {
      let reply = `To accomplish "${currentGoal}", the next expected action is "${currentInstruction}". You can click the glowing element in the portal or tap "Show me" to pinpoint it.`;
      const qLower = query.toLowerCase();

      if (qLower.includes('receipt') || qLower.includes('download')) {
        reply = `The official fee receipt for Semester 5 (₹45,000) is stored under Finance > Payment History. Once you reach Step 4, you'll be able to download the verified PDF.`;
      } else if (qLower.includes('payment') || qLower.includes('pay')) {
        reply = `All your tuition fees for Semester 5 have already been marked as Paid. We are currently navigating to retrieve your receipt voucher.`;
      } else if (qLower.includes('back') || qLower.includes('wrong')) {
        reply = `If you navigated to the wrong section, no worries! Click "Find the right path" on the alert, or simply click Finance on the left sidebar.`;
      } else if (qLower.includes('official') || qLower.includes('stamp')) {
        reply = `Yes, all receipts generated from this portal include the cryptographic university seal and Bursar transaction reference TXN-2026-8812.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3 shadow-xs space-y-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6E6860]">
        <Bot className="w-3.5 h-3.5 text-[#7656A7]" />
        <span>Ask OneStep Assistant</span>
      </div>

      {/* Mini Chat Stream (last 2 messages) */}
      <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
        {messages.slice(-2).map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg text-[11px] leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-[#EFE9DF] text-[#2B2825] ml-4 text-right'
                : 'bg-[#F7F3EC] text-[#2B2825] border border-[#E5DEC9]/80 mr-2'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="p-2 rounded-lg bg-[#F7F3EC] text-[11px] text-[#6E6860] italic flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7656A7] animate-ping" />
            <span>OneStep is answering...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask a question about this step..."
          className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] placeholder:text-[#A09A90] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          aria-label="Send query"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-[#7656A7] hover:text-[#654791] disabled:opacity-30 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
