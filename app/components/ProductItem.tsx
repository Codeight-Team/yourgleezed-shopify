import {ProductCard} from '~/components/ProductCard';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';

/**
 * Thin wrapper kept for backwards compatibility with existing routes.
 * Delegates to the premium {@link ProductCard}.
 */
export function ProductItem({
  product,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  return <ProductCard product={product} loading={loading} />;
}
