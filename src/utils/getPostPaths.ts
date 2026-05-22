import { getRelativeLocaleUrl } from "astro:i18n";
import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";
import config from "@/config";
import type { CollectionEntry } from "astro:content";

/** The lang-prefixed sub-folders we strip from URL paths. */
const LANG_PREFIXES = ["vi", "en"];

function getPostPathSegments(filePath: string | undefined): string[] {
  return (
    filePath
      ?.replace(BLOG_PATH, "")
      .split("/")
      .filter(path => path !== "")
      .filter(path => !path.startsWith("_"))
      // Strip language folder prefix (vi/ or en/) — we route by locale, not path
      .filter(path => !LANG_PREFIXES.includes(path))
      .slice(0, -1)
      .map(segment => slugifyStr(segment)) ?? []
  );
}

function getIdSlug(id: string): string {
  const postId = id.split("/");
  return postId.length > 0 ? String(postId[postId.length - 1]) : id;
}

function getPostSlugPath(id: string, filePath: string | undefined): string {
  const pathSegments = getPostPathSegments(filePath);
  const slug = getIdSlug(id);
  return pathSegments.length > 0
    ? [...pathSegments, slug].join("/")
    : String(slug);
}

/**
 * Returns the lang of a post from its data, falling back to config default.
 */
export function getPostLang(post: CollectionEntry<"posts">): string {
  return post.data.lang ?? config.site.lang;
}

/**
 * Returns the canonical slug for a post.
 * Uses the frontmatter `slug` field if available, otherwise derives from file path.
 * The vi/ or en/ directory prefix is always stripped.
 *
 * e.g. `src/content/posts/vi/my-post.md` with `slug: my-post` → `my-post`
 */
export function getPostSlug(id: string, filePath: string | undefined): string {
  return `/${getPostSlugPath(id, filePath)}`;
}

/**
 * Returns a fully navigable URL for use in `<a href>` and RSS links.
 * - Vietnamese posts (default locale): `/:slug`
 * - English posts: `/en/:slug`
 *
 * The `posts/` segment is intentionally omitted to preserve legacy SEO URLs.
 */
export function getPostUrl(
  id: string,
  filePath: string | undefined,
  locale: string | undefined = config.site.lang
): string {
  return getRelativeLocaleUrl(locale, getPostSlugPath(id, filePath));
}

/**
 * Returns the URL for a post given its collection entry, auto-detecting locale.
 */
export function getPostUrlFromEntry(post: CollectionEntry<"posts">): string {
  const locale = getPostLang(post);
  return getPostUrl(post.id, post.filePath, locale);
}
