import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';

import type {CartLayout} from '~/components/CartMain';
import {Input} from '~/components/ui/input';
import {Button} from '~/components/ui/button';
import {Separator} from '~/components/ui/separator';
import {cn} from '~/lib/utils';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

/**
 * Cart totals, discount and gift-card forms, and the checkout CTA. On the
 * cart page it becomes a sticky sidebar; in the drawer it pins to the bottom.
 */
export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div
      aria-labelledby={summaryId}
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-border bg-muted/30 p-6',
        layout === 'page' && 'lg:sticky lg:top-24',
        layout === 'aside' && 'mt-6',
      )}
    >
      <h2 id={summaryId} className="text-sm font-semibold tracking-wide uppercase">
        Order summary
      </h2>

      <dl className="flex items-center justify-between text-sm">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-medium tabular-nums">
          {cart?.cost?.subtotalAmount?.amount ? (
            /* withoutTrailingZeros prevents locale mismatch between SSR (id-ID) and
            client hydration (en) which would cause "Text content did not match". */
            <Money data={cart.cost.subtotalAmount} withoutTrailingZeros />
          ) : (
            '—'
          )}
        </dd>
      </dl>

      <Separator />

      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountsHeadingId={discountsHeadingId}
        discountCodeInputId={discountCodeInputId}
      />
      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
      />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />

      <p className="text-center text-xs text-muted-foreground">
        Shipping &amp; taxes calculated at checkout.
      </p>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <Button asChild size="lg" className="h-12 w-full rounded-full">
      <a href={checkoutUrl} target="_self">
        Continue to checkout
      </a>
    </Button>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts" className="flex flex-col gap-2">
      {codes.length > 0 && (
        <UpdateDiscountForm>
          <div
            className="flex items-center justify-between gap-2 text-sm"
            role="group"
            aria-labelledby={discountsHeadingId}
          >
            <span id={discountsHeadingId} className="text-muted-foreground">
              Discount(s)
            </span>
            <div className="flex items-center gap-2">
              <code className="font-medium">{codes.join(', ')}</code>
              <button
                type="submit"
                aria-label="Remove discount"
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
          </div>
        </UpdateDiscountForm>
      )}

      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <Input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="h-10"
          />
          <Button type="submit" variant="outline" className="h-10">
            Apply
          </Button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const removeButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousCardIdsRef = useRef<string[]>([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (giftCardAddFetcher.data && giftCardCodeInput.current) {
      giftCardCodeInput.current.value = '';
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId: string) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label="Gift cards" className="flex flex-col gap-2">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl className="flex flex-col gap-1.5 text-sm">
          <dt id={giftCardHeadingId} className="text-muted-foreground">
            Applied gift card(s)
          </dt>
          {giftCardCodes.map((giftCard) => (
            <dd
              key={giftCard.id}
              className="flex items-center justify-between gap-2"
            >
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el) => {
                  if (el) removeButtonRefs.current.set(giftCard.id, el);
                  else removeButtonRefs.current.delete(giftCard.id);
                }}
              >
                <code>***{giftCard.lastCharacters}</code>
                <Money data={giftCard.amountUsed} withoutTrailingZeros />
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="flex gap-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <Input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="h-10"
          />
          <Button
            type="submit"
            variant="outline"
            className="h-10"
            disabled={giftCardAddFetcher.state !== 'idle'}
          >
            Apply
          </Button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}: {
  giftCardId: string;
  lastCharacters: string;
  children: React.ReactNode;
  onRemoveClick?: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{giftCardCodes: [giftCardId]}}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="flex items-center gap-2">{children}</span>
        <button
          type="submit"
          aria-label={`Remove gift card ending in ${lastCharacters}`}
          onClick={onRemoveClick}
          ref={buttonRef}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          Remove
        </button>
      </div>
    </CartForm>
  );
}
