import * as React from 'react';

import {Card, CardContent} from '../components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import {Image} from '@shopify/hydrogen';

interface CarouselImageNode {
  id: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  };
}

export function Slideshow({carouselData}: {carouselData: any}) {
  console.log('Carousel Data:', carouselData);

  const carouselImages: CarouselImageNode[] =
    carouselData?.fields?.find((f: any) => f.key === 'foto')?.references
      ?.nodes || [];

  // Jika admin belum mengunggah gambar apa pun di Shopify Admin, carousel tidak akan tampil
  if (carouselImages.length === 0) {
    return null;
  }

  return (
    <Carousel className="w-full overflow-hidden">
      <CarouselContent>
        {carouselImages.map((node, index) => {
          const img = node.image;
          if (!img) return null;

          return (
            <CarouselItem key={node.id || index} className="p-0">
              <div className="">
                <Card className="overflow-hidden border-none rounded-none shadow-none p-0">
                  {/* Responsif: mobile -> kecil, lg -> viewport dikurangi header */}
                  <CardContent className="relative flex items-center justify-center w-full shadow-none border-none rounded-none p-0 h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[calc(100vh-var(--site-header-height,64px))]">
                    {/* Menggunakan komponen Image bawaan Hydrogen untuk optimasi otomatis oleh CDN Shopify */}
                    <Image
                      data={img}
                      sizes="100vw"
                      className="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      {/* Absolute positioned chevrons inside the card content */}
      <CarouselPrevious className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-foreground bg-transparent hover:bg-transparent p-2 md:p-3 shadow-none ring-0 focus:outline-none [&_svg]:h-5 [&_svg]:w-5 md:[&_svg]:h-6 md:[&_svg]:w-6" />
      <CarouselNext className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 text-foreground bg-transparent hover:bg-transparent p-2 md:p-3 shadow-none ring-0 focus:outline-none [&_svg]:h-5 [&_svg]:w-5 md:[&_svg]:h-6 md:[&_svg]:w-6" />
    </Carousel>
  );
}
