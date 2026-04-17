import type { Redirect } from 'next/dist/lib/load-custom-routes';

/**
 * Redirects for removed products, defunct categories, and old brand pages.
 * From GSC error analysis (Mar 2026) — these URLs return 404 and need
 * permanent redirects to preserve link equity and fix crawl errors.
 */
export const gscFixRedirects: Redirect[] = [
  // Removed /ru/ men's products → /ru/man
  { source: '/ru/product/borsetka-muzhskaya-baldinini-pletenaya-gbbda9', destination: '/ru/man', permanent: true },
  { source: '/ru/product/dvustoronnij-muzhskoj-remen-baldinini-g51136', destination: '/ru/man', permanent: true },
  { source: '/ru/product/futbolka-polo-muzhskaya-ea7-zheltaya-ea7-emporio-armani-zhovtij-8npf06', destination: '/ru/man', permanent: true },
  { source: '/ru/product/krossovki-muzhskie-fabi-zimnie-8725', destination: '/ru/man', permanent: true },
  { source: '/ru/product/krossovki-muzhskie-premiata-lander-7702', destination: '/ru/man', permanent: true },
  { source: '/ru/product/muzhskie-krossovki-blauer-blauer-usa-queens01', destination: '/ru/man', permanent: true },
  { source: '/ru/product/ploskaya-muzhskaya-sumka-baldinini-pletenaya-gbv003', destination: '/ru/man', permanent: true },
  { source: '/ru/product/sportivnyj-muzhskoj-kostyum-ea7-ea7-emporio-armani-8npv51', destination: '/ru/man', permanent: true },
  { source: '/ru/product/sportivnyj-muzhskoj-kostyum-ea7-ea7-emporio-armani-8npv56', destination: '/ru/man', permanent: true },
  { source: '/ru/product/sportivnyj-muzhskoj-kostyum-ea7-ea7-emporio-armani-sinij-8npv08', destination: '/ru/man', permanent: true },
  { source: '/ru/product/sportivnyj-muzhskoj-kostyum-ea7-na-flise-ea7-emporio-armani-chornij-6dpv66', destination: '/ru/man', permanent: true },
  { source: '/ru/product/sportivnyj-muzhskoj-kostyum-ea7-na-flise-ea7-emporio-armani-sinij-6dpv66', destination: '/ru/man', permanent: true },
  { source: '/ru/product/sumka-muzhskaya-baldinini-672036', destination: '/ru/man', permanent: true },
  { source: '/ru/product/sumka-muzhskaya-baldinini-chornij-96-002', destination: '/ru/man', permanent: true },
  { source: '/ru/product/tufli-muzhskie-angel-infantes-sinij-31055', destination: '/ru/man', permanent: true },
  { source: '/ru/product/velyurovyj-muzhskoj-kostyum-ea7-emporio-armani-7m000675-676', destination: '/ru/man', permanent: true },
  { source: '/ru/product/shtany-sport-chol-chorni-strochka-lampas-3dpp81', destination: '/ru/man', permanent: true },
  { source: '/ru/product/cholovichyj-kostyum-ea7-logo-series-7m000971-74-black', destination: '/ru/man', permanent: true },
  { source: '/ru/product/dzhemper-cholovichyj-bikkembergs-tonkyj-z-logo-pbmf0016', destination: '/ru/man', permanent: true },
  { source: '/ru/product/litni-cholovichi-krosivky-voile-blanche-9021-02', destination: '/ru/man', permanent: true },
  // Removed /ru/ women's products → /ru/woman
  { source: '/ru/product/cherevyky-unty-zhinochi-area-forte-8npp61', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/espadrili-zhenskie-kanna-8000', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/futbolka-zhenskaya-ea7-ea7-emporio-armani-6dtt03', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/kofta-zhinocha-ea7-z-logotypom-v-ton-3dtm22', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/rubashka-zhenskaya-paul-smith-s-cvetochnym-printom-331b', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/zimnie-sapogi-angelo-bervicato-3821', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/tufli-lodochki-casadei-blade-bezhevye-1f161-beige', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/tufli-lodochki-cesare-paciotti-bezhevye-kozhanye-zi001', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/tufli-chovnyky-blade-bezhevi', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/krossovki-furla-wonderfurla-belye-ye29wof', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/legginsy-ea7-chernye-ea7-emporio-armani-6dtp92', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/plate-ea7-ea7-emporio-armani-3dta57', destination: '/ru/woman', permanent: true },
  { source: '/ru/product/sabo-ea7-ea7-emporio-armani-bezhevij-xbr003', destination: '/ru/woman', permanent: true },
  // Removed /uk/ men's products → /uk/man
  { source: '/uk/product/cholovichyj-kostyum-ea7-logo-series-7m000971-74-black', destination: '/uk/man', permanent: true },
  { source: '/uk/product/cholovichyj-remin-baldinini-g51133', destination: '/uk/man', permanent: true },
  { source: '/uk/product/chorni-cholovichi-krosivky-voile-blanche-qwark-7930', destination: '/uk/man', permanent: true },
  { source: '/uk/product/dzhemper-cholovichyj-bikkembergs-tonkyj-z-logo-pbmf0016', destination: '/uk/man', permanent: true },
  { source: '/uk/product/dorozhnye-portmone-dirk-bikkembergs-1d-307', destination: '/uk/man', permanent: true },
  { source: '/uk/product/krosivky-cholovichi-premiata-lander-7702', destination: '/uk/man', permanent: true },
  { source: '/uk/product/litni-cholovichi-krosivky-voile-blanche-9021-02', destination: '/uk/man', permanent: true },
  { source: '/uk/product/plaska-cholovicha-sumka-baldinini-pletena-gbv003', destination: '/uk/man', permanent: true },
  { source: '/uk/product/portmone-choloviche-baldinini-pletene-gbx314', destination: '/uk/man', permanent: true },
  { source: '/uk/product/remen-versace-jeans-couture-bf34', destination: '/uk/man', permanent: true },
  { source: '/uk/product/shorty-cholovichi-ea7-chorni-3dps73-3dps73-nero', destination: '/uk/man', permanent: true },
  { source: '/uk/product/tufli-cholovichi-giampieronicola-40233', destination: '/uk/man', permanent: true },
  { source: '/uk/product/zhyletka-cholovicha-ea7-tonka-8npq05', destination: '/uk/man', permanent: true },
  // Removed /uk/ women's products → /uk/woman
  { source: '/uk/product/dolchevita-zhinocha-biancalancia-chorna-115', destination: '/uk/woman', permanent: true },
  { source: '/uk/product/kostyum-zhinochyj-ea7-emporio-armani-z-lampasom-7w000149-152', destination: '/uk/woman', permanent: true },
  { source: '/uk/product/tufli-chovnyky-blade-bezhevi', destination: '/uk/woman', permanent: true },
  { source: '/uk/product/zymovi-zhinochi-krosivky-premiata-cassie-7072', destination: '/uk/woman', permanent: true },
  // Defunct category pages
  { source: '/uk/man/botinki', destination: '/uk/man', permanent: true },
  { source: '/uk/man/krossovki-i-kedy-zhenskie', destination: '/uk/woman', permanent: true },
  { source: '/uk/woman/zhinochi-aksesuary', destination: '/uk/woman', permanent: true },
  // Removed brand pages
  { source: '/uk/brand/doucal-s', destination: '/uk/brand', permanent: true },
  { source: '/uk/brand/trussardi', destination: '/uk/brand', permanent: true },
];
