import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">Articles</h2>
      <div className="flex flex-col gap-2">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div key={article.id}>
              <Link
                prefetch="intent"
                to={articleUrl}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">Pages</h2>
      <div className="flex flex-col gap-2">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div key={page.id}>
              <Link
                prefetch="intent"
                to={pageUrl}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-10">
      <h2 className="mb-6 text-lg font-semibold">Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <Link
                prefetch="intent"
                to={productUrl}
                key={product.id}
                className="group flex flex-col gap-3"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5">
                  {image && (
                    <Image
                      data={image}
                      alt={product.title}
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="size-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium group-hover:text-brand">
                    {product.title}
                  </p>
                  <small className="text-sm text-muted-foreground">
                    {price && <Money data={price} />}
                  </small>
                </div>
              </Link>
            );
          });

          return (
            <div className="flex flex-col gap-8">
              <div className="flex justify-center">
                <PreviousLink className="text-sm text-muted-foreground hover:text-foreground">
                  {isLoading ? 'Loading…' : <span>↑ Load previous</span>}
                </PreviousLink>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                {ItemsMarkup}
              </div>
              <div className="flex justify-center">
                <NextLink className="text-sm text-muted-foreground hover:text-foreground">
                  {isLoading ? 'Loading…' : <span>Load more ↓</span>}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <p className="py-16 text-center text-muted-foreground">
      No results, try a different search.
    </p>
  );
}
