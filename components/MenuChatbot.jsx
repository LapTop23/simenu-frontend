// components/MenuChatbot.jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { askMenuChatbot } from '../lib/api';

/**
 * MenuChatbot — a floating chat bubble on the customer menu page, only
 * rendered when `restaurant.plan === 'premium'` (checked by the caller,
 * app/menu/page.jsx — this component itself doesn't re-check the plan,
 * since the backend endpoint independently rejects non-Premium requests
 * regardless of whether this ever renders).
 *
 * Grounded entirely in the restaurant's own real menu data server-side (see
 * chatbot.controller.js) — this widget itself just relays the conversation,
 * it never sees or trusts anything about pricing/availability on its own.
 */
export default function MenuChatbot({ restaurantSlug, restaurantName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content: string }
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isSending]);

  const handleSend = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    setError(null);
    setInput('');
    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const { answer } = await askMenuChatbot(restaurantSlug, question, messages);
      setMessages([...nextMessages, { role: 'assistant', content: answer }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 sm:bottom-6">
      {isOpen && (
        <div className="mb-3 flex h-96 w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-sand bg-white shadow-xl shadow-ink/20">
          <div className="flex items-center justify-between bg-basil px-4 py-3">
            <div>
              <p className="notranslate font-display text-sm italic text-paper">{restaurantName} Assistant</p>
              <p className="text-[10px] text-paper/60">Ask about the menu ✨</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-paper/70 hover:text-paper" aria-label="Close chat">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto bg-paper px-3 py-3">
            {messages.length === 0 && (
              <p className="rounded-2xl bg-white px-3 py-2 text-xs text-ink/50 shadow-sm shadow-ink/5">
                Hi! Ask me things like "what's spicy," "anything vegan," or "recommend something under 1000."
              </p>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm shadow-ink/5 ${
                  msg.role === 'user' ? 'ml-auto bg-chili text-paper' : 'bg-white text-ink'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isSending && (
              <div className="max-w-[85%] rounded-2xl bg-white px-3 py-2 text-xs text-ink/40 shadow-sm shadow-ink/5">Thinking…</div>
            )}
            {error && <p className="rounded-2xl bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-sand bg-white px-3 py-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu…"
              disabled={isSending}
              className="min-w-0 flex-1 rounded-full border border-sand px-3 py-1.5 text-xs text-ink outline-none focus:border-basil"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="flex-shrink-0 rounded-full bg-chili px-3 py-1.5 text-xs font-semibold text-paper disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close menu assistant' : 'Open menu assistant'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-chili text-2xl text-paper shadow-lg shadow-chili/40 transition-transform active:scale-95"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
