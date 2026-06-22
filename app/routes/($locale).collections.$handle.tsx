import {redirect, useLoaderData} from 'react-router';
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

export const meta: Route.MetaFunction = ({data}) => {
  const collection = data?.collection;
  return buildMeta({
    title: collection?.seo?.title || collection?.title,
    description: collection?.seo?.description || collection?.description,
    url: collection ? `/collections/${collection.handle}` : undefined,
    image: collection?.image?.url,
  });
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load critical data for rendering content above the fold.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/collections');
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const collection = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      ...paginationVariables,
    },
  });

  if (!collection?.collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection.collection});

  return {
    collection: collection.collection,
  };
}

/**
 * Load deferred data for content below the fold.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <Container className="py-10 lg:py-16">
      <header className="flex flex-col gap-4 border-b border-border">
        <Breadcrumbs
          items={[
            {name: collection.title, url: `/collections/${collection.handle}`},
          ]}
        />
        <FilterDrawer
          filters={
            collection.products.filters?.map((f: any) => ({
              id: f.id,
              label: f.label,
              values: f.values.map((v: any) => ({
                label: v.label,
                count: v.count,
              })),
            })) ?? []
          }
        />
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
            label
            count
          }
        }
      }
    }
  }
` as const;
