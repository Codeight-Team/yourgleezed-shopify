import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

import {cn} from '~/lib/utils';

/**
 * Single-image product media used as a fallback when a product has no gallery.
 */
export function ProductImage({
  image,
  className,
}: {
  image: ProductVariantFragment['image'];
  className?: string;
}) {
  if (!image) {
    return (
      <div
        className={cn(
          'aspect-square rounded-2xl bg-muted ring-1 ring-foreground/5',
          className,
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        'aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/5',
        className,
      )}
    >
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="size-full object-cover"
      />
    </div>
  );
}
