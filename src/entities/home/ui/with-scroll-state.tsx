'use client';

import { useState, useCallback, useRef, useEffect, ComponentType } from 'react';
import { CarouselApi } from '@/shared/ui/carousel';

export interface WithScrollStateProps {
  api: CarouselApi | null;
  setApi: (api: CarouselApi | null) => void;
  scrollProgress: number;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  scrollbarTrackRef: React.RefObject<HTMLDivElement | null>;
  handleDrag: (clientX: number) => void;
  thumbWidth?: number;
}

export const withScrollState = <P extends object>(
  WrappedComponent: ComponentType<P & WithScrollStateProps>,
): React.FC<P> => {
  const WithScrollState: React.FC<P> = (props) => {
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrollbarTrackRef = useRef<HTMLDivElement>(null);

    const onScroll = useCallback((emblaApi: CarouselApi) => {
      if (!emblaApi) return;
      const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
      setScrollProgress(progress * 100);
    }, []);

    const handleDrag = useCallback(
      (clientX: number) => {
        if (!api || !scrollbarTrackRef.current) return;

        const track = scrollbarTrackRef.current;
        const rect = track.getBoundingClientRect();
        const percentage = Math.max(
          0,
          Math.min(1, (clientX - rect.left) / rect.width),
        );

        const snapList = api.scrollSnapList();
        const targetIndex = Math.round(percentage * (snapList.length - 1));

        api.scrollTo(targetIndex);
      },
      [api],
    );

    useEffect(() => {
      if (!isDragging) return;
      const onMouseMove = (e: MouseEvent) => handleDrag(e.clientX);
      const onTouchMove = (e: TouchEvent) => handleDrag(e.touches[0].clientX);
      const onEnd = () => setIsDragging(false);

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onEnd, { passive: true });

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onEnd);
      };
    }, [isDragging, handleDrag]);

    useEffect(() => {
      if (!api) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      onScroll(api);
      api.on('scroll', onScroll).on('reInit', onScroll);
    }, [api, onScroll]);

    return (
      <WrappedComponent
        {...props}
        api={api}
        setApi={setApi}
        scrollProgress={scrollProgress}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        scrollbarTrackRef={scrollbarTrackRef}
        handleDrag={handleDrag}
        thumbWidth={25}
      />
    );
  };
  WithScrollState.displayName = `WithScrollState(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithScrollState;
};
