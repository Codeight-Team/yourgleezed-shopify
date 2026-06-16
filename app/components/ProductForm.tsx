import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import type {ProductFragment} from 'storefrontapi.generated';

import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {cn} from '~/lib/utils';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="flex flex-col gap-6">
      {productOptions.map((option) => {
        // Hide options that only have a single value.
        if (option.optionValues.length === 1) return null;

        return (
          <div className="flex flex-col gap-3" key={option.name}>
            <span className="text-sm font-medium">{option.name}</span>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const optionClass = cn(
                  'inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all',
                  selected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground',
                  !available && 'opacity-40',
                );

                if (isDifferentProduct) {
                  return (
                    <Link
                      className={optionClass}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      aria-current={selected}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                }

                return (
                  <button
                    type="button"
                    className={optionClass}
                    key={option.name + name}
                    disabled={!exists}
                    aria-pressed={selected}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    <ProductOptionSwatch swatch={swatch} name={name} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <AddToCartButton
        className="h-12 w-full rounded-full"
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <span>{name}</span>;

  return (
    <span
      aria-label={name}
      className="size-6 overflow-hidden rounded-full ring-1 ring-foreground/10"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && (
        <img src={image} alt={name} className="size-full object-cover" />
      )}
    </span>
  );
}
