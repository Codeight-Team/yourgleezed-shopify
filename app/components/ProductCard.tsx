import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';

import {useVariantUrl} from '~/lib/variants';
import {cn} from '~/lib/utils';
import {Price} from '~/components/Price';
import {Badge} from '~/components/ui/badge';

type AnyProduct =
  | CollectionItemFragment
  | ProductItemFragment
  | RecommendedProductFragment;

interface ProductCardProps {
  product: AnyProduct;
  loading?: 'eager' | 'lazy';
  /** Image priority hint for the responsive `sizes` attribute. */
  sizes?: string;
  className?: string;
}

/**
 * Premium product card used in grids, carousels and recommendations.
 * Reads from the shared product fragments and degrades gracefully when
 * optional fields (compare-at price, secondary image) are absent.
 */
export function ProductCard({
  product,
  loading,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw',
  className,
}: ProductCardProps) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  const minPrice = product.priceRange?.minVariantPrice;
  // Not every product fragment includes maxVariantPrice; read it defensively.
  const maxPrice =
    'maxVariantPrice' in product.priceRange
      ? product.priceRange.maxVariantPrice
      : undefined;
  // A range where min < max signals "from" pricing.
  const isRange =
    maxPrice && minPrice && Number(maxPrice.amount) > Number(minPrice.amount);

  return (
    <Link
      className={cn('group flex flex-col outline-none', className)}
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5 transition-shadow duration-300 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
        {image ? (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes={sizes}
            className="size-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {isRange && (
          <Badge
            variant="muted"
            className="absolute top-3 left-3 backdrop-blur"
          >
            Multiple options
          </Badge>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-brand">
          {product.title}
        </h3>
        {minPrice && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {isRange && <span className="text-xs">From</span>}
            <Price price={minPrice} size="sm" className="text-foreground" />
          </div>
        )}
      </div>
    </Link>
  );
}
