type ProductWithAvailability = {
  availableForSale?: boolean | null;
};

/** Puts in-stock products before sold-out ones while preserving relative order. */
export function sortProductsByAvailability<T extends ProductWithAvailability>(
  products: T[],
): T[] {
  return [...products].sort(
    (a, b) => Number(b.availableForSale ?? false) - Number(a.availableForSale ?? false),
  );
}

/** Selected product first, then in-stock, then sold-out. */
export function sortSeriesProducts<T extends ProductWithAvailability & {id: string}>(
  products: T[],
  selectedId: string,
): T[] {
  const priority = (item: T) => {
    if (item.id === selectedId) return 0;
    if (item.availableForSale) return 1;
    return 2;
  };

  return [...products].sort((a, b) => priority(a) - priority(b));
}
