'use client';
import { Carousel, CarouselContent, CarouselItem } from '@/shared/ui/carousel';

import React from 'react';
import { withScrollState, WithScrollStateProps } from './with-scroll-state';
import { cn } from '@shared/lib/utils';

type CardCarouselProps = {
  children?: React.ReactNode;
  items?: React.ReactNode[];
  scrollable?: boolean;
  loop?: boolean;
  className?: string;
} & WithScrollStateProps;

const CardCarouselBase: React.FC<CardCarouselProps> = ({
  children,
  items,
  scrollable = false,
  setApi,
  scrollProgress,
  setIsDragging,
  scrollbarTrackRef,
  handleDrag,
  thumbWidth = 25,
  loop = false,
  className = '',
}) => {
  return (
    <div className="w-full  space-y-16 select-none ">
      <Carousel opts={{ loop }} setApi={setApi}>
        <CarouselContent>
          {children
            ? children
            : items?.map((item, index) => (
                <CarouselItem className={cn(className)} key={index}>
                  {item}
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
      {scrollable && (
        <div className="w-full">
          <div
            ref={scrollbarTrackRef}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleDrag(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleDrag(e.touches[0].clientX);
            }}
            className="relative h-[0.5px] w-full  cursor-pointer  bg-gray-200"
          >
            <div
              className="absolute h-[3px]  bottom-[0.1px] left-0 bg-black "
              style={{
                width: `${thumbWidth}%`,
                transform: `translateX(${scrollProgress * ((100 - thumbWidth) / thumbWidth)}%)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
CardCarouselBase.displayName = 'CardCarouselBase';
export const CardCarousel = withScrollState(CardCarouselBase);
