import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

import {cn} from '~/lib/utils';

interface PriceProps {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
  /** Visual size of the price text. */
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<PriceProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

/**
 * Renders a money value with optional compare-at (strikethrough) pricing.
 * The single source of truth for price presentation across the storefront.
 */
export function Price({
  price,
  compareAtPrice,
  className,
  size = 'md',
}: PriceProps) {
  const onSale =
    compareAtPrice &&
    price &&
    Number(compareAtPrice.amount) > Number(price.amount);

  return (
    <div
      aria-label="Price"
      role="group"
      className={cn(
        'flex items-center gap-2 font-medium tabular-nums',
        sizeClasses[size],
        className,
      )}
    >
      {price ? (
        <span className={cn(onSale && 'text-destructive')}>
          {/* withoutTrailingZeros prevents locale mismatch between SSR (id-ID) and
          client hydration (en) which would cause "Text content did not match". */}
          <Money data={price} withoutTrailingZeros />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
      {onSale && (
        <s className="font-normal text-muted-foreground">
          <Money data={compareAtPrice} withoutTrailingZeros />
        </s>
      )}
    </div>
  );
}
