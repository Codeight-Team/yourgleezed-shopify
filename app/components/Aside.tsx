import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

const AsideContext = createContext<AsideContextValue | null>(null);

/**
 * A premium slide-over panel built on the shadcn Sheet (Radix Dialog).
 * Keeps the original `useAside` context API so existing callers
 * (header, cart, search, mobile menu) continue to work unchanged.
 *
 * @example
 * <Aside type="cart" heading="Cart">...</Aside>
 */
export function Aside({
  children,
  heading,
  type,
  side = 'right',
}: {
  children?: ReactNode;
  type: AsideType;
  heading: ReactNode;
  side?: 'left' | 'right';
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  return (
    <Sheet open={expanded} onOpenChange={(open) => (open ? null : close())}>
      <SheetContent
        side={side}
        className="w-full sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>{heading}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
