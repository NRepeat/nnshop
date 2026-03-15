'use client';

import { usePostHog } from 'posthog-js/react';

type SocialLink = {
  platform: string;
  url: string;
  icon: React.ReactNode;
};

export function FooterSocialLinks({ links }: { links: SocialLink[] }) {
  const posthog = usePostHog();

  return (
    <div className="flex gap-3">
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 border border-white/30 rounded flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
          aria-label={link.platform}
          onClick={() =>
            posthog?.capture('social_link_clicked', { platform: link.platform, url: link.url })
          }
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
