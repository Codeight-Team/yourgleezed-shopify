import {useEffect, useMemo, useRef} from 'react';
import {Link} from 'react-router';
import type {SeriesProductsQuery} from 'storefrontapi.generated';

import {ScrollArea, ScrollBar} from '~/components/ui/scroll-area';
import {Badge} from '~/components/ui/badge';
import {cn} from '~/lib/utils';
import {sortSeriesProducts} from '~/lib/products';
import {useVariantUrl} from '~/lib/variants';

type SeriesProductNode = SeriesProductsQuery['products']['nodes'][number];

type SeriesSliderProduct = Pick<
  SeriesProductNode,
  'id' | 'title' | 'handle' | 'availableForSale' | 'featuredImage'
>;

interface SeriesProductsSliderProps {
  seriesProducts: SeriesProductsQuery;
  currentProduct: SeriesSliderProduct;
}

function SeriesProductThumb({
  item,
  isSelected,
}: {
  item: SeriesSliderProduct;
  isSelected: boolean;
}) {
  const productUrl = useVariantUrl(item.handle);
  const isOutOfStock = item.availableForSale === false;
  const image = item.featuredImage;

  const imageBlock = (
    <div
      className={cn(
        'relative aspect-square overflow-hidden rounded-lg bg-muted',
        isSelected && 'ring-2 ring-black',
      )}
    >
      {image?.url ? (
        <img
          src={image.url}
          alt={image.altText || item.title}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      )}
      {isOutOfStock && (
        <>
          <div aria-hidden className="absolute inset-0 bg-neutral-900/35" />
          <div className="absolute inset-0 flex items-center justify-center p-1">
            <Badge
              variant="secondary"
              className="border border-white/20 bg-white/60 px-2 py-1 text-[10px] font-bold tracking-wide text-zinc-600 shadow-sm"
            >
              Out of Stock
            </Badge>
          </div>
        </>
      )}
    </div>
  );

  if (isSelected) {
    return (
      <div className="w-40 shrink-0 cursor-default" aria-current="page">
        {imageBlock}
      </div>
    );
  }

  return (
    <Link
      to={productUrl}
      prefetch="intent"
      preventScrollReset
      replace
      className="w-40 shrink-0"
    >
      {imageBlock}
    </Link>
  );
}

export function SeriesProductsSlider({
  seriesProducts,
  currentProduct,
}: SeriesProductsSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const nodes = seriesProducts.products.nodes;
    const merged = nodes.some((node) => node.id === currentProduct.id)
      ? nodes.map((node) =>
          node.id === currentProduct.id ? {...node, ...currentProduct} : node,
        )
      : [currentProduct, ...nodes];

    return sortSeriesProducts(merged, currentProduct.id);
  }, [seriesProducts, currentProduct]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, {passive: false});
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  if (!items.length) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">Series Products</h2>
      <ScrollArea className="w-full whitespace-nowrap" viewportRef={scrollRef}>
        <div className="flex gap-4 p-1 pb-3">
          {items.map((item) => (
            <SeriesProductThumb
              key={item.id}
              item={item}
              isSelected={item.id === currentProduct.id}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
