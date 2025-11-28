import * as React from 'react';

const PlaceHolderLine = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 550 5"
    className={className}
  >
    <rect width="550" height="5" fill="#D9D9D9" rx="1"></rect>
  </svg>
);

export default PlaceHolderLine;
