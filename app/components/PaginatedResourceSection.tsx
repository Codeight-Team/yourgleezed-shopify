import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

import {cn} from '~/lib/utils';

const PRODUCT_GRID_CLASSES =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4';

/**
 * Encapsulates previous/next pagination behavior with premium, accessible
 * "Load more" controls. Defaults to the standard product grid layout.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName = PRODUCT_GRID_CLASSES,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        const linkClass =
          'inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-muted';

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
      }}
    </Pagination>
  );
}
