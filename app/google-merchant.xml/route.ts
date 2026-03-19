import { generateGoogleMerchantXml } from '@shared/lib/feeds/google-merchant';
import { xmlResponse } from '@shared/lib/sitemap/xml';
import { connection } from 'next/server';

export async function GET() {
  await connection();
  try {
    const xml = await generateGoogleMerchantXml('uk');
    return xmlResponse(xml);
  } catch (error) {
    console.error('Failed to generate Google Merchant feed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
