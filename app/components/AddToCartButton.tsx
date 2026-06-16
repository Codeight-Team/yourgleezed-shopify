import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {Loader2Icon} from 'lucide-react';

import {Button} from '~/components/ui/button';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<unknown>) => {
        const loading = fetcher.state !== 'idle';
        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <Button
              type="submit"
              size="lg"
              onClick={onClick}
              disabled={disabled ?? loading}
              className={className}
            >
              {loading && <Loader2Icon className="animate-spin" />}
              {children}
            </Button>
          </>
        );
      }}
    </CartForm>
  );
}
