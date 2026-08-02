// components/LanguageSwitcher.jsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// The full list Google Translate's website widget supports — every code here
// is one Google's own `includedLanguages` option recognizes. Kept in one
// place so adding/removing a language is a one-line change.
const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'af', label: 'Afrikaans' }, { code: 'sq', label: 'Albanian' },
  { code: 'am', label: 'Amharic' }, { code: 'ar', label: 'Arabic' }, { code: 'hy', label: 'Armenian' },
  { code: 'az', label: 'Azerbaijani' }, { code: 'eu', label: 'Basque' }, { code: 'be', label: 'Belarusian' },
  { code: 'bn', label: 'Bengali' }, { code: 'bs', label: 'Bosnian' }, { code: 'bg', label: 'Bulgarian' },
  { code: 'ca', label: 'Catalan' }, { code: 'ceb', label: 'Cebuano' }, { code: 'ny', label: 'Chichewa' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' }, { code: 'zh-TW', label: 'Chinese (Traditional)' },
  { code: 'co', label: 'Corsican' }, { code: 'hr', label: 'Croatian' }, { code: 'cs', label: 'Czech' },
  { code: 'da', label: 'Danish' }, { code: 'nl', label: 'Dutch' }, { code: 'eo', label: 'Esperanto' },
  { code: 'et', label: 'Estonian' }, { code: 'tl', label: 'Filipino' }, { code: 'fi', label: 'Finnish' },
  { code: 'fr', label: 'French' }, { code: 'fy', label: 'Frisian' }, { code: 'gl', label: 'Galician' },
  { code: 'ka', label: 'Georgian' }, { code: 'de', label: 'German' }, { code: 'el', label: 'Greek' },
  { code: 'gu', label: 'Gujarati' }, { code: 'ht', label: 'Haitian Creole' }, { code: 'ha', label: 'Hausa' },
  { code: 'haw', label: 'Hawaiian' }, { code: 'he', label: 'Hebrew' }, { code: 'hi', label: 'Hindi' },
  { code: 'hmn', label: 'Hmong' }, { code: 'hu', label: 'Hungarian' }, { code: 'is', label: 'Icelandic' },
  { code: 'ig', label: 'Igbo' }, { code: 'id', label: 'Indonesian' }, { code: 'ga', label: 'Irish' },
  { code: 'it', label: 'Italian' }, { code: 'ja', label: 'Japanese' }, { code: 'jw', label: 'Javanese' },
  { code: 'kn', label: 'Kannada' }, { code: 'kk', label: 'Kazakh' }, { code: 'km', label: 'Khmer' },
  { code: 'ko', label: 'Korean' }, { code: 'ku', label: 'Kurdish' }, { code: 'ky', label: 'Kyrgyz' },
  { code: 'lo', label: 'Lao' }, { code: 'la', label: 'Latin' }, { code: 'lv', label: 'Latvian' },
  { code: 'lt', label: 'Lithuanian' }, { code: 'lb', label: 'Luxembourgish' }, { code: 'mk', label: 'Macedonian' },
  { code: 'mg', label: 'Malagasy' }, { code: 'ms', label: 'Malay' }, { code: 'ml', label: 'Malayalam' },
  { code: 'mt', label: 'Maltese' }, { code: 'mi', label: 'Maori' }, { code: 'mr', label: 'Marathi' },
  { code: 'mn', label: 'Mongolian' }, { code: 'my', label: 'Myanmar (Burmese)' }, { code: 'ne', label: 'Nepali' },
  { code: 'no', label: 'Norwegian' }, { code: 'ps', label: 'Pashto' }, { code: 'fa', label: 'Persian' },
  { code: 'pl', label: 'Polish' }, { code: 'pt', label: 'Portuguese' }, { code: 'pa', label: 'Punjabi' },
  { code: 'ro', label: 'Romanian' }, { code: 'ru', label: 'Russian' }, { code: 'sm', label: 'Samoan' },
  { code: 'gd', label: 'Scots Gaelic' }, { code: 'sr', label: 'Serbian' }, { code: 'st', label: 'Sesotho' },
  { code: 'sn', label: 'Shona' }, { code: 'sd', label: 'Sindhi' }, { code: 'si', label: 'Sinhala' },
  { code: 'sk', label: 'Slovak' }, { code: 'sl', label: 'Slovenian' }, { code: 'so', label: 'Somali' },
  { code: 'es', label: 'Spanish' }, { code: 'su', label: 'Sundanese' }, { code: 'sw', label: 'Swahili' },
  { code: 'sv', label: 'Swedish' }, { code: 'tg', label: 'Tajik' }, { code: 'ta', label: 'Tamil' },
  { code: 'tt', label: 'Tatar' }, { code: 'te', label: 'Telugu' }, { code: 'th', label: 'Thai' },
  { code: 'tr', label: 'Turkish' }, { code: 'tk', label: 'Turkmen' }, { code: 'uk', label: 'Ukrainian' },
  { code: 'ur', label: 'Urdu' }, { code: 'ug', label: 'Uyghur' }, { code: 'uz', label: 'Uzbek' },
  { code: 'vi', label: 'Vietnamese' }, { code: 'cy', label: 'Welsh' }, { code: 'xh', label: 'Xhosa' },
  { code: 'yi', label: 'Yiddish' }, { code: 'yo', label: 'Yoruba' }, { code: 'zu', label: 'Zulu' },
];

