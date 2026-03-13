# SEO Guidelines — Mio Mio

## URL Structure
- Blog: `https://miomio.com.ua/uk/blog/[slug]`
- Collections: `https://miomio.com.ua/uk/woman/[slug]`
- Products: `https://miomio.com.ua/uk/product/[slug]`
- hreflang: uk (canonical) + ru + x-default

## Content Standards
- **Blog posts**: мінімум 1200 слів для інформаційних, 800 для оглядів
- **Title tag**: до 60 символів, ключове слово на початку
- **Meta description**: 140–155 символів, заклик до дії
- **H1**: одна на сторінку, містить головне ключове слово
- **Keyword density**: 1–1.5% для основного ключового слова
- **Alt-text**: описовий, з ключовим словом де доречно

## Content Types for Blog
1. **Гайди** ("Як вибрати...") — довгий хвіст, інформаційний інтент
2. **Тренди** ("Топ-10... 2025") — сезонний трафік
3. **Догляд** ("Як доглядати за...") — корисний контент, довіра
4. **Порівняння** ("... vs ...") — комерційний інтент

## Internal Linking Strategy
- Кожна стаття → 2–4 посилання на колекції або продукти
- Anchor text: природній, з ключовим словом
- Посилання на пов'язані статті блогу

## CMS: Sanity
- Publish via: `/seo:publish-draft`
- Studio: https://miomio.com.ua/studio
- Fields: title, slug, body, mainImage, seo.title, seo.description, language
- Drafts saved to: `seo/drafts/`
- Published archived to: `seo/published/`

## Robots / Indexing
- noindex: checkout, auth, API routes
- index: всі публічні сторінки магазину та блогу
