import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  Image,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import {MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon} from 'lucide-react';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';

import {useAside} from '~/components/Aside';
import {Container} from '~/components/Container';
import {MegaMenu} from '~/components/MegaMenu';
import {useScrollDirection} from '~/hooks/useScrollDirection';
import {cn} from '~/lib/utils';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

/**
 * Sticky site header with a transparent-to-solid scroll transition, a desktop
 * mega menu and a mobile drawer trigger. Token-driven and accessible.
 */
export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const {scrolled, direction} = useScrollDirection();
  const {open} = useAside();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-colors duration-300 ease-[var(--ease-premium)]',
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-background',
        scrolled && direction === 'down' && '-translate-y-full',
        scrolled && direction === 'up' && 'translate-y-0',
      )}
      style={{
        transitionProperty: 'transform, border-color, background-color',
        transitionDuration: '300ms',
        transitionTimingFunction: 'var(--ease-premium)',
      }}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <button
          type="button"
          className="-ml-2 flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label="Open menu"
          onClick={() => open('mobile')}
        >
          <MenuIcon className="size-5" />
        </button>

        <MegaMenu
          menu={menu}
          primaryDomainUrl={shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
          className="ml-6 hidden lg:flex"
        />

        <NavLink
          prefetch="intent"
          to="/"
          end
          className="flex items-center text-lg font-semibold tracking-tight"
        >
          <Image
            className="max-h-8 w-auto object-contain"
            src={shop.brand?.logo?.image?.url}
            alt={shop.name}
            sizes="(min-width: 45em) 25vw, 100vw"
          />
        </NavLink>

        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </Container>
    </header>
  );
}

/** Imperatively open an aside without prop drilling the context call. */
function useAsideOpen(type: 'mobile' | 'search' | 'cart') {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {open} = useAside();
  open(type);
}

/** Account, search and cart actions. */
function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {open} = useAside();

  return (
    <nav
      className="flex items-center gap-0.5"
      role="navigation"
      aria-label="Account, search and cart"
    >
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        aria-label="Search"
        onClick={() => open('search')}
      >
        <SearchIcon className="size-5" />
      </button>

      <NavLink
        prefetch="intent"
        to="/account"
        aria-label="Account"
        className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
      >
        <Suspense fallback={<UserIcon className="size-5" />}>
          <Await
            resolve={isLoggedIn}
            errorElement={<UserIcon className="size-5" />}
          >
            {() => <UserIcon className="size-5" />}
          </Await>
        </Suspense>
      </NavLink>

      <CartToggle cart={cart} />
    </nav>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      type="button"
      className="relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <ShoppingBagIcon className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[0.625rem] font-semibold text-brand-foreground tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}
