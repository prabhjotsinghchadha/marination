/**
 * GROQ projections and queries for blog listing, detail, and related content.
 */

const POST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  featured,
  "coverImage": coverImage.asset->url,
  "coverImageAlt": coverImage.alt,
  "category": category->{ title, "slug": slug.current, color },
  "author": author->{ name, "avatar": image.asset->url, role },
  "readTime": round(length(pt::text(body)) / 5 / 200)
`;

/**
 * Pagination: slice with `[$start...$end]` (end exclusive) on the same projection as the list query.
 * Add `category->slug.current == $categorySlug` to filter by category.
 */

export const POSTS_COUNT_QUERY = `count(*[_type == "post"])`;

export const FEATURED_POST_QUERY = `
  *[_type == "post" && featured == true] | order(publishedAt desc) [0] {
    ${POST_FIELDS}
  }
`;

export const BLOG_LIST_POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) [0...100] {
    ${POST_FIELDS}
  }
`;

export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_FIELDS},
    body,
    "seo": seo {
      metaTitle,
      metaDescription,
      "ogImage": ogImage.asset->url
    }
  }
`;

export const ALL_CATEGORY_SLUGS_QUERY = `
  *[_type == "category"] | order(title asc) {
    title,
    "slug": slug.current,
    color
  }
`;

export const ALL_POST_SLUGS_QUERY = `
  *[_type == "post"] { "slug": slug.current }
`;

export const RELATED_POSTS_QUERY = `
  *[
    _type == "post" &&
    category->slug.current == $categorySlug &&
    _id != $currentId
  ] | order(publishedAt desc) [0...3] {
    ${POST_FIELDS}
  }
`;
