import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import {ArrowRightIcon} from 'lucide-react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';

import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {MobileMenu} from '~/components/MegaMenu';
import {CartMain} from '~/components/CartMain';
import {AnnouncementBar} from '~/components/AnnouncementBar';
import {Input} from '~/components/ui/input';
import {Button} from '~/components/ui/button';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

/**
 * Global page shell: announcement bar, sticky header, slide-over asides
 * (cart, search, mobile menu) and the footer. Wraps every route's content.
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <AnnouncementBar />
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main id="main" className="flex min-h-[60vh] flex-col">
        {children}
      </main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="Cart">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading cart…</p>}>
        <Await resolve={cart}>
          {(cart) => <CartMain cart={cart} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="Search">
      <div className="flex flex-col gap-6">
        <SearchFormPredictive className="flex gap-2">
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <Input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search products…"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                className="h-11 flex-1 rounded-full"
                aria-label="Search"
              />
              <Button
                type="button"
                onClick={goToSearch}
                className="h-11 rounded-full px-5"
              >
                Search
              </Button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return (
                <p className="text-sm text-muted-foreground">Searching…</p>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-brand"
                  >
                    View all results for &ldquo;{term.current}&rdquo;
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  if (!header.shop.primaryDomain?.url) return null;

  return (
    <Aside type="mobile" heading="Menu" side="left">
      <MobileMenu
        menu={header.menu}
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside>
  );
}
