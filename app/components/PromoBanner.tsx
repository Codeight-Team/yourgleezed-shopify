import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {ArrowRightIcon} from 'lucide-react';

import {cn} from '~/lib/utils';
import {Container} from '~/components/Container';
import {Button} from '~/components/ui/button';
import type {HeroImage} from '~/components/Hero';

interface PromoBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: {label: string; to: string};
  image?: HeroImage | null;
  /** Place the text block on the left or right of the image (desktop). */
  imageSide?: 'left' | 'right';
  theme?: 'light' | 'dark';
}

/**
 * Promotional banner / feature showcase with alternating image + copy layout.
 * Apple-style editorial block used between homepage sections.
 */
export function PromoBanner({
  eyebrow,
  title,
  description,
  cta,
  image,
  imageSide = 'right',
  theme = 'dark',
}: PromoBannerProps) {
  const dark = theme === 'dark';

  return (
    <section className="py-[var(--spacing-section)]">
      <Container>
        <div
          className={cn(
            'grid items-center gap-8 overflow-hidden rounded-3xl md:grid-cols-2 md:gap-0',
            dark ? 'bg-foreground text-background' : 'bg-muted text-foreground',
          )}
        >
          <div
            className={cn(
              'flex flex-col gap-5 p-8 sm:p-12 lg:p-16',
              imageSide === 'left' && 'md:order-2',
            )}
          >
            {eyebrow && (
              <span className="text-xs font-semibold tracking-[0.2em] uppercase opacity-70">
                {eyebrow}
              </span>
            )}
            <h2 className="text-[length:var(--text-headline)] leading-[var(--text-headline--line-height)] font-semibold tracking-[var(--text-headline--letter-spacing)]">
              {title}
            </h2>
            {description && (
              <p className="max-w-md text-base opacity-80">{description}</p>
            )}
            {cta && (
              <div className="mt-2">
                <Button
                  asChild
                  size="lg"
                  variant={dark ? 'secondary' : 'default'}
                  className="h-12 rounded-full px-8"
                >
                  <Link to={cta.to}>
                    {cta.label}
                    <ArrowRightIcon />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div
            className={cn(
              'relative aspect-[4/3] size-full md:aspect-auto md:h-full md:min-h-[28rem]',
              imageSide === 'left' && 'md:order-1',
            )}
          >
            {image && (
              <Image
                data={image}
                sizes="(min-width: 768px) 50vw, 100vw"
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
