import {useState} from 'react';
import {Image} from '@shopify/hydrogen';

import {cn} from '~/lib/utils';

export interface GalleryImage {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
  className?: string;
}

/**
 * Product detail gallery. Shows a large primary image with selectable
 * thumbnails on larger screens and a horizontal swipe strip on mobile.
 */
export function ProductGallery({
  images,
  title,
  className,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'flex aspect-square items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground',
          className,
        )}
      >
        No image available
      </div>
    );
  }

  const active = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/5">
        <Image
          key={active.id || active.url}
          alt={active.altText || title}
          data={active}
          sizes="(min-width: 1024px) 50vw, 100vw"
          loading="eager"
          className="size-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <ul
          className="flex gap-3 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible"
          aria-label="Product images"
        >
          {images.map((image, index) => {
            const selected = index === activeIndex;
            return (
              <li key={image.id || image.url}>
                <button
                  type="button"
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-current={selected}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 transition-all',
                    selected
                      ? 'ring-2 ring-foreground'
                      : 'ring-foreground/10 hover:ring-foreground/30',
                  )}
                >
                  <Image
                    alt={image.altText || `${title} thumbnail ${index + 1}`}
                    data={image}
                    sizes="80px"
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
