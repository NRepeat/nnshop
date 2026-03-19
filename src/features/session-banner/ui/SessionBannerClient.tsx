'use client';

import { useEffect, useRef, useState } from 'react';
import { stegaClean } from '@sanity/client/stega';
import Image from 'next/image';
import { CheckIcon, CopyIcon, TagIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@shared/ui/dialog';
import { cn } from '@shared/lib/utils';

const STORAGE_KEY = 'session_banner_dismissed';

type BannerData = {
  _id: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  title?: string | null;
  description?: string | null;
  discountCode?: string | null;
  actionButton?: { label?: string | null; url?: string | null } | null;
  behavior?: {
    trigger?: string | null;
    delaySeconds?: number | null;
    scrollPercent?: number | null;
    cooldownHours?: number | null;
    showOnce?: boolean | null;
  } | null;
};

function shouldShow(behavior: BannerData['behavior']): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true;

  try {
    const { dismissedAt, id } = JSON.parse(raw) as {
      dismissedAt: number;
      id: string;
    };

    if (behavior?.showOnce) return false;

    const cooldown = (behavior?.cooldownHours ?? 24) * 60 * 60 * 1000;
    if (cooldown === 0) return true;

    return Date.now() - dismissedAt > cooldown;
  } catch {
    return true;
  }
}

function saveDismissed(id: string) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ dismissedAt: Date.now(), id }),
  );
}

type BannerStatus = 'idle' | 'waiting' | 'visible' | 'dismissed' | 'skipped';

export function SessionBannerClient({ data }: { data: BannerData }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<BannerStatus>('idle');
  const scrollHandlerRef = useRef<(() => void) | null>(null);
  const exitHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const behavior = data.behavior;
  const trigger = behavior?.trigger ?? 'delay';

  useEffect(() => {
    if (!shouldShow(behavior)) {
      setStatus('skipped');
      return;
    }

    setStatus('waiting');

    if (trigger === 'delay') {
      const delaySec = behavior?.delaySeconds ?? 5;
      const delay = delaySec * 1000;

      const timer = setTimeout(() => {
        setOpen(true);
        setStatus('visible');
      }, delay);

      return () => clearTimeout(timer);
    }

    if (trigger === 'scroll') {
      const threshold = (behavior?.scrollPercent ?? 40) / 100;
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
  }, [behavior, trigger]);

  function handleOpenChange(value: boolean) {
    if (!value) {
      saveDismissed(data._id);
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

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 rounded-full bg-black/80 px-3 py-1.5 text-xs text-white font-mono shadow-lg">
          <span className={`size-2 rounded-full ${statusColor[status]}`} />
          banner: {status}
          {status === 'waiting' && trigger === 'delay' && (
            <span className="text-yellow-300">
              ({behavior?.delaySeconds ?? 5}s)
            </span>
          )}
        </div>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton
          className="p-0 gap-0 w-[90%] md:w-full max-w-[720px] overflow-hidden rounded-xl border-0"
        >
          <div className="flex flex-col sm:flex-row   sm:min-h-[420px] ">
            {/* Image panel */}
            {data.imageUrl && (
              <div className="relative sm:w-[45%] h-[400px] sm:h-auto shrink-0 overflow-hidden">
                <Image
                  src={data.imageUrl}
                  alt={data.imageAlt ?? ''}
                  fill
                  className="object-cover object-[25%_60%] sm:object-[100%] sm:object-cover"
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
                  <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
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
              {data.actionButton?.label && data.actionButton?.url && (
                <a
                  href={data.actionButton.url}
                  onClick={() => saveDismissed(data._id)}
                  className="inline-flex items-center justify-center bg-black text-white text-sm font-medium px-6 py-3 rounded-md hover:bg-neutral-800 transition-colors w-full sm:w-auto"
                >
                  {data.actionButton.label}
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
