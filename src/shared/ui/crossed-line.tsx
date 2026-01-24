import React from 'react';

export const CrossedLine = () => (
  <svg
    className="absolute top-0 left-0 w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <line
      x1="0"
      y1="100"
      x2="100"
      y2="0"
      stroke="black"
      strokeWidth="1"
    />
  </svg>
);
