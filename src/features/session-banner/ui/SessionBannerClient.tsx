'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CheckIcon, CopyIcon, TagIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@shared/ui/dialog';
import { cn } from '@shared/lib/utils';
import { Link } from '@shared/i18n/navigation';
import { resolveCollectionLink } from '@shared/lib/shopify/resolve-shopify-link';
import { stegaClean } from '@sanity/client/stega';

const STORAGE_KEY = 'session_banner_dismissed_map';

type BannerData = {
  _id: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  title?: string | null;
  description?: string | null;
  discountCode?: string | null;
  actionButton?: {
    label?: string | null;
    url?: string | null;
    womanUrl?: string | null;
    manUrl?: string | null;
    womanCollection?: any;
    manCollection?: any;
  } | null;
  behavior?: {
    trigger?: string | null;
    delaySeconds?: number | null;
    scrollPercent?: number | null;
    cooldownHours?: number | null;
    showOnce?: boolean | null;
    resetToken?: string | null;
  } | null;
};

type DismissalRecord = {
  dismissedAt: number;
  resetToken?: string | null;
};

type DismissalMap = Record<string, DismissalRecord>;

function getDismissalMap(): DismissalMap {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function shouldShow(id: string, behavior: BannerData['behavior']): boolean {
  const map = getDismissalMap();
  const stored = map[id];

  if (!stored) return true;

  const cleanResetToken = stegaClean(behavior?.resetToken);
  const cleanShowOnce = stegaClean(behavior?.showOnce);

  try {
    // If reset token changed in CMS, we show it again for this user
    if (cleanResetToken && stored.resetToken !== cleanResetToken) return true;

    // If "Show once" is active and we have a record (which we do if we are here), don't show
    if (cleanShowOnce) return false;

    const cooldown = (stegaClean(behavior?.cooldownHours) ?? 24) * 60 * 60 * 1000;
    if (cooldown === 0) return true;

    return Date.now() - stored.dismissedAt > cooldown;
  } catch {
    return true;
  }
}

function saveDismissed(id: string, resetToken?: string | null) {
  const map = getDismissalMap();
  map[id] = {
    dismissedAt: Date.now(),
    resetToken: stegaClean(resetToken) ?? null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

type BannerStatus = 'idle' | 'waiting' | 'visible' | 'dismissed' | 'skipped';

export function SessionBannerClient({
  data,
  locale,
  gender,
}: {
  data: BannerData;
  locale: string;
  gender: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<BannerStatus>('idle');
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollHandlerRef = useRef<(() => void) | null>(null);
  const exitHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const behavior = data.behavior;
  const trigger = stegaClean(behavior?.trigger) ?? 'delay';
  const bannerId = data._id;

  useEffect(() => {
    if (!shouldShow(bannerId, behavior)) {
      setStatus('skipped');
      return;
    }

    setStatus('waiting');
    console.log('SessionBanner: Status set to waiting. Trigger:', trigger);

    if (trigger === 'delay') {
      const delaySec = stegaClean(behavior?.delaySeconds) ?? 5;
      const delay = delaySec * 1000;
      console.log(
        'SessionBanner: Delay trigger detected. Delay seconds:',
        delaySec,
      );

      const timer = setTimeout(() => {
        console.log('SessionBanner: Delay reached. Showing banner.');
        setOpen(true);
        setStatus('visible');
      }, delay);

      return () => {
        console.log('SessionBanner: Cleaning up delay timer.');
        clearTimeout(timer);
      };
    }

    if (trigger === 'scroll') {
      const threshold = (stegaClean(behavior?.scrollPercent) ?? 40) / 100;
      const handler = () => {
        const scrolled =
          window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (scrolled >= threshold) {
          setOpen(true);
          setStatus('visible');
          window.removeEventListener('scroll', handler);
        }
      };
      scrollHandlerRef.current = handler;
      window.addEventListener('scroll', handler, { passive: true });
      return () => window.removeEventListener('scroll', handler);
    }

    if (trigger === 'exit_intent') {
      const handler = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setOpen(true);
          setStatus('visible');
          document.removeEventListener('mouseleave', handler);
        }
      };
      exitHandlerRef.current = handler;
      document.addEventListener('mouseleave', handler);
      return () => document.removeEventListener('mouseleave', handler);
    }
  }, [refreshKey, bannerId, trigger, behavior?.resetToken, behavior?.delaySeconds, behavior?.scrollPercent, behavior?.showOnce, behavior?.cooldownHours]);

  useEffect(() => {
    const handleOpenBanner = () => {
      setOpen(true);
      setStatus('visible');
    };

    window.addEventListener('open-session-banner', handleOpenBanner);
    return () => window.removeEventListener('open-session-banner', handleOpenBanner);
  }, []);

  function handleOpenChange(value: boolean) {
    if (!value) {
      saveDismissed(bannerId, behavior?.resetToken);
      setStatus('dismissed');
    }
    setOpen(value);
  }

  async function handleCopy() {
    if (!data.discountCode) return;
    await navigator.clipboard.writeText(data.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusColor: Record<BannerStatus, string> = {
    idle: 'bg-gray-400',
    waiting: 'bg-yellow-400',
    visible: 'bg-green-500',
    dismissed: 'bg-red-400',
    skipped: 'bg-gray-500',
  };

  const actionButton = data.actionButton;
  let resolvedUrl = actionButton?.url || '';

  if (gender === 'woman') {
    if (actionButton?.womanCollection) {
      resolvedUrl =
        resolveCollectionLink(actionButton.womanCollection, locale, gender)
          .handle || resolvedUrl;
    } else if (actionButton?.womanUrl) {
      resolvedUrl = actionButton.womanUrl;
    }
  } else if (gender === 'man') {
    if (actionButton?.manCollection) {
      resolvedUrl =
        resolveCollectionLink(actionButton.manCollection, locale, gender)
          .handle || resolvedUrl;
    } else if (actionButton?.manUrl) {
      resolvedUrl = actionButton.manUrl;
    }
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setOpen(false);
    setStatus('waiting');
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-3 rounded-full bg-black/80 px-4 py-2 text-xs text-white font-mono shadow-lg border border-white/10">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${statusColor[status]}`} />
            banner: {status}
            {status === 'waiting' && trigger === 'delay' && (
              <span className="text-yellow-300">
                ({stegaClean(behavior?.delaySeconds) ?? 5}s)
              </span>
            )}
          </div>
          <button
            onClick={handleReset}
            className="ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors border border-white/20 text-[10px] uppercase tracking-wider"
          >
            Reset
          </button>
        </div>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton
          className="p-0 gap-0 w-[350px]  sm:w-full   sm:max-w-[650px] overflow-hidden rounded border-0"
        >
          <div className="flex flex-col sm:flex-row   sm:min-h-[420px] ">
            {/* Image panel */}
            {data.imageUrl && (
              <div className="relative sm:w-[55%] bg-gradient-to-b from-[#E9EBF3] via-[#F0F2F9] to-[#F7FAFE]  h-[380px] sm:h-[500px]  shrink-0 overflow-hidden">
                <Image
                  src={data.imageUrl}
                  alt={data.imageAlt ?? ''}
                  fill
                  className="object-contain w-full sm:object-cover"
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
            )}

            {/* Content panel */}
            <div className="flex flex-col justify-center gap-6 p-8 sm:p-10 flex-1">
              {/* Text */}
              <div className="flex flex-col gap-3">
                {data.title && (
                  <DialogTitle className="text-2xl font-semibold leading-tight">
                    {data.title}
                  </DialogTitle>
                )}
                {data.description && (
                  <DialogDescription className="text-md text-muted-foreground leading-relaxed">
                    {data.description}
                  </DialogDescription>
                )}
              </div>

              {/* Discount code */}
              {data.discountCode && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 border border-dashed border-border rounded-md px-3 py-2 bg-muted/50">
                    <TagIcon className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-mono font-medium tracking-widest uppercase flex-1">
                      {data.discountCode}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    title="Copy code"
                    className={cn(
                      'flex items-center justify-center size-9 rounded-md border transition-colors shrink-0',
                      copied
                        ? 'bg-green-500/10 border-green-500/30 text-green-600'
                        : 'bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {copied ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              )}

              {/* Action button */}
              {data.actionButton?.label && resolvedUrl && (
                <Link
                  href={resolvedUrl}
                  onClick={() => {
                    saveDismissed(bannerId, behavior?.resetToken);
                    setOpen(false);
                    setStatus('dismissed');
                  }}
                  className="inline-flex items-center justify-center bg-primary text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-neutral-800 transition-colors w-full sm:w-auto"
                >
                  {data.actionButton?.label}
                </Link>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
