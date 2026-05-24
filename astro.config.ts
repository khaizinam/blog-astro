import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { visit } from "unist-util-visit";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./astro-paper.config";

// Helpers for clean accent-free slugs
function getNodeText(node: any): string {
  if (node.type === "text") return node.value || "";
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getNodeText).join("");
  }
  return "";
}

function cleanSlugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function rehypeCleanSlugs() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
        const text = getNodeText(node);
        node.properties = node.properties || {};
        node.properties.id = cleanSlugify(text);
      }
    });
  };
}

export default defineConfig({
  site: config.site.url,
  redirects: {
    "/en/cach-dam-phan-luong-khi-moi-ra-truong-bi-quyet-de-khong-bi-tra-gia-thap-hon-gia-tri-that": "/en/junior-developer-salary-negotiation",
    "/en/muc-luong-fresher-junior-it-2026-ban-nen-ky-vong-bao-nhieu": "/en/entry-level-software-engineer-salary-2026"
  },
  integrations: [
    mdx({
      rehypePlugins: [rehypeCleanSlugs],
    }),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["vi", "en"],
    defaultLocale: "vi",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    remarkPlugins: [remarkToc],
    rehypePlugins: [rehypeCleanSlugs],
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss() as any],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
