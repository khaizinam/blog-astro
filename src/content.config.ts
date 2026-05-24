import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: `./${BLOG_PATH}`,
    generateId: ({ entry }) => entry.replace(/\.[^/.]+$/, ""),
  }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string().transform(desc => {
        if (desc.length <= 160) return desc;
        const sub = desc.substring(0, 157);
        const lastSpace = sub.lastIndexOf(" ");
        return lastSpace > 0 ? sub.substring(0, lastSpace) + "..." : sub + "...";
      }),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      /** Language of this post: "vi" (default) or "en" */
      lang: z.enum(["vi", "en"]).default("vi"),
      /** Shared key linking vi and en versions of the same post */
      translationKey: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().transform(desc => {
      if (!desc || desc.length <= 160) return desc;
      const sub = desc.substring(0, 157);
      const lastSpace = sub.lastIndexOf(" ");
      return lastSpace > 0 ? sub.substring(0, lastSpace) + "..." : sub + "...";
    }),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

export const collections = { posts, pages };
