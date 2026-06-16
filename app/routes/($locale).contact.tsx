import {useActionData, Form, data} from 'react-router';
import type {Route} from './+types/contact';
import {MailIcon, MapPinIcon, PhoneIcon} from 'lucide-react';

import {Container} from '~/components/Container';
import {Input} from '~/components/ui/input';
import {Textarea} from '~/components/ui/textarea';
import {Button} from '~/components/ui/button';
import {buildMeta} from '~/lib/seo';
import {BRAND} from '~/lib/constants';

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Contact',
    description: `Get in touch with the ${BRAND.name} team.`,
    url: '/contact',
  });
};

interface ContactActionData {
  ok?: boolean;
  errors?: Partial<Record<'name' | 'email' | 'message', string>>;
}

/**
 * Validates and "accepts" the contact submission. Wire this to an email
 * provider, Shopify Customer API, or a CRM when a backend is available.
 */
export async function action({request}: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const message = String(formData.get('message') || '').trim();

  const errors: ContactActionData['errors'] = {};
  if (!name) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address.';
  if (message.length < 10)
    errors.message = 'Your message should be at least 10 characters.';

  if (Object.keys(errors).length > 0) {
    return data<ContactActionData>({errors}, {status: 400});
  }

  return data<ContactActionData>({ok: true});
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  return (
    <Container className="py-10 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-6">
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Contact
          </span>
          <h1 className="text-[length:var(--text-headline)] leading-[var(--text-headline--line-height)] font-semibold tracking-[var(--text-headline--letter-spacing)]">
            Let&rsquo;s talk
          </h1>
          <p className="max-w-md text-muted-foreground">
            Questions about an order, a product, or a partnership? Send us a
            note and we&rsquo;ll get back to you within one business day.
          </p>

          <ul className="mt-2 flex flex-col gap-4 text-sm">
            <li className="flex items-center gap-3">
              <MailIcon className="size-5 text-muted-foreground" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-brand">
                {BRAND.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <PhoneIcon className="size-5 text-muted-foreground" />
              <a
                href={`tel:${BRAND.phone.replace(/[^\d+]/g, '')}`}
                className="hover:text-brand"
              >
                {BRAND.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPinIcon className="size-5 text-muted-foreground" />
              <span className="text-muted-foreground">{BRAND.address}</span>
            </li>
          </ul>
        </div>

        <div>
          {actionData?.ok ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
              <h2 className="text-lg font-semibold">Message sent</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks for reaching out. We&rsquo;ll be in touch shortly.
              </p>
            </div>
          ) : (
            <Form
              method="post"
              className="flex flex-col gap-5"
              aria-label="Contact form"
            >
              <Field label="Name" htmlFor="name" error={errors?.name}>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors?.name)}
                  required
                />
              </Field>
              <Field label="Email" htmlFor="email" error={errors?.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors?.email)}
                  required
                />
              </Field>
              <Field label="Message" htmlFor="message" error={errors?.message}>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  aria-invalid={Boolean(errors?.message)}
                  required
                />
              </Field>
              <Button type="submit" size="lg" className="rounded-full">
                Send message
              </Button>
            </Form>
          )}
        </div>
      </div>
    </Container>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
