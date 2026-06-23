import {XIcon} from 'lucide-react';
import {useLoaderData, useSearchParams} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';

import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/ProductCard';
import {Container} from '~/components/Container';
import {SeoJsonLd} from '~/components/SeoJsonLd';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {FilterDrawer} from '~/components/FilterDrawer';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {buildMeta, breadcrumbJsonLd} from '~/lib/seo';

interface ActiveFilter {
  input: string;
  label: string;
}

export const meta: Route.MetaFunction<typeof loader> = ({data}: {data: Awaited<ReturnType<typeof loader>> | undefined}) => {
  const collection = data?.collection;
  return buildMeta({
    title: collection?.seo?.title || collection?.title,
    description: collection?.seo?.description || collection?.description,
    url: collection ? `/collections/${collection.handle}` : undefined,
    image: collection?.image?.url,
  });
};

export async function loader(args: Route.LoaderArgs) {
  const {handle, filters, rawFilters} = parseUrlFilters(args.request.url);

  const paginationVariables = getPaginationVariables(args.request, {
    pageBy: 8,
  });

  console.log('SELECTED FILTER INPUTS', rawFilters);

  const collection = await args.context.storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      ...paginationVariables,
      filters: filters.length > 0 ? filters : undefined,
    },
  });

  if (!collection?.collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(args.request, {
    handle,
    data: collection.collection,
  });

  return {
    collection: collection.collection,
    activeFilters: rawFilters.map((f) => ({
      input: f,
      label: decodeFilterInput(f),
    })),
  };
}

export default function Collection() {
  const {collection, activeFilters} = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedFilters = getSelectedFiltersFromUrl(searchParams);

  const onFilterChange = (filterInput: string) => {
    const current = getSelectedFiltersFromUrl(searchParams);
    const exists = current.includes(filterInput);
    const next = exists
      ? current.filter((f) => f !== filterInput)
      : [...current, filterInput];
    setSearchParams(buildSearchParams(searchParams, next), {
      preventScrollReset: true,
    });
  };

  const removeFilter = (input: string) => {
    const current = getSelectedFiltersFromUrl(searchParams);
    setSearchParams(
      buildSearchParams(searchParams, current.filter((f) => f !== input)),
      {preventScrollReset: true},
    );
  };

  const clearAllFilters = () => {
    setSearchParams(buildSearchParams(searchParams, []), {
      preventScrollReset: true,
    });
  };

  return (
    <Container className="py-10 lg:py-16">
      <header className="flex flex-col gap-4 border-b border-border">
        <Breadcrumbs
          items={[
            {name: collection.title, url: `/collections/${collection.handle}`},
          ]}
        />

        <div className="flex flex-wrap items-center gap-4">
          <FilterDrawer
            filters={
              collection.products.filters?.map((f: any) => ({
                id: f.id,
                label: f.label,
                values:
                  f.values?.map((v: any) => ({
                    id: v.id,
                    label: v.label,
                    count: v.count,
                    input: v.input,
                  })) ?? [],
              })) ?? []
            }
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
          />

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={filter.input}
                  onClick={() => removeFilter(filter.input)}
                  className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground px-3 py-1 text-sm text-background transition-colors hover:bg-foreground/80"
                >
                  {filter.label}
                  <XIcon className="h-3 w-3" />
                </button>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </header>

      <PaginatedResourceSection<ProductItemFragment>
        connection={collection.products}
        sortByAvailability
      >
        {({node: product, index}) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : 'lazy'}
          />
        )}
      </PaginatedResourceSection>

      <SeoJsonLd
        data={breadcrumbJsonLd([
          {name: 'Home', url: '/'},
          {name: collection.title, url: `/collections/${collection.handle}`},
        ])}
      />

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </Container>
  );
}

/**
 * Decode filter input JSON into a human-readable label for display.
 */
function decodeFilterInput(input: string): string {
  try {
    const parsed = JSON.parse(input) as Record<string, unknown>;
    if (parsed.taxonomyMetafield) {
      const tm = parsed.taxonomyMetafield as {namespace: string; key: string; value: string};
      const shortKey = tm.key.split('.').pop() ?? tm.key;
      return `${shortKey}: ${tm.value.split('/').pop()}`;
    }
    if (parsed.productMetafield) {
      const pm = parsed.productMetafield as {namespace: string; key: string; value: string};
      return `${pm.namespace}.${pm.key} = ${pm.value}`;
    }
    if (parsed.variantOption) {
      const vo = parsed.variantOption as {name: string; value: string};
      return `${vo.name}: ${vo.value}`;
    }
    if (typeof parsed.productType === 'string') return `Type: ${parsed.productType}`;
    if (typeof parsed.productVendor === 'string') return `Vendor: ${parsed.productVendor}`;
    if (typeof parsed.tag === 'string') return `Tag: ${parsed.tag}`;
    if (typeof parsed.available === 'boolean') {
      return parsed.available ? 'In stock' : 'Out of stock';
    }
    return input;
  } catch {
    return input;
  }
}

// ── URL serialization ──────────────────────────────────────────────────────────

function getSelectedFiltersFromUrl(searchParams: URLSearchParams): string[] {
  try {
    const raw = searchParams.get('filters');
    if (!raw) return [];
    return JSON.parse(decodeURIComponent(raw)) as string[];
  } catch {
    return [];
  }
}

function buildSearchParams(
  current: URLSearchParams,
  selectedFilters: string[],
): URLSearchParams {
  const next = new URLSearchParams();
  const preserve = ['sort', 'page'];
  preserve.forEach((key) => {
    const val = current.get(key);
    if (val) next.set(key, val);
  });
  if (selectedFilters.length > 0) {
    next.set('filters', encodeURIComponent(JSON.stringify(selectedFilters)));
  }
  return next;
}

// ── Loader helpers ────────────────────────────────────────────────────────────

type ProductFilterInput = Record<string, unknown>;

function parseUrlFilters(urlStr: string): {
  handle: string;
  filters: ProductFilterInput[];
  rawFilters: string[];
} {
  const url = new URL(urlStr);
  const handle = url.pathname.split('/').pop() ?? '';

  const filters: ProductFilterInput[] = [];
  const rawFilters: string[] = [];
  try {
    const raw = url.searchParams.get('filters');
    if (raw) {
      const selectedInputs: string[] = JSON.parse(decodeURIComponent(raw));
      console.log('PRODUCT FILTERS SENT', JSON.stringify(selectedInputs, null, 2));
      selectedInputs.forEach((input: string) => {
        rawFilters.push(input);
        filters.push(JSON.parse(input) as ProductFilterInput);
      });
    }
  } catch (e) {
    console.error('Failed to parse filters from URL', e);
  }

  return {handle, filters, rawFilters};
}

// ── GraphQL ───────────────────────────────────────────────────────────────────

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        id
        url
        altText
        width
        height
      }
      seo {
        title
        description
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
        filters {
          id
          label
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  }
` as const;
