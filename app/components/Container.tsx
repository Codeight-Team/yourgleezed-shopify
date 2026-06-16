import {cn} from '~/lib/utils';

type ContainerProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/**
 * Constrains content to the site's max width with consistent, responsive
 * horizontal padding. The single source of truth for page gutters.
 */
export function Container<T extends React.ElementType = 'div'>({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? 'div';
  return (
    <Component className={cn('container-px', className)} {...props}>
      {children}
    </Component>
  );
}
