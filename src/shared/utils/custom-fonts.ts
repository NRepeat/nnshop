import localFont from 'next/font/local';

const StyreneA = localFont({
  src: [
    {
      path: '../assets/fonts/styrene-a/StyreneA-Thin.otf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-ThinItalic.otf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-LightItalic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-MediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-Black.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a/StyreneA-BlackItalic.otf',
      weight: '900',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-styrene-a',
});

const StyreneAWeb = localFont({
  src: [
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-ThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../assets/fonts/styrene-a-web/StyreneAWeb-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-styrene-a-web',
});

export { StyreneA, StyreneAWeb };
