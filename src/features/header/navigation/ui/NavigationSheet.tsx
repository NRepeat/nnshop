'use client';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shared/ui/sheet';
import { InternalMenu } from './InternalMenu';
import { useState } from 'react';
import { Maybe } from '@shared/lib/shopify/types/storefront.types';
import { Menu, ChevronRightIcon } from 'lucide-react';
import { useRouter } from '@shared/i18n/navigation';
import { Button } from '@shared/ui/button';
import { saveGenderPreference } from '../api/saveGender';
import { cookieGenderSet } from '../api/setCookieGender';
import { Link } from '@shared/i18n/navigation';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>
);

const socialIconMap: Record<string, React.ReactNode> = {
  instagram: <InstagramIcon />,
  facebook: <FacebookIcon />,
  tiktok: <TikTokIcon />,
};

type SocialLink = {
  platform?: string | null;
  url?: string | null;
};

type DirectLink = {
  title: string;
  href: string;
};

const NavigationSheet = ({
  mainMenu,
  title,
  locale,
  socialLinks = [],
  directLinks = [],
}: {
  mainMenu: {
    label: string;
    menu: {
      id: Maybe<string> | undefined;
      title: string;
      url: string;
      items: {
        id: Maybe<string> | undefined;
        title: string;
        url: string;
        items: {
          id: Maybe<string> | undefined;
          title: string;
          url: string;
        }[];
      }[];
    }[];
  }[];
  title: string;
  locale: string;
  socialLinks?: SocialLink[];
  directLinks?: DirectLink[];
}) => {
  const navigate = useRouter();
  const [open, setOpen] = useState(false);

  const onClose = (link: string) => {
    setOpen(false);
    const genderMatch = link.match(/^\/(woman|man)\//);
    if (genderMatch) {
      const gender = genderMatch[1] as 'woman' | 'man';
      cookieGenderSet(gender);
      saveGenderPreference(gender);
    }
    navigate.push(link);
  };

  const infoLinks = [
    { title: locale === 'uk' ? 'Доставка' : 'Доставка', href: '/info/delivery' },
    { title: locale === 'uk' ? 'Оплата та повернення' : 'Оплата и возврат', href: '/info/payment-returns' },
    { title: locale === 'uk' ? 'Контакти' : 'Контакты', href: '/info/contacts' },
    { title: locale === 'uk' ? 'Публічна оферта' : 'Публичная оферта', href: '/info/public-offer-agreement' },
  ];

  const activeSocialLinks = socialLinks.filter(
    (l) => l.platform && l.url && socialIconMap[l.platform],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="cursor-pointer justify-center items-center"
        asChild
      >
        <Button variant="ghost" size="icon" aria-label="Open menu" className="rounded">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full flex flex-col p-0">
        <SheetHeader className="pt-6 px-4 shrink-0">
          <SheetTitle className="font-sans">{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <InternalMenu mainMenu={mainMenu} onClose={onClose} />
          {directLinks.length > 0 && (
            <div className="px-4">
              {directLinks.map((link) => (
                <div key={link.href} className="flex items-center justify-between border-b border-foreground/10">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="py-4 font-light transition-colors text-lg flex-1 flex items-center justify-between text-red-500"
                  >
                    {link.title}
                    <ChevronRightIcon className="pointer-events-none size-4 shrink-0 mr-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="shrink-0 border-t border-foreground/10 px-4 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {infoLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>

          {activeSocialLinks.length > 0 && (
            <div className="flex gap-3">
              {activeSocialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-foreground/20 rounded flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground transition-colors"
                  aria-label={link.platform ?? ''}
                >
                  {socialIconMap[link.platform!]}
                </a>
              ))}
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSheet;
