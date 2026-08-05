import LegalDocument from '../../../components/marketing/LegalDocument';

export const metadata = { title: 'Refund & Cancellation Policy — SiMenu' };

const sections = [
  {
    heading: 'Summary',
    paragraphs: [
      'The Free plan is free forever — no card needed, nothing to cancel. Every paid plan\'s first month is completely free, and you can cancel during that first month at no cost. Once billing actually starts, you can cancel any time — we don\'t issue automatic refunds for time already paid for, but we handle real problems with flexibility, described exactly below.',
    ],
  },
  {
    heading: '1. The Free Plan',
    paragraphs: ['Costs nothing and has no time limit. No payment information is ever required to use it.'],
  },
  {
    heading: '2. The First Free Month on Paid Plans',
    list: [
      'Every paid plan gives you a completely free first month the moment you subscribe.',
      'You can cancel at any point during that first month at no cost whatsoever.',
      'You are never automatically charged without warning — billing only begins once your free first month ends, and only if you haven\'t cancelled.',
    ],
  },
  {
    heading: '3. Cancelling a Paid Subscription',
    list: [
      'You may cancel anytime from your account settings.',
      'Your access continues until the end of your current paid billing period.',
      'Subscriptions do not auto-renew after you cancel.',
    ],
  },
  {
    heading: '4. Refunds',
    paragraphs: ['As a small, independently-operated SaaS service, we don\'t issue automatic refunds for periods already charged once your free first month has ended. That said:'],
    list: [
      '7-day refund window: if a serious technical issue prevents you from meaningfully using SiMenu, and we can\'t resolve it within 48 hours of you reporting it, you may request a full refund within 7 days of the charge.',
      'Duplicate charges: if you\'re charged twice by mistake due to a technical error, the extra charge is refunded immediately.',
      'Exceptional circumstances: genuine one-off situations are handled with flexibility — reach out and we\'ll find a fair resolution.',
    ],
  },
  {
    heading: '5. Downgrading or Changing Plans',
    paragraphs: ['You can move between paid plans anytime. If you downgrade partway through a billing period, the change takes effect at the start of your next billing period — we don\'t pro-rate the difference.'],
  },
  {
    heading: '6. How to Request a Refund',
    paragraphs: ['Email us with your restaurant\'s name, the email on your account, the payment date and amount, and the reason for your request. We aim to respond within 3 business days.'],
  },
];

export default function RefundPolicyPage() {
  return <LegalDocument title="Refund & Cancellation Policy" subtitle="Last updated: [publishing date] · Operated by Sayyam Ijaz · Pakistan" sections={sections} />;
}
