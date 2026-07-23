// hooks/useNotificationChime.js
'use client';

import { useCallback, useRef } from 'react';

/**
 * useNotificationChime — plays a short, subtle two-tone "ding" when a new
 * order arrives on the admin dashboard.
 *
 * Deliberately synthesized with the Web Audio API rather than loading an
 * .mp3/.wav asset: it needs no file to ship, host, or go missing, and its
 * volume/tone can be tuned in one place. Swap the body of `play` for an
 * `<audio>` element if a licensed sound asset is preferred later.
 *
 * The AudioContext is created lazily, on the first call to `play()`, because
 * browsers block audio contexts created before any user gesture — an admin
 * clicking anywhere on the dashboard before the first order arrives is enough
 * to satisfy that requirement.
 */
export function useNotificationChime() {
  const audioContextRef = useRef(null);

  const play = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Two quick sine tones (a rising interval) read as a gentle "new order" chime
      // rather than an alarm — appropriate for a device sitting on a kitchen counter.
      [784, 1046].forEach((frequency, index) => {
        const startTime = now + index * 0.11;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.32);

        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.35);
      });
    } catch (error) {
      // Audio is a nice-to-have, not critical path — a browser blocking it
      // (autoplay policy, unsupported API) should never break order intake.
      console.warn('[useNotificationChime] Unable to play notification sound:', error.message);
    }
  }, []);

  return play;
}
