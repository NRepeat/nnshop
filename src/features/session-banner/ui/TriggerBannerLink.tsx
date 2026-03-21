'use client';

import React from 'react';

interface TriggerBannerLinkProps {
  displayText: string;
  className?: string;
}

export function TriggerBannerLink({
  displayText,
  className,
}: TriggerBannerLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-session-banner'));
  };

  return (
    <button onClick={handleClick} className={className} aria-label={displayText}>
      <p className="w-full items-center justify-center py-3 text-xl font-400 hidden md:flex">
        {displayText}
      </p>
      <p className="w-full items-center justify-center py-3 text-lg font-400 flex md:hidden">
        {displayText}
      </p>
    </button>
  );
}
