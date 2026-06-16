import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {MinusIcon, PlusIcon, Trash2Icon} from 'lucide-react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {useVariantUrl} from '~/lib/variants';
import {Price} from '~/components/Price';
import {useAside} from '~/components/Aside';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single cart line: image, title, options, price and quantity controls.
 * Nested component lines (warranties, gift wrapping) render below the parent.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  // Filter out default single-option titles for cleaner display.
  const visibleOptions = selectedOptions.filter(
    (option) => option.value !== 'Default Title',
  );

  return (
    <li className="py-5">
      <div className="flex gap-4">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => layout === 'aside' && close()}
          className="shrink-0"
        >
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={96}
              loading="lazy"
              width={96}
              className="size-24 rounded-lg object-cover ring-1 ring-foreground/5"
            />
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Link
                prefetch="intent"
                to={lineItemUrl}
                onClick={() => layout === 'aside' && close()}
                className="text-sm font-medium hover:text-brand"
              >
                {product.title}
              </Link>
              {visibleOptions.length > 0 && (
                <ul className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                  {visibleOptions.map((option) => (
                    <li key={option.name}>
                      {option.name}: {option.value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Price price={line?.cost?.totalAmount} size="sm" />
          </div>

          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div className="mt-3 ml-28">
          <p id={childrenLabelId} className="sr-only">
            Line items bundled with {product.title}
          </p>
          <ul
            aria-labelledby={childrenLabelId}
            className="divide-y divide-border border-l pl-4"
          >
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Quantity stepper + remove control for a cart line. Disabled while an
 * optimistic update is in flight.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="mt-auto flex items-center justify-between gap-3">
      <div className="inline-flex items-center rounded-full border border-border">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            type="submit"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            className="flex size-9 items-center justify-center rounded-l-full text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <MinusIcon className="size-4" />
          </button>
        </CartLineUpdateButton>
        <span className="min-w-9 text-center text-sm font-medium tabular-nums">
          {quantity}
        </span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            type="submit"
            aria-label="Increase quantity"
            disabled={!!isOptimistic}
            className="flex size-9 items-center justify-center rounded-r-full text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <PlusIcon className="size-4" />
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        aria-label="Remove item"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      >
        <Trash2Icon className="size-3.5" />
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique fetcher key per affected line so rapid increment/decrement
 * actions cancel each other instead of running concurrently.
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
