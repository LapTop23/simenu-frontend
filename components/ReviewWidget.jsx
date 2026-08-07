// components/ReviewWidget.jsx
'use client';

import { useState } from 'react';
import { submitReview } from '../lib/api';

/**
 * ReviewWidget — a small, dismissible feedback card shown once after a
 * customer places a NEW order (never re-shown for a restored/tracked order
 * from an earlier visit — see app/menu/page.jsx, which only ever mounts this
 * right after a fresh checkout succeeds). Collects a 1-5 star rating and an
 * optional comment about the SiMenu ordering EXPERIENCE itself — not the
 * food, not the restaurant. This is internal product feedback: it is never
 * shown to the restaurant owner anywhere, and there is no UI in this
 * project that could display it back to one (see the backend's
 * review.controller.js, which deliberately has no read endpoint at all).
 */
export default function ReviewWidget({ restaurantSlug, orderId, tableNumber, onDismiss }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'submitted'
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError(null);
    setStatus('submitting');
    try {
      await submitReview(restaurantSlug, { rating, comment: comment.trim(), orderId, tableNumber });
      setStatus('submitted');
      // A brief moment to show the thank-you state before it disappears —
      // this is the "non-intrusive" part: it never demands another click
      // to go away once it's done its job.
      setTimeout(() => onDismiss?.(), 1800);
    } catch (err) {
      setError(err.message || 'Could not submit your feedback right now.');
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-4 pb-4 sm:bottom-6">
      {/* Dark theme deliberately — the customer menu's background is white,
          so a white card here blended in and didn't grab attention. Black
          (bg-ink) makes this genuinely stand out the moment it appears. */}
      <div className="ticket-edge relative rounded-t-3xl border border-white/10 bg-ink p-5 pt-6 shadow-xl shadow-ink/40 sm:rounded-b-3xl">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-paper/50 hover:text-paper"
        >
          ✕
        </button>

        {status === 'submitted' ? (
          <div className="py-4 text-center">
            <p className="text-2xl">🙏</p>
            <p className="mt-2 text-sm font-semibold text-paper">Thank you for your feedback!</p>
          </div>
        ) : (
          <>
            <h3 className="pr-6 text-sm font-semibold leading-snug text-paper">
              How was your ordering experience with SiMenu (Digital Menu)?
            </h3>
            <p className="mt-1 pr-6 text-sm leading-snug text-paper/70" dir="rtl" lang="ur">
              اپ کو اس ڈیجیٹل مینیو کے ساتھ ارڈر کرکے کیسا لگا؟
            </p>

            {error && <p className="mt-3 rounded-lg bg-chili/20 px-3 py-2 text-xs font-medium text-chili">{error}</p>}

            <div className="mt-4 flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
                  className="p-1 text-3xl leading-none transition-transform active:scale-90"
                >
                  <span className={(hoverRating || rating) >= star ? 'text-saffron' : 'text-white/20'}>★</span>
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Anything you'd like to share? (optional)"
              rows={2}
              maxLength={1000}
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-paper placeholder:text-paper/30 outline-none focus:border-white/30"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onDismiss}
                className="flex-1 rounded-2xl border border-white/15 py-2.5 text-sm font-semibold text-paper/60"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="flex-1 rounded-2xl bg-chili py-2.5 text-sm font-semibold text-paper shadow-sm shadow-chili/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
