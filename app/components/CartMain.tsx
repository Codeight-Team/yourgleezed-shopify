import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {ShoppingBagIcon} from 'lucide-react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from '~/components/CartSummary';
import {Button} from '~/components/ui/button';
import {cn} from '~/lib/utils';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};

/** Returns a map of all line items and their children. */
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

/**
 * The main cart UI, shared by the `/cart` route and the cart drawer.
 * Applies optimistic updates so quantity/remove actions feel instant.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  if (!linesCount) {
    return <CartEmpty layout={layout} />;
  }

  return (
    <section
      className={cn(
        'flex flex-col',
        layout === 'page' &&
          'gap-10 lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-16',
        layout === 'aside' && 'h-full',
      )}
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
    >
      <div className={cn(layout === 'aside' && 'flex flex-1 flex-col')}>
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <ul aria-labelledby="cart-lines" className="divide-y divide-border">
          {(cart?.lines?.nodes ?? []).map((line) => {
            if (
              'parentRelationship' in line &&
              line.parentRelationship?.parent
            ) {
              return null;
            }
            return (
              <CartLineItem
                key={line.id}
                line={line}
                layout={layout}
                childrenMap={childrenMap}
              />
            );
          })}
        </ul>
      </div>
      {cartHasItems && <CartSummary cart={cart} layout={layout} />}
    </section>
  );
}

function CartEmpty({layout}: {layout: CartMainProps['layout']}) {
  const {close} = useAside();
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 py-16 text-center',
        layout === 'aside' && 'h-full',
      )}
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-muted">
        <ShoppingBagIcon className="size-7 text-muted-foreground" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">Your cart is empty</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Looks like you haven&rsquo;t added anything yet. Let&rsquo;s find
          something you&rsquo;ll love.
        </p>
      </div>
      <Button asChild size="lg" className="rounded-full px-8" onClick={close}>
        <Link to="/collections" prefetch="viewport">
          Continue shopping
        </Link>
      </Button>
    </div>
  );
}
