import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';

import {Price} from '~/components/Price';
import {ProductImage} from '~/components/ProductImage';
import {ProductGallery, type GalleryImage} from '~/components/ProductGallery';
import {ProductForm} from '~/components/ProductForm';
import {SeriesProductsSlider} from '~/components/SeriesProductsSlider';
import {Container} from '~/components/Container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {Badge} from '~/components/ui/badge';
import {SeoJsonLd} from '~/components/SeoJsonLd';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {buildMeta, productJsonLd, breadcrumbJsonLd} from '~/lib/seo';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  return buildMeta({
    title: product?.seo?.title || product?.title,
    description:
      product?.seo?.description || product?.description?.slice(0, 160),
    url: product ? `/products/${product.handle}` : undefined,
    image: product?.selectedOrFirstAvailableVariant?.image?.url,
    type: 'product',
  });
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const seriesValue = product?.metafield?.value;

  const seriesProducts = seriesValue
    ? await storefront.query(SERIES_PRODUCTS_QUERY, {
        variables: {series: seriesValue, first: 12},
      })
    : null;

  return {
    product,
    seriesProducts,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product, seriesProducts} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, description, vendor} = product;
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const onSale =
    compareAtPrice &&
    price &&
    Number(compareAtPrice.amount) > Number(price.amount);

  // Build the gallery from product media, falling back to the variant image.
  const galleryImages: GalleryImage[] = product.images?.nodes?.length
    ? product.images.nodes
    : selectedVariant?.image
      ? [selectedVariant.image]
      : [];

  return (
    <Container className="py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {galleryImages.length > 0 ? (
          <ProductGallery images={galleryImages} title={title} />
        ) : (
          <ProductImage image={selectedVariant?.image} />
        )}

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-col gap-3">
            {vendor && (
              <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {vendor}
              </span>
            )}
            <h1 className="text-[length:var(--text-title)] leading-[var(--text-title--line-height)] font-semibold tracking-[var(--text-title--letter-spacing)]">
              {title}
            </h1>

            <div className="flex items-center gap-3">
              <Price price={price} compareAtPrice={compareAtPrice} size="lg" />
              {!selectedVariant?.availableForSale && <Badge className='bg-black text-white text-sm px-3 py-2' variant="muted">OUT OF STOCK</Badge>}
              {onSale && <Badge className='text-sm px-3 py-2' variant="destructive">SALE</Badge>}
            </div>
          </div>
          {seriesProducts?.products?.nodes?.length > 0 && (
            <SeriesProductsSlider
              seriesProducts={seriesProducts}
              currentProduct={{
                id: product.id,
                title: product.title,
                handle: product.handle,
                availableForSale: product.availableForSale,
                featuredImage:
                  selectedVariant?.image ?? product.images?.nodes?.[0] ?? null,
              }}
            />
          )}

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />

          {description && (
            <Accordion
              type="single"
              collapsible
              defaultValue="description"
              className="w-full"
            >
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping &amp; returns</AccordionTrigger>
                <AccordionContent>
                  Free standard shipping on orders over $75. Easy 30-day returns
                  on all unworn items.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>

      <SeoJsonLd
        data={[
          productJsonLd({
            name: title,
            description: description ?? undefined,
            image: selectedVariant?.image?.url,
            url: `/products/${product.handle}`,
            brand: vendor || undefined,
            sku: selectedVariant?.sku ?? undefined,
            price: price?.amount,
            currency: price?.currencyCode,
            availability: selectedVariant?.availableForSale,
          }),
          breadcrumbJsonLd([
            {name: 'Home', url: '/'},
            {name: 'Products', url: '/collections/all'},
            {name: title, url: `/products/${product.handle}`},
          ]),
        ]}
      />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </Container>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    availableForSale
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 8) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    metafield(namespace: "custom", key: "series") {
      value
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const SERIES_PRODUCTS_QUERY = `#graphql
  query SeriesProducts($series: String!, $first: Int!) {
    products(first: $first, query: $series) {
      nodes {
        id
        title
        handle
        availableForSale
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
` as const;
