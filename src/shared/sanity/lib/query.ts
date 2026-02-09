import { defineQuery } from 'next-sanity';

// Utility query to get all locales
export const LOCALES_QUERY = defineQuery(
  `*[_type == "locale"]|order(default, name asc){
    _id,
    tag,
    name,
    default,
    fallback->{tag}
  }`,
);

// Utility query to get default locale
export const DEFAULT_LOCALE_QUERY = defineQuery(
  `*[_type == "locale" && default == true][0].tag`,
);

// Utility query to get posts with fallback support - prioritizes current language, then falls back to English/default
export const POSTS_WITH_FALLBACK_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && (language == $language || language == "en" || !defined(language))] | order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`);

export const POSTS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)]|order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`);

// Get posts for specific language with English fallback - Ukrainian posts first
export const POSTS_BY_LANGUAGE_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && language == $language] | order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`);

// Debug query for Ukrainian posts specifically
export const POSTS_UA_DEBUG_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && language == "uk"] | order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`);

// Debug query to see all posts with their languages
export const ALL_POSTS_DEBUG_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  language,
  "hasLanguage": defined(language)
}`);

export const POSTS_SLUGS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)]{
  "slug": slug.current,
  language
}`);

export const POSTS_SLUGS_BY_LANGUAGE_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && language == $language]{
  "slug": slug.current,
  language
}`);

export const PAGE_SLUGS_QUERY =
  defineQuery(`*[_type == "page" && defined(slug.current)]{
  "slug": slug.current,
  language
}`);

export const POST_QUERY =
  defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  },
  relatedPosts[]{
    _key,
    ...@->{_id, title, slug, language}
  },
  "seo": {
  "title": coalesce(seo.title, title, ""),
    "description": coalesce(seo.description,  ""),
    "image": seo.image,
    "noIndex": seo.noIndex == true
   },
}`);

// Get single post by language with English fallback - prioritizes exact language match
export const POST_BY_LANGUAGE_QUERY =
  defineQuery(`*[_type == "post" && slug.current == $slug && language == $language][0]{
  _id,
  title,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  },
  relatedPosts[]{
    _key,
    ...@->{_id, title, slug, language}
  },
  "seo": {
  "title": coalesce(seo.title, title, ""),
    "description": coalesce(seo.description,  ""),
    "image": seo.image,
    "noIndex": seo.noIndex == true
   },
}`);

