import type {Route} from './+types/about';

import {Hero} from '~/components/Hero';
import {Section} from '~/components/Section';
import {PromoBanner} from '~/components/PromoBanner';
import {Newsletter} from '~/components/Newsletter';
import {buildMeta} from '~/lib/seo';
import {BRAND} from '~/lib/constants';

export const meta: Route.MetaFunction = () => {
  return buildMeta({
    title: 'About',
    description: `Learn the story behind ${BRAND.name} — our craft, our materials and our commitment to lasting design.`,
    url: '/about',
  });
};

const VALUES = [
  {
    title: 'Considered design',
    body: 'Every product begins with a problem worth solving. We obsess over the details others overlook.',
  },
  {
    title: 'Built to last',
    body: 'We choose premium materials and durable construction so your purchase stays with you for years.',
  },
  {
    title: 'Responsibly made',
    body: 'We partner with ethical manufacturers and minimize waste across our supply chain.',
  },
];

export default function About() {
  return (
    <div className="flex flex-col">
      <Hero
        eyebrow="Our story"
        title="Designed with intention."
        subtitle={`${BRAND.name} was founded on a simple belief: that everyday objects deserve extraordinary care.`}
        theme="dark"
      />

      <Section
        eyebrow="What we stand for"
        title="Principles that guide everything we make"
        centered
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="flex flex-col gap-3 rounded-2xl border border-border p-8"
            >
              <h3 className="text-lg font-semibold">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <PromoBanner
        eyebrow="The craft"
        title="Obsessed with the details"
        description="From first sketch to final stitch, we sweat the small stuff so you don't have to. The result is product that simply works — and keeps working."
        cta={{label: 'Shop the collection', to: '/collections/all'}}
        imageSide="left"
      />

      <Newsletter />
    </div>
  );
}
