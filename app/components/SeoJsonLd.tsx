import {useNonce} from '@shopify/hydrogen';

interface SeoJsonLdProps {
  /** One or more JSON-LD objects to embed as structured data. */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders JSON-LD structured data as a script tag with the CSP nonce.
 * Accepts a single object or an array (rendered as multiple scripts).
 */
export function SeoJsonLd({data}: SeoJsonLdProps) {
  const nonce = useNonce();
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          nonce={nonce}
          // Structured data is generated from trusted server data.
          dangerouslySetInnerHTML={{__html: JSON.stringify(item)}}
        />
      ))}
    </>
  );
}