// Get posts with English fallback - separate query for fallback logic
export const POSTS_EN_FALLBACK_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && (language == "en" || !defined(language))] | order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`);

// Get single post with English fallback
export const POST_WITH_FALLBACK_QUERY =
  defineQuery(`*[_type == "post" && slug.current == $slug && (language == "en" || !defined(language))][0]{
  _id,
  title,
  body,
  mainImage,
  publishedAt,
  language,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  },
  relatedPosts[]{
    _key,
    ...@->{_id, title, slug, language}
  },
  "seo": {
  "title": coalesce(seo.title, title, ""),
    "description": coalesce(seo.description,  ""),
    "image": seo.image,
    "noIndex": seo.noIndex == true
   },
}`);

export const PAGE_QUERY =
  defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  ...,
  "seo": {
  "title": coalesce(seo.title, title, ""),
    "description": coalesce(seo.description,  ""),
    "image": seo.image,
    "noIndex": seo.noIndex == true
   },
  content[]{
    ...,
    _type == "contentPageBlock" => {
      body {
        en[]{
          ...,
          markDefs[]{
            ...,
            _type == "link" => {
              ...,
              "href": string(@.href)
            }
          }
        },
        uk[]{
          ...,
          markDefs[]{
            ...,
            _type == "link" => {
              ...,
              "href": string(@.href)
            }
          }
        }
      }
    },
    _type == "similarProducts" => {
      collection -> {
        _id,
        title,
        store{
         imageUrl,
         isDeleted,
         slug{
         current
         },
         title
        }
      }
    },
    _type == "sliderBlock" => {
      slides[]{
         ...,
        _key,
        link[]{
         ...,
         reference->{
           _id,
           _type,
           title,
           "slug": select(
             _type == "product" => store.slug.current,
             _type == "collection" => store.slug.current,
             _type == "page" => slug.current
           )
         }
       },
        backgroundImage{
          asset->{
            _id,
            url,
            metadata{dimensions}
          }
        }
      }
    },
    _type == "productCarousel" => {
      products[]->{
        _id,
        store{
          title,
          isDeleted,
          previewImageUrl,
          priceRange{
          maxVariantPrice,
          minVariantPrice
          },
          productType
        }
      },
      collection -> {
        _id,
        title,
        store{
         imageUrl,
         isDeleted,
         slug{
         current
         },
         title
        }
      }
    },
    _type == "collectionsCarousel" => {
      collections[]->{
        _id,
        title,
        store{
         imageUrl,
         isDeleted,
         slug{
         current
         },
         title
        }
      }
    },
    _type == "splitImage" => {
      ...,
      link[]{
        ...,
        reference->{
          _id,
          _type,
          title,
          "slug": select(
            _type == "product" => store.slug.current,
            _type == "collection" => store.slug.current,
            _type == "page" => slug.current
          )
        }
      }
    },
    _type == "faqs" => {
      ...,
      faqs[]->{
        _id,
        title,
        body,
        "text": pt::text(body)
      }
    }
  }
}`);
export const HOME_PAGE =
  defineQuery(`*[_type == "page" && slug == $slug  && language == $language][0]{
    ...,
    "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
      title,
      slug,
      language
    },
    "seo": {
    "title": coalesce(seo.title, title, ""),
      "description": coalesce(seo.description,  ""),
      "image": seo.image,
      "noIndex": seo.noIndex == true
     },
    content[]{
      ...,
      _type == "mainCollectionGrid" => {
           ...,
           "title": coalesce(title[$language], title.uk, title.ru),
           "collections": collections[]->{
             title,
             "handle": store.slug.current,
             "id": store.id,
             handles,
             titles,
             "image": { "url": store.imageUrl }
           }
        },
        _type == "productCarousel" => {
             ...,
             "title": coalesce(title[$language], title.uk, title.ru),
             "collection": collection->{
               title,
               "handle": store.slug.current,
               "id": store.id,
               handles,
               titles
             }
          },
          _type == "splitImage" => {
               ...,
               "title": coalesce(title[$language], title.uk, title.ru),
               "collection": collection->{
                 title,
                 "handle": store.slug.current,
                 "id": store.id,
                 handles,
                 titles
               }
            },
            _type == "features" => {
              _key,
              _type,
              "features": features[] {
                _key,
                _type,
                "title": coalesce(title[$language], title.uk, title.ru),
                "text": coalesce(text[$language], text.uk, text.ru),
              }
            },
            _type == "collectionsWithPreviews" => {
              _key,
              _type,
              "title": coalesce(title[$language], title.uk, title.ru),
              "collections": collections[]->{
                title,
                "handle": store.slug.current,
                "id": store.id,
                handles,
                titles,
                "image": { "url": store.imageUrl }
              }
            },
        _type == "brandGridBlock" => {
  ...,
  "title": coalesce(title[$language], title.uk, title.ru),
  "barnds": barnds[]{
      ...,
    "collectionData": collection-> {
       title,
                "handle": store.slug.current,
                "id": store.id,
                handles,
                titles,
                "image": { "url": store.imageUrl }
        }
  }
},
            _type == "collectionsCarousel" => {
              ...,
              "title": coalesce(title[$language], title.uk, title.ru),
              "action_text": coalesce(action_text[$language], action_text.uk, action_text.ru),
               "collections": collections[]->{
             title,
             "handle": store.slug.current,
             "id": store.id,
             handles,
             titles,
             "image": { "url": store.imageUrl }
           }
            },
            _type == "sliderBlock" => {
              ...,
              slides[]{
                ...,
                "title": coalesce(title[$language], title.uk, title.ru),
                backgroundImage{
                  asset->{
                    _id,
                    url,
                    metadata{dimensions}
                  }
                }
              }
            },
            _type == "faqs" => {
              ...,
              faqs[]->{
                _id,
                title,
                body,
                "text": pt::text(body)
              }
            },
            _type == "similarProducts" => {
              ...,
              collection->{
                 title,
          "slug": store.slug.current,
          "pageHandle": slug,
          "id": store.id,
          handles,
          titles
              }
            }
    }
  }`);

