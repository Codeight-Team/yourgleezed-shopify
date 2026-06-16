import {cn} from '~/lib/utils';
import {Container} from '~/components/Container';

interface SectionProps extends React.ComponentProps<'section'> {
  /** Small uppercase label shown above the title. */
  eyebrow?: string;
  /** Section heading. */
  title?: React.ReactNode;
  /** Supporting copy beneath the title. */
  description?: React.ReactNode;
  /** Optional action node (e.g. "View all" link) shown beside the heading. */
  action?: React.ReactNode;
  /** Disable the inner Container wrapper for full-bleed sections. */
  fullBleed?: boolean;
  /** Center-align the heading block. */
  centered?: boolean;
}

/**
 * Vertical-rhythm wrapper that standardizes section spacing and heading
 * layout across all marketing and commerce pages.
 */
export function Section({
  eyebrow,
  title,
  description,
  action,
  fullBleed = false,
  centered = false,
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeader = eyebrow || title || description || action;

  const header = hasHeader ? (
    <div
      className={cn(
        'mb-8 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between',
        centered && 'items-center text-center md:flex-col md:items-center',
      )}
    >
      <div className={cn('flex flex-col gap-3', centered && 'items-center')}>
        {eyebrow && (
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {eyebrow}
          </span>
        )}
        {title && (
          <h2 className="text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold tracking-[var(--text-title--letter-spacing)]">
            {title}
          </h2>
        )}
        {description && (
          <p className="max-w-2xl text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  ) : null;

  return (
    <section
      className={cn('py-[var(--spacing-section)]', className)}
      {...props}
    >
      {fullBleed ? (
        <>
          {hasHeader && <Container>{header}</Container>}
          {children}
        </>
      ) : (
        <Container>
          {header}
          {children}
        </Container>
      )}
    </section>
  );
}
