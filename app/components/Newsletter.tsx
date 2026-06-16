import {useState} from 'react';
import {ArrowRightIcon, CheckIcon} from 'lucide-react';

import {cn} from '~/lib/utils';
import {Container} from '~/components/Container';
import {Input} from '~/components/ui/input';
import {Button} from '~/components/ui/button';
import {BRAND} from '~/lib/constants';

interface NewsletterProps {
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Email capture form. Performs lightweight client-side validation and shows a
 * success state. Wire `onSubmit` to a Shopify customer/marketing endpoint or
 * route action when a backend is available.
 */
export function Newsletter({
  className,
  title = 'Join the list',
  description = 'Be first to know about new arrivals, exclusive offers and stories from the studio.',
}: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setStatus('error');
      return;
    }
    // Placeholder for marketing integration; optimistic success UX.
    setStatus('success');
  }

  return (
    <section className={cn('py-[var(--spacing-section)]', className)}>
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 className="text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold tracking-[var(--text-title--letter-spacing)]">
            {title}
          </h2>
          <p className="max-w-md text-muted-foreground">{description}</p>

          {status === 'success' ? (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckIcon className="size-4 text-brand" />
              Thanks for subscribing. Check your inbox to confirm.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                aria-invalid={status === 'error'}
                aria-describedby={
                  status === 'error' ? 'newsletter-error' : undefined
                }
                required
                className="h-12 flex-1 rounded-full px-5"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-full px-6"
              >
                Subscribe
                <ArrowRightIcon />
              </Button>
            </form>
          )}

          {status === 'error' && (
            <p id="newsletter-error" className="text-sm text-destructive">
              Please enter a valid email address.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            By subscribing you agree to receive marketing emails from{' '}
            {BRAND.name}.
          </p>
        </div>
      </Container>
    </section>
  );
}
