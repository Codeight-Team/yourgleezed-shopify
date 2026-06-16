import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {ArrowRightIcon} from 'lucide-react';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';

import {Section} from '~/components/Section';
import {ProductGrid} from '~/components/ProductGrid';
import {ProductCard} from '~/components/ProductCard';
import {Skeleton} from '~/components/ui/skeleton';

interface FeaturedProductsProps {
  products: Promise<RecommendedProductsQuery | null>;
  eyebrow?: string;
  title?: string;
  description?: string;
  viewAllHref?: string;
}

/**
 * Streams a row of products (recommendations / best sellers) with a skeleton
 * fallback while the deferred query resolves.
 */
export function FeaturedProducts({
  products,
  eyebrow = 'Curated',
  title = 'Featured products',
  description,
  viewAllHref = '/collections/all',
}: FeaturedProductsProps) {
  return (
    <Section
      eyebrow={eyebrow}
      title={title}
      description={description}
      action={
        <Link
          to={viewAllHref}
          prefetch="intent"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-brand"
        >
          View all
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    >
      <Suspense fallback={<ProductsSkeleton />}>
        <Await resolve={products}>
          {(response) =>
            response?.products?.nodes?.length ? (
              <ProductGrid>
                {response.products.nodes.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    loading={index < 4 ? 'eager' : 'lazy'}
                  />
                ))}
              </ProductGrid>
            ) : null
          }
        </Await>
      </Suspense>
    </Section>
  );
}

function ProductsSkeleton() {
  return (
    <ProductGrid>
      {Array.from({length: 4}).map((_, index) => (
        <div key={index} className="flex flex-col gap-4">
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </ProductGrid>
  );
}
