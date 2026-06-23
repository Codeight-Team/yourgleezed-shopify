import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowRightIcon} from 'lucide-react';

import {cn} from '~/lib/utils';
import {Button} from '~/components/ui/button';

export interface HeroImage {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCta?: {label: string; to: string};
  secondaryCta?: {label: string; to: string};
  image?: HeroImage | null;
  /** Position of the text content over the image. */
  align?: 'center' | 'start';
  /** Use a light text treatment over dark imagery. */
  theme?: 'light' | 'dark';
}

/**
 * Full-bleed, mobile-first hero with an optional background image and a
 * gradient scrim for legibility. Falls back to a clean typographic hero when
 * no image is supplied.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  image,
  align = 'center',
  theme = 'light',
}: HeroProps) {
  const light = theme === 'light';

  return (
    <section className="relative flex min-h-[20svh] w-full items-end overflow-hidden bg-foreground sm:min-h-[20svh]">
      {image && (
        <>
          <Image
            data={image}
            sizes="100vw"
            loading="eager"
            className="absolute inset-0 size-full object-cover"
          />
          <div
            className={cn(
              'absolute inset-0',
              light
                ? 'bg-gradient-to-t from-black/70 via-black/20 to-black/10'
                : 'bg-gradient-to-t from-white/70 via-white/20 to-white/10',
            )}
          />
        </>
      )}

      <div
        className={cn(
          'relative container-px flex w-full flex-col gap-6 pb-16 sm:pb-24',
          align === 'center' && 'items-center text-center',
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              'animate-[var(--animate-fade-in)] text-xs font-semibold tracking-[0.25em] uppercase',
              light ? 'text-white/80' : 'text-black/70',
            )}
          >
            {eyebrow}
          </span>
        )}
        <h1
          className={cn(
            'max-w-4xl animate-[var(--animate-fade-up)] text-[length:var(--text-display)] leading-[var(--text-display--line-height)] font-semibold tracking-[var(--text-display--letter-spacing)]',
            light ? 'text-white' : 'text-black',
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'max-w-xl text-lg text-pretty',
              align === 'center' && 'mx-auto',
              light ? 'text-white/85' : 'text-black/75',
            )}
          >
            {subtitle}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div
            className={cn(
              'mt-2 flex flex-col gap-3 sm:flex-row',
              align === 'center' && 'justify-center',
            )}
          >
            {primaryCta && (
              <Button asChild size="lg" className="h-12 rounded-full px-8">
                <Link to={primaryCta.to}>
                  {primaryCta.label}
                  <ArrowRightIcon />
                </Link>
              </Button>
            )}
            {secondaryCta && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className={cn(
                  'h-12 rounded-full px-8',
                  light &&
                    'border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white',
                )}
              >
                <Link to={secondaryCta.to}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
