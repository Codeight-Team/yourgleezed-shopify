import {Section} from '~/components/Section';
import {CollectionCard} from '~/components/CollectionCard';
import type {CollectionFragment} from 'storefrontapi.generated';

type FeaturedCollection = Pick<
  CollectionFragment,
  'id' | 'title' | 'handle' | 'image'
>;

interface FeaturedCollectionsProps {
  collections: FeaturedCollection[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

/**
 * Editorial grid of collection tiles for the homepage. Renders nothing when
 * no collections are available.
 */
export function FeaturedCollections({
  collections,
  eyebrow = 'Explore',
  title = 'Shop by collection',
  description,
}: FeaturedCollectionsProps) {
  if (!collections.length) return null;

  return (
    <Section eyebrow={eyebrow} title={title} description={description}>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </Section>
  );
}
