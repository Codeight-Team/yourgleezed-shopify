import {Suspense, useMemo} from 'react';
import {Await, NavLink, Link} from 'react-router';
import {AtSignIcon, CameraIcon, CirclePlayIcon} from 'lucide-react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

import {Container} from '~/components/Container';
import {Separator} from '~/components/ui/separator';
import {BRAND, FOOTER_COLUMNS} from '~/lib/constants';
import {toAppHref} from '~/lib/utils';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

/**
 * Premium multi-column footer: brand statement, navigation columns, social
 * links and a legal row. Uses the Shopify footer menu when available and
 * falls back to curated columns otherwise.
 */
export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  const primaryDomainUrl = header.shop.primaryDomain?.url;
  // SSR-safe: generate year once at component mount. Prevents hydration mismatch
  // from new Date() differing between server render and client hydration.
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-2">
            <Link to="/" className="text-xl font-semibold tracking-tight">
              {header.shop.name || BRAND.name}
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {BRAND.description}
            </p>
            <div className="mt-2 flex gap-2">
              <SocialLink href={BRAND.social.instagram} label="Instagram">
                <CameraIcon className="size-4" />
              </SocialLink>
              <SocialLink href={BRAND.social.twitter} label="Twitter">
                <AtSignIcon className="size-4" />
              </SocialLink>
              <SocialLink href={BRAND.social.youtube} label="YouTube">
                <CirclePlayIcon className="size-4" />
              </SocialLink>
            </div>
          </div>

          <Suspense fallback={<FooterColumnsFallback />}>
            <Await resolve={footerPromise}>
              {(footer) =>
                footer?.menu && primaryDomainUrl ? (
                  <ShopifyFooterColumns
                    menu={footer.menu}
                    primaryDomainUrl={primaryDomainUrl}
                    publicStoreDomain={publicStoreDomain}
                  />
                ) : (
                  <FooterColumnsFallback />
                )
              }
            </Await>
          </Suspense>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            &copy; {year} {header.shop.name || BRAND.name}.
            All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal">
            <Link to="/policies/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/policies/terms-of-service" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/policies/refund-policy" className="hover:text-foreground">
              Returns
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground hover:text-background"
    >
      {children}
    </a>
  );
}

function ShopifyFooterColumns({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: NonNullable<FooterQuery['menu']>;
  primaryDomainUrl: string;
  publicStoreDomain: string;
}) {
  return (
    <>
      {menu.items.map((item) => {
        if (!item.url) return null;
        const children = item.items ?? [];
        // When the menu is flat (no children), render a single "Links" column.
        const hasChildren = children.length > 0;

        const top = toAppHref(item.url, publicStoreDomain, primaryDomainUrl);

        return (
          <div key={item.id} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{item.title}</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              {hasChildren ? (
                children.map((child) => {
                  if (!child.url) return null;
                  const sub = toAppHref(
                    child.url,
                    publicStoreDomain,
                    primaryDomainUrl,
                  );
                  return (
                    <li key={child.id}>
                      <FooterLink {...sub} label={child.title} />
                    </li>
                  );
                })
              ) : (
                <li>
                  <FooterLink {...top} label={item.title} />
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </>
  );
}

function FooterColumnsFallback() {
  return (
    <>
      {FOOTER_COLUMNS.map((column) => (
        <div key={column.title} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">{column.title}</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            {column.links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function FooterLink({
  href,
  isExternal,
  label,
}: {
  href: string;
  isExternal: boolean;
  label: string;
}) {
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground"
      >
        {label}
      </a>
    );
  }
  return (
    <NavLink to={href} prefetch="intent" className="hover:text-foreground">
      {label}
    </NavLink>
  );
}
