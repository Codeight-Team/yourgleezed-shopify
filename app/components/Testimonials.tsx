import {StarIcon} from 'lucide-react';

import {Section} from '~/components/Section';
import {cn} from '~/lib/utils';

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  eyebrow?: string;
  title?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The quality is unmatched. Every detail feels considered, from the packaging to the finish. This is how premium should feel.',
    author: 'Maya Chen',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    quote:
      'Fast shipping, beautiful design, and it just works. I have recommended it to everyone I know.',
    author: 'James Okafor',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    quote:
      'Minimal, durable, and timeless. Exactly what I was looking for. Worth every penny.',
    author: 'Sofia Romano',
    role: 'Verified Buyer',
    rating: 5,
  },
];

/** Social-proof section with star ratings and customer quotes. */
export function Testimonials({
  testimonials = DEFAULT_TESTIMONIALS,
  eyebrow = 'Loved worldwide',
  title = 'What customers say',
}: TestimonialsProps) {
  if (!testimonials.length) return null;

  return (
    <Section eyebrow={eyebrow} title={title} centered className="bg-muted/40">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <figure
            key={index}
            className="flex flex-col gap-4 rounded-2xl bg-background p-8 ring-1 ring-foreground/5"
          >
            {testimonial.rating && (
              <div
                className="flex gap-0.5"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({length: 5}).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      'size-4',
                      i < testimonial.rating!
                        ? 'fill-foreground text-foreground'
                        : 'text-muted-foreground/30',
                    )}
                  />
                ))}
              </div>
            )}
            <blockquote className="text-pretty text-foreground">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto">
              <div className="font-medium">{testimonial.author}</div>
              {testimonial.role && (
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
