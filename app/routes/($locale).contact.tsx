import {Mail, MapPin, Phone, Clock} from 'lucide-react';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/contact';
import {Hero} from '~/components/Hero';
import {Section} from '~/components/Section';
import {Container} from '~/components/Container';
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

const CONTACT_QUERY = `#graphql
  query ContactInformation {
    metaobject(
      handle: {
        type: "contact_information"
        handle: "contact-yourgleezed-com"
      }
    ) {
      id
      email: field(key: "email") {
        value
      }
      phone: field(key: "phone") {
        value
      }
      whatsapp: field(key: "whatsapp") {
        value
      }
      address: field(key: "address") {
        value
      }
      businessHours: field(key: "business_hours") {
        value
      }
      mapsUrl: field(key: "maps_url") {
        value
      }
      instagramUrl: field(key: "instagram_url") {
        value
      }
      facebookUrl: field(key: "facebook_url") {
        value
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const {metaobject} = await storefront.query(CONTACT_QUERY, {
    variables: {},
  });

  if (!metaobject) {
    throw new Response('Contact information not found', {status: 404});
  }

  return {
    contact: {
      email: metaobject.email?.value ?? null,
      phone: metaobject.phone?.value ?? null,
      whatsapp: metaobject.whatsapp?.value ?? null,
      address: metaobject.address?.value ?? null,
      businessHours: metaobject.businessHours?.value ?? null,
      mapsUrl: metaobject.mapsUrl?.value ?? null,
      instagramUrl: metaobject.instagramUrl?.value ?? null,
      facebookUrl: metaobject.facebookUrl?.value ?? null,
    },
  };
}

export default function Contact() {
  const {contact} = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero title="CONTACT US" theme="light" />

      {/* Services Section */}
      <Section eyebrow="SERVICES" title="">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Contact Us */}
          <ServiceCard title="Contact Us">
            <ul className="flex flex-col gap-3">
              {contact.email && (
                <li className="flex items-center gap-2.5 text-sm">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-brand transition-colors"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2.5 text-sm">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                    className="hover:text-brand transition-colors"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.whatsapp && (
                <li className="flex items-center gap-2.5 text-sm">
                  <svg
                    className="size-4 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand transition-colors"
                  >
                    {contact.whatsapp}
                  </a>
                </li>
              )}
              {contact.businessHours && (
                <li className="flex items-start gap-2.5 text-sm">
                  <Clock className="size-4 shrink-0 translate-y-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground whitespace-pre-line">
                    {contact.businessHours}
                  </span>
                </li>
              )}
            </ul>
          </ServiceCard>

          {/* Store Location */}
          <ServiceCard title="Store Location">
            {contact.address ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="size-4 shrink-0 translate-y-0.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {contact.address}
                  </span>
                </div>
                {contact.mapsUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="self-start rounded-full"
                  >
                    <a
                      href={contact.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Maps
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Store location coming soon.
              </p>
            )}
          </ServiceCard>

          {/* Follow Us */}
          <ServiceCard title="Follow Us">
            <div className="flex flex-col gap-3">
              {contact.instagramUrl && (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm hover:text-brand transition-colors"
                >
                  <svg
                    className="size-4 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
              )}
              {contact.facebookUrl && (
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm hover:text-brand transition-colors"
                >
                  <svg
                    className="size-4 shrink-0 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
              )}
              {!contact.instagramUrl && !contact.facebookUrl && (
                <p className="text-sm text-muted-foreground">
                  Follow us on social media coming soon.
                </p>
              )}
            </div>
          </ServiceCard>

          {/* Business Partnership */}
          <ServiceCard title="Business Partnership">
            <p className="mb-4 text-sm text-muted-foreground">
              Interested in partnering with {BRAND.name}? We welcome brand
              collaborations, wholesale inquiries, and business proposals.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="self-start rounded-full"
            >
              <a href={`mailto:${contact.email ?? BRAND.email}`}>
                Get in touch
              </a>
            </Button>
          </ServiceCard>

          {/* Wholesale Inquiry */}
          <ServiceCard title="Wholesale Inquiry">
            <p className="mb-4 text-sm text-muted-foreground">
              We offer wholesale programmes for retailers and stockists. Reach
              out to discuss partnership opportunities.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="self-start rounded-full"
            >
              <a href={`mailto:${contact.email ?? BRAND.email}`}>
                Contact us
              </a>
            </Button>
          </ServiceCard>

          {/* General Questions */}
          <ServiceCard title="General Questions">
            <p className="mb-4 text-sm text-muted-foreground">
              Have a question? Feel free to check our FAQs or send us an
              email. We typically respond within one business day.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="self-start rounded-full"
            >
              <a href={`mailto:${contact.email ?? BRAND.email}`}>
                Send an email
              </a>
            </Button>
          </ServiceCard>
        </div>
      </Section>
    </div>
  );
}

function ServiceCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-[#F4F2EC]/40 p-6 transition-colors hover:bg-[#F4F2EC]/70">
      <h3 className="text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}
