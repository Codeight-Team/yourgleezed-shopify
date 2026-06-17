import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';
import {Image} from '@shopify/hydrogen';

interface CarouselImageNode {
  id: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  };
}

interface MetaobjectField {
  key: string;
  references?: {nodes: CarouselImageNode[]} | null;
}

interface CarouselMetaobject {
  fields?: MetaobjectField[] | null;
}

/**
 * Full-bleed homepage hero slideshow driven by a Shopify metaobject.
 * Renders nothing when no images have been configured in the Admin.
 */
export function Slideshow({
  carouselData,
}: {
  carouselData: CarouselMetaobject | null | undefined;
}) {
  const carouselImages: CarouselImageNode[] =
    carouselData?.fields?.find((field) => field.key === 'foto')?.references
      ?.nodes ?? [];

  if (carouselImages.length === 0) {
    return null;
  }

  return (
    <div className='lg:p-10 p-5'>
      <Carousel className="w-full overflow-hidden" opts={{loop: true}}>
        <CarouselContent className="ml-0">
          {carouselImages.map((node, index) => {
            const img = node.image;
            if (!img) return null;

            return (
              <CarouselItem key={node.id || index} className="pl-0 ">
                <div className="relative w-full h-auto max-h-[80vh] flex items-center justify-center bg-gray-100">
                  <Image
                    data={img}
                    // sizes="100vw"
                    className="w-full h-auto object-contain"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-4 size-11 border-none bg-white/80 text-foreground backdrop-blur hover:bg-white md:left-8" />
        <CarouselNext className="right-4 size-11 border-none bg-white/80 text-foreground backdrop-blur hover:bg-white md:right-8" />
      </Carousel>
    </div>
  );
}
