import {cn} from '~/lib/utils';

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
  /** Max columns on the largest breakpoint. Mobile always starts at 2. */
  columns?: 3 | 4;
}

/**
 * Responsive product grid: 2 columns on mobile scaling up to 3 or 4 on
 * desktop. Used by collection pages, search and recommendations.
 */
export function ProductGrid({
  children,
  className,
  columns = 4,
}: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3',
        columns === 4 && 'xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
