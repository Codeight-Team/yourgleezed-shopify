import {cn} from '~/lib/utils';

interface AnnouncementBarProps {
  messages?: string[];
  className?: string;
}

const DEFAULT_MESSAGES = [
  'Free shipping on orders over $75',
  'Easy 30-day returns',
  'Members get early access to new drops',
];

/**
 * Slim marquee announcement bar shown above the header. Duplicates its content
 * once so the CSS marquee animation can loop seamlessly.
 */
export function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
  className,
}: AnnouncementBarProps) {
  if (!messages.length) return null;

  const items = [...messages, ...messages];

  return (
    <div
      className={cn(
        'relative flex h-9 items-center overflow-hidden bg-foreground text-background',
        className,
      )}
      role="region"
      aria-label="Announcements"
    >
      <div className="flex w-max animate-[var(--animate-marquee)] items-center gap-12 px-6 whitespace-nowrap will-change-transform hover:[animation-play-state:paused]">
        {items.map((message, index) => (
          <span
            key={index}
            className="text-xs font-medium tracking-wide"
            aria-hidden={index >= messages.length}
          >
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
