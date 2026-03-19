# Cache Tags Map

Полная карта тегов кеша Next.js — источники, потребители и триггеры ревалидации.

---

## Sanity-контент (тег-based, живёт бесконечно до вебхука)

### `siteSettings`
| Роль | Файл |
|------|------|
| **Читает** | `src/widgets/header/ui/Header.tsx` |
| **Читает** | `src/widgets/footer/ui/Footer.tsx` |
| **Читает** | `src/features/header/navigation/ui/Sheet.tsx` |
| **Читает** | `app/[locale]/(frontend)/opengraph-image.tsx` |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← Sanity вебхук `type: "siteSettings"` |

---

### `page`
| Роль | Файл |
|------|------|
| **Читает** | `src/features/home/api/get-home-page.ts` (вместе с `woman`/`man`) |
| **Читает** | `src/entities/product/api/getProductPage.ts` (вместе с `page:product-page`) |
| **Читает** | `app/[locale]/(frontend)/info/[slug]/page.tsx` (вместе с `page:${slug}`) |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← Sanity вебхук `type: "page"` |

### `page:${slug}` (точечная инвалидация страниц)
| slug | Файл |
|------|------|
| `page:product-page` | `src/entities/product/api/getProductPage.ts` |
| `page:delivery` / `page:contacts` / и др. | `app/[locale]/(frontend)/info/[slug]/page.tsx` |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← `type: "page", slug: "delivery"` → `revalidateTag("page:delivery")` |

### `woman` / `man`
| Роль | Файл |
|------|------|
| **Читает** | `src/features/home/api/get-home-page.ts` |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← `slug: "woman"` → `revalidateTag("woman")` |

---

### `post`
| Роль | Файл |
|------|------|
| **Читает** | `app/[locale]/(frontend)/blog/page.tsx` |
| **Читает** | `app/[locale]/(frontend)/blog/[slug]/page.tsx` (вместе с `post:${slug}`) |
| **Читает** | `src/shared/lib/sitemap/data.ts` (`cacheTag('post')`) |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← Sanity вебхук `type: "post"` |

### `post:${slug}` (точечная инвалидация поста)
| Роль | Файл |
|------|------|
| **Читает** | `app/[locale]/(frontend)/blog/[slug]/page.tsx` |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← `type: "post", slug: "my-post"` → `revalidateTag("post:my-post")` |

---

### `promotionBanner`
| Роль | Файл |
|------|------|
| **Читает** | `src/features/session-banner/api/get-session-banner.ts` |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← Sanity вебхук `type: "promotionBanner"` |

---

## Shopify-контент (тег-based, триггер — itali-shop-app)

### `collection:${handle}`
| Роль | Файл |
|------|------|
| **Читает** | `src/features/collection/ui/CollectionGrid.tsx` |
| **Читает** | `app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/page.tsx` |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← itali-shop-app `type: "collection", slug: "nike"` → `revalidateTag("collection:nike")` |
| **Источник** | `itali-shop-app/app/routes/webhooks.collections.update.tsx` |
| **Источник** | `itali-shop-app/app/routes/webhooks.collections.create.tsx` |
| **Источник** | `itali-shop-app/app/routes/webhooks.collections.delete.tsx` |

### `collections`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← `type: "collection"` (любое изменение коллекции) |

### `sitemap-categories`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← `type: "collection"` |

### `product` / `product:${slug}`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← itali-shop-app `type: "product", slug: "handle"` |
| **Путь** | `revalidatePath('/[locale]/product/[slug]', 'page')` — все страницы продуктов |
| **Источник** | `itali-shop-app/app/routes/webhooks.products.update.tsx` |

### `sitemap-products` / `sitemap-brands`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← `type: "product"` |

---

## Sitemap (`'use cache'` + `cacheTag`)

### `sitemap-posts`
| Роль | Файл |
|------|------|
| **Читает** | `src/shared/lib/sitemap/data.ts` (`cacheLife('max')`) |
| **Инвалидирует** | `app/api/revalidate/path/route.ts` ← `type: "post"` |

---

## Пользовательские действия (Server Actions, expire: 0)

### `CART` / `CART_ITEMS` / `CART_SESSION`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `src/entities/cart/api/add-product.ts` |
| **Инвалидирует** | `src/entities/cart/api/link-product.ts` |
| **Инвалидирует** | `src/entities/cart/api/update-cart-delivery-preferences.ts` |
| **Инвалидирует** | `src/features/cart/api/resetCartSession.ts` |

### `favorites` / `favorite-${userId}` / `product-${productId}`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `src/features/product/api/toggle-favorite.ts` |

### `quiq-view`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `src/entities/product/api/navigate-to-quiq-view.ts` |

### `menu`
| Роль | Файл |
|------|------|
| **Инвалидирует** | `app/api/revalidate/menu/route.ts` (query param secret) |

---

## Поток ревалидации

```
Sanity Studio
  └─► POST /api/revalidate/path (sanity-webhook-signature)
        └─► revalidateTag(type) + revalidateTag(type:slug)

Shopify
  └─► itali-shop-app (Remix webhook handler)
        └─► revalidateNextJs({ type, slug })
              └─► POST /api/revalidate/path (HMAC-SHA256, совместим с parseBody)
                    └─► revalidateTag(type) + revalidateTag(type:slug)

User action (Server Action)
  └─► revalidateTag(CART_TAGS.CART, { expire: 0 })
```

---

## Теги без потребителей (инвалидируются, но не используются как теги в fetch)

| Тег | Причина |
|-----|---------|
| `collection` (голый) | Роут вызывает `revalidateTag('collection')`, но ни один `sanityFetch` не использует просто `'collection'` |
| `${slug}` (голый) | `revalidateTag(body.slug)` — e.g. `'delivery'`, `'nike'` — не совпадает ни с одним тегом |
