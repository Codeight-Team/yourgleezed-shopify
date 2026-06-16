import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowRightIcon} from 'lucide-react';
import type {CollectionFragment} from 'storefrontapi.generated';

import {cn} from '~/lib/utils';

interface CollectionCardProps {
  collection: Pick<
    CollectionFragment,
    'id' | 'title' | 'handle' | 'image'
  >;
  loading?: 'eager' | 'lazy';
  className?: string;
  /** Larger editorial treatment for feature placements. */
  featured?: boolean;
}

/**
 * Editorial collection tile with an image, overlay gradient and CTA.
 * Used on the homepage and the collections index.
 */
export function CollectionCard({
  collection,
  loading,
  className,
  featured = false,
}: CollectionCardProps) {
  return (
    <Link
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className={cn(
        'group relative flex overflow-hidden rounded-2xl bg-muted outline-none ring-foreground/5',
        featured ? 'aspect-[4/5] md:aspect-[16/10]' : 'aspect-[4/5]',
        className,
      )}
    >
      {collection.image && (
        <Image
          alt={collection.image.altText || collection.title}
          data={collection.image}
          loading={loading}
          sizes={featured ? '100vw' : '(min-width: 768px) 33vw, 100vw'}
          className="size-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-6 md:p-8">
        <h3
          className={cn(
            'font-semibold tracking-tight text-white',
            featured ? 'text-2xl md:text-4xl' : 'text-xl',
          )}
        >
          {collection.title}
        </h3>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-all duration-300 group-hover:bg-white group-hover:text-black">
          <ArrowRightIcon className="size-4" />
        </span>
      </div>
    </Link>
  );
}
