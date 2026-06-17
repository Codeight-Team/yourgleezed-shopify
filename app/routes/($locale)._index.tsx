import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {FeaturedCollectionFragment} from 'storefrontapi.generated';

import {Slideshow} from '~/components/Slideshow';
import {Hero} from '~/components/Hero';
import {FeaturedCollections} from '~/components/FeaturedCollections';
import {FeaturedProducts} from '~/components/FeaturedProducts';
import {PromoBanner} from '~/components/PromoBanner';
import {Testimonials} from '~/components/Testimonials';
import {Newsletter} from '~/components/Newsletter';
import {MockShopNotice} from '~/components/MockShopNotice';
import {Container} from '~/components/Container';
import {buildMeta} from '~/lib/seo';
import {BRAND} from '~/lib/constants';
import {GET_CAROUSEL_QUERY} from '~/graphql/metaobject/HomepageCarousel';

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.description,
    url: '/',
  });
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Above-the-fold critical data: featured collections grid and the homepage
 * carousel metaobject.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}, carouselResult] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTIONS_QUERY),
    context.storefront
      .query(GET_CAROUSEL_QUERY, {
        variables: {
          handle: 'homepage-carousel-eekzlxh4',
          type: 'homepage_carousel',
        },
      })
      .catch(() => ({metaobject: null})),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollections: collections.nodes,
    carouselData: carouselResult.metaobject,
  };
}

/** Below-the-fold deferred data: recommended products. */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {recommendedProducts};
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const collections = data.featuredCollections ?? [];
  const heroCollection = collections[0] as
    | FeaturedCollectionFragment
    | undefined;
  const promoCollection = collections[1] as
    | FeaturedCollectionFragment
    | undefined;

  return (
    <div className="flex flex-col">
      {/* Prefer the merchandised carousel; fall back to a typographic hero. */}
      {data.carouselData ? (
        <Slideshow carouselData={data.carouselData} />
      ) : (
        <Hero
          eyebrow={BRAND.name}
          title={BRAND.tagline}
          subtitle={BRAND.description}
          primaryCta={{label: 'Shop now', to: '/collections/all'}}
          secondaryCta={{label: 'Explore', to: '/collections'}}
          image={heroCollection?.image}
        />
      )}

      {!data.isShopLinked && (
        <Container className="pt-8">
          <MockShopNotice />
        </Container>
      )}

      <FeaturedCollections
        collections={collections.slice(0, 6)}
        description="Thoughtfully curated edits for every part of your day."
      />

      <FeaturedProducts
        products={data.recommendedProducts}
        title="New arrivals"
        description="The latest additions, engineered to last."
      />

      {promoCollection && (
        <PromoBanner
          eyebrow="Featured"
          title={promoCollection.title}
          description="Discover our most-loved pieces, crafted with premium materials and an obsessive attention to detail."
          cta={{
            label: 'Shop the collection',
            to: `/collections/${promoCollection.handle}`,
          }}
          image={promoCollection.image}
          imageSide="right"
        />
      )}

      <Testimonials />

      <Newsletter />
    </div>
  );
}

const FEATURED_COLLECTIONS_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 6, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
