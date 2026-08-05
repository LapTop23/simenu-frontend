import LegalDocument from '../../../components/marketing/LegalDocument';

export const metadata = { title: 'Privacy Policy — SiMenu' };

const sections = [
  {
    paragraphs: [
      'SiMenu is a digital menu and real-time ordering platform, operated by Sayyam Ijaz ("we," "us," "our," or "SiMenu"). This Privacy Policy explains exactly what information SiMenu collects, why, and how it\'s protected.',
      'Contact: [business email — publishing soon, once our domain is active]',
    ],
  },
  {
    heading: '1. Who this applies to',
    list: [
      'Restaurant Owners — create an account to manage a restaurant\'s menu, receive live orders, and generate table QR codes.',
      'Customers / Diners — scan a table\'s QR code to view a menu and place an order. Customers never create an account, and there is no customer login, profile, or password anywhere in SiMenu.',
    ],
  },
  {
    heading: '2. What SiMenu actually collects',
    paragraphs: [
      'From Restaurant Owners: email and password (stored only as a one-way cryptographic hash — we never see your actual password), or your verified Google account email/name if you sign in with Google; restaurant name, web address, logo, cover image, and brand colors; menu content including dish names, prices, sizes, photos, and allergen/dietary tags; and your own restaurant\'s sales data.',
      'From Customers: order details (items, sizes, modifiers, table number, total), and a temporary, anonymous table session created when a QR code is scanned, used only to confirm an order comes from that physical table for a few hours. We deliberately do not collect a customer\'s name, phone number, email, or payment details — SiMenu\'s ordering flow was built so a diner never has to hand over personal information just to order food.',
    ],
  },
  {
    heading: '3. Cookies and local storage',
    list: [
      'One login cookie for Restaurant Owners, marked httpOnly so no script can read it — used solely to keep you logged in.',
      'Local browser storage for Customers (not a tracking cookie) to remember an active order and a verified table session on your own device — never sent anywhere else.',
      'No third-party advertising cookies, and we never sell cookie-derived data.',
    ],
  },
  {
    heading: '4. Google Translate',
    paragraphs: [
      'If a customer uses the language switcher, page text is translated using Google\'s Translate widget, subject to Google\'s own privacy practices. Dish names are deliberately excluded from translation to avoid mistranslating a menu item\'s actual name.',
    ],
  },
  {
    heading: '5. How we protect your information',
    list: [
      'Passwords are hashed with bcrypt — we cannot see or recover your actual password.',
      'All traffic is encrypted (HTTPS).',
      'Each table\'s QR code carries a unique security key checked on every order.',
      'Table sessions automatically expire after a few hours.',
      'A restaurant owner\'s login only ever grants access to their own restaurant\'s data.',
    ],
  },
  {
    heading: '6. Where information is stored',
    paragraphs: ['Database: MongoDB Atlas. Images: Cloudinary. Hosting: Render and Vercel. Email: Resend. Data may be processed outside Pakistan depending on these providers\' regions.'],
  },
  {
    heading: '7. Your rights',
    paragraphs: ['You may request access to, correction of, or deletion of your personal information at any time by contacting us at the email above.'],
  },
  {
    heading: '8. Governing law',
    paragraphs: ['This policy is governed by the laws of the Islamic Republic of Pakistan.'],
  },
];

export default function PrivacyPolicyPage() {
  return <LegalDocument title="Privacy Policy" subtitle="Last updated: [publishing date]" sections={sections} />;
}
