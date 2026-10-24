import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../../types';

interface AskOneStepInputProps {
  currentGoal: string;
  currentInstruction: string;
}

export const AskOneStepInput: React.FC<AskOneStepInputProps> = ({ currentGoal, currentInstruction }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `I'll guide you through "${currentGoal}". Focus on the highlighted element to continue.`,
      time: 'Now',
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
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = `For this step: ${currentInstruction}. Use "Show me" to focus the target element on the website.`;
      const qLower = query.toLowerCase();
      if (qLower.includes('receipt')) {
        reply = 'The fee receipt is available in Finance > Payment History once you reach the correct step.';
      } else if (qLower.includes('stuck') || qLower.includes('help')) {
        reply = 'Try "Show me" first. If still stuck, use "Do this step" to have OneStep trigger it in this prototype.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          time: 'Now',
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--surface-border)] bg-[var(--bg-main)] flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-primary)]">Ask OneStep</span>
      </div>
      <div className="p-3 space-y-2 max-h-28 overflow-y-auto">
        {messages.slice(-2).map((msg) => (
          <div
            key={msg.id}
            className={`text-xs leading-relaxed ${
              msg.sender === 'user' ? 'text-[var(--text-secondary)] text-right' : 'text-[var(--text-primary)]'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="text-xs text-[var(--text-secondary)]">Thinking...</div>}
      </div>
      <form onSubmit={handleSend} className="border-t border-[var(--surface-border)] p-2 flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/30"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          aria-label="Send"
          className="p-1.5 rounded-lg text-[var(--accent-primary)] disabled:opacity-40 hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
