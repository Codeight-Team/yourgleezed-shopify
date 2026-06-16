import {useEffect, useRef, useState} from 'react';

export type ScrollState = {
  /** Current vertical scroll position in pixels. */
  scrollY: number;
  /** True once the user has scrolled past the given threshold. */
  scrolled: boolean;
  /** Direction of the most recent scroll movement. */
  direction: 'up' | 'down';
};

/**
 * Track scroll position and direction. Used to drive the header's
 * transparent-to-solid transition and show/hide behavior.
 */
export function useScrollDirection(threshold = 16): ScrollState {
  const [state, setState] = useState<ScrollState>({
    scrollY: 0,
    scrolled: false,
    direction: 'up',
  });
  const lastY = useRef(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastY.current ? 'down' : 'up';
      lastY.current = scrollY;
      setState({scrollY, scrolled: scrollY > threshold, direction});
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  return state;
}
