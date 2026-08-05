import LegalDocument from '../../../components/marketing/LegalDocument';

export const metadata = { title: 'Terms of Service — SiMenu' };

const sections = [
  {
    paragraphs: [
      'These Terms govern access to and use of SiMenu, operated by Sayyam Ijaz ("we," "us," "SiMenu"). By creating a Restaurant Owner account, or using SiMenu as a Customer, you agree to these Terms.',
    ],
  },
  {
    heading: '1. What SiMenu is',
    paragraphs: [
      'SiMenu provides restaurant owners with a dashboard to manage a digital menu, generate secure table QR codes, receive live orders, and view sales analytics. SiMenu is a technology platform, not a restaurant — we do not prepare or deliver food, and are not a party to the transaction between a Restaurant Owner and their Customers.',
    ],
  },
  {
    heading: '2. Plans and pricing',
    table: {
      headers: ['Plan', 'Price', 'Includes'],
      rows: [
        ['Free', '0 PKR/mo', '1 restaurant, 3 tables, QR ordering'],
        ['Starter', '1,499 PKR/mo (first month free)', 'Core QR ordering, live kitchen dashboard, up to 100 menu items'],
        ['Growth', '2,499 PKR/mo (first month free)', 'Everything in Starter + sales analytics, size variants, multi-language, dynamic branding'],
        ['Business', '3,999 PKR/mo (first month free)', 'Everything in Growth + header cover image, priority support'],
        ['Premium', '5,999 PKR/mo (first month free)', 'Everything in Business + AI menu assistant, custom domain'],
      ],
    },
    paragraphs: ['Every paid plan\'s first month is completely free — you are not charged until your second month begins. Full billing and refund terms are set out in our Refund & Cancellation Policy.'],
  },
  {
    heading: '3. Account responsibilities',
    list: [
      'You must be at least 18 to create a Restaurant Owner account.',
      'You are responsible for the accuracy of your menu content and compliance with applicable food safety and consumer-protection laws.',
      'You are responsible for printing and maintaining your table QR codes, and for regenerating any code you believe may be compromised.',
    ],
  },
  {
    heading: '4. Customer use',
    paragraphs: ['Customers may view a menu and place orders without registering. Placing an order authorizes the restaurant to prepare and fulfill it. Payment for food/drink itself is arranged directly with the restaurant.'],
  },
  {
    heading: '5. Acceptable use',
    paragraphs: ['You agree not to attempt to bypass table QR security keys, gain unauthorized access to another restaurant\'s account, use automated scraping tools, or use SiMenu unlawfully.'],
  },
  {
    heading: '6. Disclaimers and liability',
    paragraphs: [
      'SiMenu is provided "as is." We do not warrant uninterrupted or error-free operation, and are not responsible for the accuracy of menu content entered by Restaurant Owners, or the quality of food or service provided.',
      'To the maximum extent permitted under Pakistani law, our total liability arising from these Terms shall not exceed the amount you paid us in the three months preceding a claim.',
    ],
  },
  {
    heading: '7. Governing law',
    paragraphs: ['These Terms are governed by the laws of the Islamic Republic of Pakistan.'],
  },
];

export default function TermsOfServicePage() {
  return <LegalDocument title="Terms of Service" subtitle="Last updated: [publishing date]" sections={sections} />;
}
