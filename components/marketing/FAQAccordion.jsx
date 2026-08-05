// components/marketing/FAQAccordion.jsx
'use client';

import { useState } from 'react';

/**
 * FAQAccordion — each answer is written as a short (1-3 sentence),
 * self-contained block on purpose (see the competitive analysis, Part 5:
 * GEO / Generative Engine Optimization) — this is exactly the format AI
 * answer engines (Google AI Overviews, ChatGPT, Perplexity) are described as
 * preferring to lift verbatim, not just something for human readers.
 */
export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="rounded-2xl border border-sand bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-ink">{item.question}</span>
              <span className={`flex-shrink-0 text-ink/40 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-ink/60">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
