import React, { useState } from 'react';
import { Send, Bot, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types';
import { getStoredOllamaConfig } from '../../extension/bridge';

interface AskOneStepInputProps {
  currentGoal: string;
  currentInstruction: string;
  onOpenSettings?: () => void;
}

export const AskOneStepInput: React.FC<AskOneStepInputProps> = ({
  currentGoal,
  currentInstruction,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `I'm tracking your target: "${currentInstruction}". Ask any question about this step or webpage!`,
      time: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
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
    setErrorNotice(null);

    try {
      const config = await getStoredOllamaConfig();
      const cleanUrl = config.baseUrl.replace(/\/+$/, '');

      // Query Qwen 2.5 via Ollama chat endpoint
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${cleanUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: config.modelTag,
          stream: false,
          options: { temperature: 0.3 },
          messages: [
            {
              role: 'system',
              content:
                'You are OneStep, an AI browser assistant. Provide a helpful, concise answer (under 50 words) to the user about their web navigation goal or current step.',
            },
            {
              role: 'user',
              content: `Goal: "${currentGoal}". Active Step: "${currentInstruction}". User Question: "${query}"`,
            },
          ],
        }),
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`Ollama returned status ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.message?.content || 'Understood. Follow the highlighted element on screen.';

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: reply.trim(),
          time: 'Just now',
        },
      ]);
    } catch (err: any) {
      // Graceful offline fallback with helpful prompt to configure host
      let fallback = `To accomplish "${currentGoal}", the next recommended action is "${currentInstruction}".`;
      const qLower = query.toLowerCase();

      if (qLower.includes('receipt') || qLower.includes('download')) {
        fallback = `The verified receipt is archived under Finance > Payment History. Once step 4 is reached, you can download the PDF.`;
      } else if (qLower.includes('payment') || qLower.includes('fee')) {
        fallback = `Your fees for Semester 5 are already marked as Paid. We are currently retrieving your official receipt voucher.`;
      } else if (qLower.includes('offline') || qLower.includes('connect') || qLower.includes('ollama')) {
        fallback = `Ollama on your LAN is not responding. Click the settings gear in the top bar to verify the IP and model tag.`;
      }

      setErrorNotice(`Ollama Qwen unreachable (${err.message || 'offline'}). Showing fallback answer.`);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: fallback,
          time: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-3 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#6E6860]">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-[#7656A7]" />
          <span>Ask OneStep (Qwen 2.5)</span>
        </div>
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-[10px] text-[#7656A7] hover:underline cursor-pointer"
          >
            Configure Model
          </button>
        )}
      </div>

      {/* Error notice if Ollama was unreachable */}
      {errorNotice && (
        <div className="p-1.5 px-2 bg-[#C86D51]/10 rounded border border-[#C86D51]/30 text-[10px] text-[#C86D51] flex items-center justify-between">
          <span className="truncate">{errorNotice}</span>
          <button onClick={() => setErrorNotice(null)} className="ml-1 font-bold">×</button>
        </div>
      )}

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
            <span>Qwen 2.5 is thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask a question about this step or webpage..."
          className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] placeholder:text-[#A09A90] focus:outline-none focus:ring-1 focus:ring-[#7656A7]"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isTyping}
          aria-label="Send query"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-[#7656A7] hover:text-[#654791] disabled:opacity-30 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