const STORAGE_KEY = 'simenu_customer_lang';

/**
 * LanguageSwitcher — a compact "EN 🌐" button that expands into a searchable
 * dropdown, backed by Google Translate's real website-translation engine
 * (not a custom/manual translation system — this uses Google's own widget
 * under the hood, just wrapped in SiMenu's own styling instead of Google's
 * default banner UI, which is intentionally kept hidden — see the
 * `.goog-te-banner-frame` rule in app/globals.css).
 *
 * IMPORTANT companion piece: this only translates UI text. Dish names must
 * be wrapped in a `notranslate` class wherever they're rendered (see
 * MenuItemCard.jsx, ModifierSheet.jsx, CartDrawer.jsx, Header.jsx) — that's
 * a Google Translate convention this widget respects automatically; it does
 * NOT need any special handling here.
 *
 * IMPLEMENTATION NOTE (the actual fix for "the widget doesn't work" bugs):
 * Google's widget container must NOT be hidden with `display: none`. Its
 * internal setup can silently fail to fully initialize (specifically: the
 * hidden <select class="goog-te-combo"> this component depends on sometimes
 * never gets created) when its container has no layout at all. It's
 * positioned off-screen instead — has real layout, zero visible footprint.
 */
export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return LANGUAGES;
    const q = searchTerm.trim().toLowerCase();
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q));
  }, [searchTerm]);

  // ---- Load Google's translate script once, globally ----
  useEffect(() => {
    if (window.google?.translate?.TranslateElement) return; // Already loaded (e.g. fast navigation back to this page).
    if (document.getElementById('google-translate-script')) return; // Already in the middle of loading.

    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-new
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: LANGUAGES.map((l) => l.code).join(','),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    // Explicit https:// — a protocol-relative "//..." URL can silently fail
    // to load when the page itself is served over plain http:// (e.g. local
    // development on http://localhost), which was one real cause of "the
    // switcher does nothing."
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // ---- Restore a previously chosen language on page load ----
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || stored === 'en') return;

    // Google's hidden <select class="goog-te-combo"> only exists once its
    // widget finishes initializing (async script + async init) — poll
    // briefly rather than assuming it's ready immediately.
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      const applied = applyLanguage(stored);
      if (applied || attempts > 40) {
        // ~40 * 150ms = 6s ceiling — generous for a slow connection, without polling forever.
        clearInterval(interval);
        if (applied) setCurrentCode(stored);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // ---- Close the dropdown on outside click ----
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code) => {
    setIsOpen(false);
    setSearchTerm('');

    // Applying immediately usually works, but right after the widget script
    // first finishes loading there can be a brief window before the combo
    // box is fully interactive — a short retry loop covers that without
    // requiring the visitor to click twice.
    let attempts = 0;
    const tryApply = () => {
      attempts += 1;
      const applied = applyLanguage(code);
      if (applied) {
        setCurrentCode(code);
        localStorage.setItem(STORAGE_KEY, code);
      } else if (attempts < 10) {
        setTimeout(tryApply, 200);
      }
    };
    tryApply();
  };

  const currentLabel = LANGUAGES.find((l) => l.code === currentCode)?.code.toUpperCase() || 'EN';

  return (
    <div ref={containerRef} className="relative">
      {/* Google's own widget renders into this div. Positioned off-screen
          (NOT display:none) — see the implementation note above for why
          that distinction is what makes the widget actually initialize. */}
      <div
        id="google_translate_element"
        style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
      />

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change language"
        aria-expanded={isOpen}
        className="notranslate flex items-center gap-1 rounded-full border border-saffron/40 bg-basil-dark px-2.5 py-1 text-xs font-semibold text-paper"
      >
        {currentLabel} 🌐
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-sand bg-white text-left shadow-lg shadow-ink/10">
          <div className="border-b border-sand p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search language…"
              autoFocus
              className="w-full rounded-lg border border-sand px-2 py-1 text-xs text-ink outline-none focus:border-basil"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <p className="px-4 py-3 text-xs text-ink/40">No matching language.</p>
            ) : (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    currentCode === lang.code ? 'bg-basil/10 font-semibold text-basil' : 'text-ink hover:bg-paper'
                  }`}
                >
                  {lang.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Drives Google's hidden translate <select> directly (the standard,
 * well-known technique for using Google Translate's engine with fully
 * custom UI instead of its default banner). Returns true if the combo box
 * was found and triggered, false if the widget isn't ready yet — callers
 * use this to decide whether to keep polling/retry.
 */
function applyLanguage(code) {
  const combo = document.querySelector('.goog-te-combo');
  if (!combo) return false;
  combo.value = code;
  combo.dispatchEvent(new Event('change'));
  return true;
}
