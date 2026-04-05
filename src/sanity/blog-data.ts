import { cache } from "react";
import { client } from "@/sanity/client";
import {
  ALL_CATEGORY_SLUGS_QUERY,
  ALL_POST_SLUGS_QUERY,
  BLOG_LIST_POSTS_QUERY,
  FEATURED_POST_QUERY,
  POSTS_COUNT_QUERY,
  POST_BY_SLUG_QUERY,
  RELATED_POSTS_QUERY,
} from "@/sanity/queries";
import type {
  SanityBlogPostDetail,
  SanityBlogPostList,
  SanityCategoryDoc,
} from "@/sanity/types";

type BlogListingResult = {
  featured: SanityBlogPostList | null;
  categories: SanityCategoryDoc[];
  posts: SanityBlogPostList[];
  totalCount: number;
  fetchFailed: boolean;
};

/**
 * Loads featured post, categories, recent posts (up to 100), and total count for the blog index.
 */
export async function getBlogListing(): Promise<BlogListingResult> {
  try {
    const [featured, categories, posts, totalCount] = await Promise.all([
      client.fetch<SanityBlogPostList | null>(FEATURED_POST_QUERY),
      client.fetch<SanityCategoryDoc[]>(ALL_CATEGORY_SLUGS_QUERY),
      client.fetch<SanityBlogPostList[]>(BLOG_LIST_POSTS_QUERY),
      client.fetch<number>(POSTS_COUNT_QUERY),
    ]);
    return {
      featured: featured ?? null,
      categories: categories ?? [],
      posts: posts ?? [],
      totalCount: totalCount ?? 0,
      fetchFailed: false,
    };
  } catch {
    return {
      featured: null,
      categories: [],
      posts: [],
      totalCount: 0,
      fetchFailed: true,
    };
  }
}

export const getBlogPostBySlug = cache(async (slug: string) => {
  try {
    return await client.fetch<SanityBlogPostDetail | null>(POST_BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
});

export const getRelatedBlogPosts = cache(
  async (categorySlug: string, currentId: string) => {
    try {
      return await client.fetch<SanityBlogPostList[]>(RELATED_POSTS_QUERY, {
        categorySlug,
        currentId,
      });
    } catch {
      return [];
    }
  },
);

/**
 * Slugs for static generation of post routes.
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const rows = await client.fetch<{ slug: string | null }[]>(ALL_POST_SLUGS_QUERY);
    return (rows ?? [])
      .map((row) => row.slug)
      .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  } catch {
    return [];
  }
}
