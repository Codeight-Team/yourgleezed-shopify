import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections._index';
import {getPaginationVariables} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';

import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {CollectionCard} from '~/components/CollectionCard';
import {Container} from '~/components/Container';
import {buildMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'Collections',
    description: 'Browse all collections.',
    url: '/collections',
  });
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <Container className="py-10 lg:py-16">
      <header className="mb-10 flex flex-col gap-4 border-b border-border pb-10">
        <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Explore
        </span>
        <h1 className="text-[length:var(--text-headline)] leading-[var(--text-headline--line-height)] font-semibold tracking-[var(--text-headline--letter-spacing)]">
          Collections
        </h1>
      </header>

      <PaginatedResourceSection<CollectionFragment>
        connection={collections}
        resourcesClassName="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {({node: collection, index}) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        )}
      </PaginatedResourceSection>
    </Container>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
