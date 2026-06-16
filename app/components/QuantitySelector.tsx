import {MinusIcon, PlusIcon} from 'lucide-react';

import {cn} from '~/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  /** Disable only the decrease control (e.g. at minimum quantity). */
  disableDecrease?: boolean;
  className?: string;
}

/**
 * Accessible +/- quantity stepper. Stateless: the parent owns the value and
 * supplies the increment/decrement handlers (used by cart line items).
 */
export function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  disabled = false,
  disableDecrease = false,
  className,
}: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDecrease}
        disabled={disabled || disableDecrease}
        className="flex size-9 items-center justify-center rounded-l-full text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <MinusIcon className="size-4" />
      </button>
      <span
        className="min-w-9 text-center text-sm font-medium tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onIncrease}
        disabled={disabled}
        className="flex size-9 items-center justify-center rounded-r-full text-foreground transition-colors hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
