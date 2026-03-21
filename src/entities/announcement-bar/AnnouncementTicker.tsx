'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

interface AnnouncementTickerProps {
  text: string;
  className?: string;
}

export function AnnouncementTicker({ text, className }: AnnouncementTickerProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-session-banner'));
  };

  // Repeat text to ensure it fills the width and scrolls infinitely
  const repeatedText = Array(10).fill(text);

  return (
    <div className={className} ref={emblaRef}>
      <div className="flex touch-pan-y cursor-pointer" onClick={handleClick}>
        {repeatedText.map((item, index) => (
          <div
            key={index}
            className="flex-none min-w-0 pr-8 whitespace-nowrap text-sm font-medium"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
