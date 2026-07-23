// components/CheckoutFooter.jsx
'use client';

/**
 * CheckoutFooter — sits at the bottom of the customer-facing menu/checkout
 * flow, below the food list and clear of the floating cart bar (the parent
 * page adds bottom padding so this never sits underneath it).
 *
 * Kept deliberately quiet: small type, muted color, a single hairline
 * divider — it should read as a footnote, not compete with the menu above it.
 */
export default function CheckoutFooter() {
  return (
    <footer className="mx-auto max-w-lg px-4 pb-6 pt-8">
      <div className="border-t border-sand pt-4 text-center">
        <p className="font-body text-xs tracking-wide text-ink/40">
          Powered by{' '}
          <a href="https://sayyamijaz.netlify.app"><span className="font-semibold text-ink/60">SiMenu</span></a>
          {' · '}
          Developed by{' '}
          <a
            href="https://sayyamijaz.netlify.app"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-medium text-ink/60 underline decoration-sand underline-offset-2 transition-colors hover:text-chili"
          >
            Sayyam Ijaz
          </a>
        </p>
      </div>
    </footer>
  );
}
