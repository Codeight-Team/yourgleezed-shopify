import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

import {cn} from '~/lib/utils';

const PRODUCT_GRID_CLASSES =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4';

/**
 * Skeleton card loader with beautiful animation
 */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 bg-[length:200%_100%] animate-shimmer" />
      <div className="space-y-2">
        <div className="h-5 w-full rounded bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 bg-[length:200%_100%] animate-shimmer" />
        <div className="h-4 w-2/3 rounded bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}

/**
 * Encapsulates pagination behavior with optional infinite scroll support.
 * Supports both traditional pagination and infinite scroll modes.
 * In infinite scroll mode, keeps the "Load more" button while also auto-loading when scrolled near the bottom.
 * 
 * @param mode - 'pagination' (default) for button-based pagination, 'infinite-scroll' for auto-loading + button
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName = PRODUCT_GRID_CLASSES,
  mode = 'pagination',
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
  mode?: 'pagination' | 'infinite-scroll';
}) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const isLoadingRef = React.useRef(false);
  const [showFixedButton, setShowFixedButton] = React.useState(false);
  const [showSkeletons, setShowSkeletons] = React.useState(false);

  // Set up intersection observer at component level
  React.useEffect(() => {
    if (mode !== 'infinite-scroll' || !sentinelRef.current) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Show fixed button when sentinel is not visible
          setShowFixedButton(!entry.isIntersecting);
          
          if (entry.isIntersecting && !isLoadingRef.current) {
            // Show skeletons immediately
            setShowSkeletons(true);
            
            // Clear any pending timeout
            if (timeoutId) clearTimeout(timeoutId);
            
            // Trigger load more after a short delay
            timeoutId = setTimeout(() => {
              const nextLink = sentinelRef.current?.querySelector('a');
              if (nextLink && !isLoadingRef.current) {
                nextLink.click();
              }
            }, 300);
          }
        });
      },
      {threshold: 0.1, rootMargin: '100px'},
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mode]);

  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        // Track loading state for observer callback
        isLoadingRef.current = isLoading;

        // Hide skeletons when loading is done
        if (!isLoading && showSkeletons) {
          setShowSkeletons(false);
        }

        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        const linkClass =
          'inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-muted';

        // Pagination mode (traditional)
        if (mode === 'pagination') {
          return (
            <div className="flex flex-col gap-10">
              <div className="flex justify-center">
                <PreviousLink className={linkClass}>
                  {isLoading ? 'Loading…' : '↑ Load previous'}
                </PreviousLink>
              </div>
              <div
                aria-label={ariaLabel}
                className={cn(resourcesClassName)}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
              <div className="flex justify-center">
                <NextLink className={linkClass}>
                  {isLoading ? 'Loading…' : 'Load more ↓'}
                </NextLink>
              </div>
            </div>
          );
        }

        // Infinite scroll mode - coexist with load more button
        return (
          <>
            <div className="flex flex-col gap-10">
              <div
                aria-label={ariaLabel}
                className={cn(resourcesClassName)}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
                
                {/* Skeleton cards shown while loading or when scrolled to bottom */}
                {(isLoading || showSkeletons) && (
                  <>
                    {Array.from({length: 4}).map((_, index) => (
                      <SkeletonCard key={`skeleton-${index}`} />
                    ))}
                  </>
                )}
              </div>

              {/* Sentinel for infinite scroll - contains hidden next link for clicking */}
              <div
                ref={sentinelRef}
                className="h-20"
                aria-live="polite"
              >
                <NextLink className="sr-only">Load more</NextLink>
              </div>

              {/* End of results message */}
              {!isLoading && nodes.length > 0 && !showSkeletons && (
                <div className="flex justify-center py-8">
                  <div className="text-center text-sm text-muted-foreground">
                    <p className="font-medium">You've reached the end</p>
                    <p className="text-xs">No more products to load</p>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Load more button - only shows when sentinel is out of view */}
            {showFixedButton && (
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                <NextLink className={cn(linkClass, 'bg-white/80 backdrop-blur')}>
                  {isLoading ? 'Loading…' : 'Load more ↓'}
                </NextLink>
              </div>
            )}
          </>
        );
      }}
    </Pagination>
  );
}
