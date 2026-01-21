import { locales } from '@shared/i18n/routing';

export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}

export default function CatchAll() {
  return null;
}
