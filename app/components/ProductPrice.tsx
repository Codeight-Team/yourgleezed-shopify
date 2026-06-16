import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

import {Price} from '~/components/Price';

/**
 * Backwards-compatible wrapper around the shared {@link Price} component.
 */
export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  return <Price price={price} compareAtPrice={compareAtPrice} />;
}
