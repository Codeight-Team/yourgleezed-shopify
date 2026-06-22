/**
 * Centralized brand + store configuration.
 * Keep marketing copy and structural data here so components stay presentational.
 */

export const BRAND = {
  name: 'Yourgleezed',
  tagline: 'Wonderfull Shawl to Complete YourGleezed',
  description:
    'Premium essentials engineered with precision. Thoughtfully designed, built to last.',
  email: 'hello@aether.store',
  phone: '+1 (888) 555-0142',
  address: '1 Innovation Way, San Francisco, CA 94105',
  social: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com',
    tiktok: 'https://tiktok.com',
  },
} as const;

/** Responsive breakpoints (kept in sync with Tailwind defaults). */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type FooterColumn = {
  title: string;
  links: {label: string; to: string}[];
};

/** Fallback footer columns used when no Shopify footer menu is configured. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Shop',
    links: [
      {label: 'All Products', to: '/collections/all'},
      {label: 'Collections', to: '/collections'},
      {label: 'New Arrivals', to: '/collections/all'},
    ],
  },
  {
    title: 'Company',
    links: [
      {label: 'About', to: '/about'},
      {label: 'Contact', to: '/contact'},
      {label: 'Journal', to: '/blogs/journal'},
    ],
  },
  {
    title: 'Support',
    links: [
      {label: 'Search', to: '/search'},
      {label: 'Account', to: '/account'},
      {label: 'Policies', to: '/policies'},
    ],
  },
];
