import type { PortableTextBlock } from "@portabletext/types";

export type SanityBlogAuthor = {
  name: string | null;
  avatar?: string | null;
  role?: string | null;
};

export type SanityBlogCategory = {
  title: string | null;
  slug: string | null;
  color?: string | null;
};

/** Fields shared by list and detail projections (before body is added). */
export type SanityBlogPostList = {
  _id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  publishedAt: string | null;
  featured?: boolean | null;
  coverImage: string | null;
  coverImageAlt?: string | null;
  category: SanityBlogCategory | null;
  author: SanityBlogAuthor | null;
  readTime: number | null;
};

export type SanityBlogSeo = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
} | null;

export type SanityBlogPostDetail = SanityBlogPostList & {
  body?: PortableTextBlock[] | null;
  seo?: SanityBlogSeo;
};

export type SanityCategoryDoc = {
  title: string | null;
  slug: string | null;
  color?: string | null;
};