export const HOME_PAGE_QUERY = defineQuery(`*[_id == "siteSettings" ][0]{
    homePageMan->{
      ...,
      content[]{
        ...,
        _id,
        _type == "sliderBlock" => {
          slides[]{
             ...,
            _key,
            link[]{
             ...,
             reference->{
               _id,
               _type,
               title,
               "slug": select(
                 _type == "product" => store.slug.current,
                 _type == "collection" => store.slug.current,
                 _type == "page" => slug.current
               )
             }
           },
            backgroundImage{
              asset->{
                _id,
                url,
                metadata{dimensions}
              }
            }
          }
        },
        _type == "productCarousel" => {
          products[]->{
            _id,
            store{
              title,
              isDeleted,
              previewImageUrl,
              priceRange{
              maxVariantPrice,
              minVariantPrice
              },
              productType
            }
          },
          collection -> {
            _id,
            title,
            store{
             imageUrl,
             isDeleted,
             slug{
             current
             },
             title
            }
          }
        },
        _type == "collectionsCarousel" => {
          collections[]->{
            _id,
            title,
            store{
             imageUrl,
             isDeleted,
             slug{
             current
             },
             title
            }
          }
        },
        _type == "splitImage" => {
          ...,
          link[]{
            ...,
            reference->{
              _id,
              _type,
              title,
              "slug": select(
                _type == "product" => store.slug.current,
                _type == "collection" => store.slug.current,
                _type == "page" => slug.current
              )
            }
          }
        },
        _type == "faqs" => {
          ...,
          faqs[]->{
            _id,
            title,
            body,
            "text": pt::text(body)
          }
        }
      }
    },
    homePageWoman->{
      ...,
      content[]{
        ...,
        _id,
        _type == "sliderBlock" => {
          slides[]{
             ...,
            _key,
            link[]{
             ...,
             reference->{
               _id,
               _type,
               title,
               "slug": select(
                 _type == "product" => store.slug.current,
                 _type == "collection" => store.slug.current,
                 _type == "page" => slug.current
               )
             }
           },
            backgroundImage{
              asset->{
                _id,
                url,
                metadata{dimensions}
              }
            }
          }
        },
        _type == "productCarousel" => {
          products[]->{
            _id,
            store{
              title,
              isDeleted,
              previewImageUrl,
              priceRange{
              maxVariantPrice,
              minVariantPrice
              },
              productType
            }
          },
          collection -> {
            _id,
            title,
            store{
             imageUrl,
             isDeleted,
             slug{
             current
             },
             title
            }
          }
        },
        _type == "collectionsCarousel" => {
          collections[]->{
            _id,
            title,
            store{
             imageUrl,
             isDeleted,
             slug{
             current
             },
             title
            }
          }
        },
        _type == "splitImage" => {
          ...,
          link[]{
            ...,
            reference->{
              _id,
              _type,
              title,
              "slug": select(
                _type == "product" => store.slug.current,
                _type == "collection" => store.slug.current,
                _type == "page" => slug.current
              )
            }
          }
        },
        _type == "faqs" => {
          ...,
          faqs[]->{
            _id,
            title,
            body,
            "text": pt::text(body)
          }
        }
      }
    }
  }`);
export const REDIRECTS_QUERY = defineQuery(`
  *[_type == "redirect" && isEnabled == true] {
      source,
      destination,
      permanent
  }
`);

export const OG_IMAGE_QUERY = defineQuery(`
  *[_id == $id][0]{
    title,
    "image": mainImage.asset->{
      url,
      metadata {
        palette
      }
    }
  }
`);

export const SITE_LOGO_QUERY = defineQuery(`
  *[_type == 'siteSettings'][0]{
    "logo": header.icon.asset->{
      url
    }
  }
`);
export const SITEMAP_QUERY = defineQuery(`
*[_type in ["page", "post"] && defined(slug.current)] {
    "href": select(
      _type == "page" => "/" + slug.current,
      _type == "post" => select(
        defined(language) => "/" + language + "/posts/" + slug.current,
        "/posts/" + slug.current
      ),
      slug.current
    ),
    _updatedAt,
    language
}
`);

export const HEADER_QUERY = defineQuery(`
  *[_type == 'siteSettings'][0]{
    infoBar {
      ...,
      telephone,
      "text": coalesce(text[$locale], text.uk, text.ru, ""),
      link {
        ...,
        "collectionData": reference-> {
          title,
          "handle": store.slug.current,
          "pageHandle": slug,
          "id": store.id,
          handles,
          titles
        }
      }
    },
    header {
      ...,
      categoryLinks[]{
        _key,
        "title": coalesce(title[$locale], title.uk, title.ru, ""),
        "collectionData": reference-> {
          title,
          "slug": store.slug.current,
          "pageHandle": slug,
          "id": store.id,
          handles,
          titles
        }
      },
      mainCategory[]{
        _key,
        "title": coalesce(title[$locale], title.uk, title.ru, ""),
        "collectionData": reference-> {
          title,
          "slug": store.slug.current,
          "pageHandle": slug,
          "id": store.id,
          handles,
          titles
        }
      }
    },
    brandsNavigation {
      topBrands,
      collections[]{
        _key,
        "title": coalesce(title[$locale], title.uk, title.ru, ""),
        "collectionData": reference-> {
          title,
          "slug": store.slug.current,
          "pageHandle": slug,
          "id": store.id,
          handles,
          titles
        }
      }
    }
  }
`);
