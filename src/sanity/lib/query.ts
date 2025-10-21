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
  defineQuery(`*[_type == "post" && defined(slug.current) && language == "ua"] | order(publishedAt desc)[0...12]{
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

export const HOME_PAGE_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
    homePage->{
      ...,
      content[]{
        ...,
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
