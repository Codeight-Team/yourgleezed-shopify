import {useState} from 'react';
import {NavLink} from 'react-router';
import {ChevronDownIcon} from 'lucide-react';
import type {HeaderQuery} from 'storefrontapi.generated';

import {useAside} from '~/components/Aside';
import {Container} from '~/components/Container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {cn, toAppHref} from '~/lib/utils';

type Menu = HeaderQuery['menu'];
type MenuItem = NonNullable<Menu>['items'][number];

interface MegaMenuProps {
  menu: Menu;
  primaryDomainUrl: string;
  publicStoreDomain: string;
  className?: string;
}

const FALLBACK_MENU = {
  items: [
    {id: '1', title: 'Shop', url: '/collections/all', items: []},
    {id: '2', title: 'Collections', url: '/collections', items: []},
    {id: '3', title: 'About', url: '/about', items: []},
    {id: '4', title: 'Contact', url: '/contact', items: []},
  ],
} as unknown as NonNullable<Menu>;

/**
 * Desktop navigation with hover/focus mega-menu panels for items that have
 * children. Items without children render as simple links.
 */
export function MegaMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
  className,
}: MegaMenuProps) {
  const items = (menu ?? FALLBACK_MENU).items;
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <nav
      className={cn('items-center gap-1', className)}
      role="navigation"
      aria-label="Primary"
      onMouseLeave={() => setActiveId(null)}
    >
      {items.map((item) => {
        if (!item.url) return null;
        const {href} = toAppHref(item.url, publicStoreDomain, primaryDomainUrl);
        const children = item.items ?? [];
        const hasChildren = children.length > 0;
        const isOpen = activeId === item.id;

        return (
          <div
            key={item.id}
            className="group/item"
            onMouseEnter={() => setActiveId(hasChildren ? item.id : null)}
          >
            <NavLink
              to={href}
              prefetch="intent"
              end
              onFocus={() => setActiveId(hasChildren ? item.id : null)}
              className={({isActive}) =>
                cn(
                  'inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted',
                  isActive && 'text-brand',
                )
              }
              aria-expanded={hasChildren ? isOpen : undefined}
            >
              {item.title}
              {hasChildren && (
                <ChevronDownIcon
                  className={cn(
                    'size-3.5 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              )}
            </NavLink>

            {hasChildren && isOpen && (
              <div className="absolute inset-x-0 top-full z-40 border-b border-border bg-background/95 shadow-lg backdrop-blur-xl">
                <Container className="py-8">
                  <ul className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
                    {children.map((child) => {
                      if (!child.url) return null;
                      const sub = toAppHref(
                        child.url,
                        publicStoreDomain,
                        primaryDomainUrl,
                      );
                      return (
                        <li key={child.id}>
                          <NavLink
                            to={sub.href}
                            prefetch="intent"
                            onClick={() => setActiveId(null)}
                            className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {child.title}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </Container>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Mobile navigation rendered inside the menu drawer. Uses an accordion for
 * items that have children and plain links otherwise.
 */
export function MobileMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: Omit<MegaMenuProps, 'className'>) {
  const {close} = useAside();
  const items = (menu ?? FALLBACK_MENU).items;

  const linkClass =
    'block py-3 text-base font-medium text-foreground transition-colors hover:text-brand';

  return (
    <nav role="navigation" aria-label="Mobile">
      <NavLink to="/" end prefetch="intent" onClick={close} className={linkClass}>
        Home
      </NavLink>

      <Accordion type="single" collapsible className="w-full">
        {items.map((item: MenuItem) => {
          if (!item.url) return null;
          const {href} = toAppHref(
            item.url,
            publicStoreDomain,
            primaryDomainUrl,
          );
          const children = item.items ?? [];

          if (children.length === 0) {
            return (
              <NavLink
                key={item.id}
                to={href}
                prefetch="intent"
                onClick={close}
                className={cn(linkClass, 'border-b')}
              >
                {item.title}
              </NavLink>
            );
          }

          return (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-base font-medium">
                {item.title}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-1 pl-1">
                  <li>
                    <NavLink
                      to={href}
                      prefetch="intent"
                      onClick={close}
                      className="block py-2 text-sm text-foreground"
                    >
                      All {item.title}
                    </NavLink>
                  </li>
                  {children.map((child) => {
                    if (!child.url) return null;
                    const sub = toAppHref(
                      child.url,
                      publicStoreDomain,
                      primaryDomainUrl,
                    );
                    return (
                      <li key={child.id}>
                        <NavLink
                          to={sub.href}
                          prefetch="intent"
                          onClick={close}
                          className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {child.title}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </nav>
  );
}
