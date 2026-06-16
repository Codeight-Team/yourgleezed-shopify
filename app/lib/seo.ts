/**
 * SEO utilities: meta tag builders and JSON-LD structured data generators.
 * Centralizes title/description/canonical/Open Graph/Twitter logic so every
 * route can produce consistent, crawlable metadata.
 */
import {BRAND} from '~/lib/constants';

type MetaDescriptor = Record<string, string> & {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  tagName?: string;
  rel?: string;
  href?: string;
};

export interface SeoInput {
  title?: string;
  description?: string;
  /** Canonical absolute or root-relative URL. */
  url?: string;
  /** Absolute image URL for social cards. */
  image?: string;
  type?: 'website' | 'product' | 'article';
  /** When true, prevents indexing (e.g. search results, account). */
  noindex?: boolean;
}

/** Compose a page title with the brand suffix, avoiding duplication. */
export function pageTitle(title?: string): string {
  if (!title) return BRAND.name;
  if (title.includes(BRAND.name)) return title;
  return `${title} | ${BRAND.name}`;
}

/**
 * Build a full set of meta descriptors (title, description, OG, Twitter,
 * canonical) for a route's `meta` export.
 */
export function buildMeta({
  title,
  description,
  url,
  image,
  type = 'website',
  noindex = false,
}: SeoInput): MetaDescriptor[] {
  const resolvedTitle = pageTitle(title);
  const resolvedDescription = description || BRAND.description;

  const meta: MetaDescriptor[] = [
    {title: resolvedTitle},
    {name: 'description', content: resolvedDescription},
    {property: 'og:title', content: resolvedTitle},
    {property: 'og:description', content: resolvedDescription},
    {property: 'og:type', content: type},
    {property: 'og:site_name', content: BRAND.name},
    {name: 'twitter:card', content: image ? 'summary_large_image' : 'summary'},
    {name: 'twitter:title', content: resolvedTitle},
    {name: 'twitter:description', content: resolvedDescription},
  ];

  if (url) {
    meta.push({property: 'og:url', content: url});
    meta.push({tagName: 'link', rel: 'canonical', href: url});
  }

  if (image) {
    meta.push({property: 'og:image', content: image});
    meta.push({name: 'twitter:image', content: image});
  }

  if (noindex) {
    meta.push({name: 'robots', content: 'noindex, nofollow'});
  }

  return meta;
}

/* -------------------------------------------------------------------------- */
/* JSON-LD structured data builders                                           */
/* -------------------------------------------------------------------------- */

export function organizationJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    url: siteUrl,
    description: BRAND.description,
    sameAs: Object.values(BRAND.social),
  };
}

export function websiteJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND.name,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

interface ProductJsonLdInput {
  name: string;
  description?: string;
  image?: string | string[];
  url: string;
  brand?: string;
  sku?: string;
  price?: string;
  currency?: string;
  availability?: boolean;
}

export function productJsonLd({
  name,
  description,
  image,
  url,
  brand = BRAND.name,
  sku,
  price,
  currency,
  availability,
}: ProductJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image ? (Array.isArray(image) ? image : [image]) : undefined,
    sku,
    brand: {'@type': 'Brand', name: brand},
    offers: price
      ? {
          '@type': 'Offer',
          url,
          price,
          priceCurrency: currency,
          availability: availability
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        }
      : undefined,
  };
}

export function breadcrumbJsonLd(
  items: {name: string; url: string}[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
