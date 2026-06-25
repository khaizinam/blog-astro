/**
 * Cloudflare Pages Function – Markdown for Agents middleware
 *
 * Implements `Accept: text/markdown` content negotiation so AI agents and LLMs
 * can request a Markdown version of any page.
 *
 * Spec: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 * Skill: https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
 *
 * Behaviour:
 *  - Requests with `Accept: text/markdown` → HTML is fetched, converted to
 *    Markdown, returned with `Content-Type: text/markdown; charset=utf-8`.
 *  - All other requests pass through unchanged (HTML default for browsers).
 *  - `x-markdown-tokens`  – estimated token count of the Markdown body.
 *  - `Vary: Accept`        – correct caching split between HTML and Markdown.
 */

interface Env {}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Rough GPT-style token estimate: ~4 chars per token. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Convert an HTML response to clean Markdown using Cloudflare's HTMLRewriter.
 *
 * Strategy:
 *  1. Extract <meta> tags for YAML frontmatter (title, description, og:image).
 *  2. Strip non-content elements: <nav>, <header>, <footer>, <aside>,
 *     <script>, <style>, <noscript>, <form>, banner/sidebar roles, etc.
 *  3. Walk the remaining content and emit Markdown equivalents.
 */
async function htmlToMarkdown(html: string): Promise<string> {
  // We process the HTML string directly since HTMLRewriter works on Response.
  // Re-wrap it so we can stream through HTMLRewriter.
  const fakeResponse = new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  // ── Phase 1: collect metadata ──────────────────────────────────────────────
  const meta: { title?: string; description?: string; image?: string } = {};
  const jsonLdBlocks: string[] = [];

  // We need two passes because HTMLRewriter is streaming.
  // Pass 1 – metadata only.
  const metaResponse = fakeResponse.clone();
  await new HTMLRewriter()
    .on("meta[name='title']", {
      element(el) {
        meta.title = meta.title ?? el.getAttribute("content") ?? undefined;
      },
    })
    .on("meta[property='og:title']", {
      element(el) {
        meta.title = meta.title ?? el.getAttribute("content") ?? undefined;
      },
    })
    .on("title", {
      text(chunk) {
        if (!meta.title && chunk.text) meta.title = chunk.text;
      },
    })
    .on("meta[name='description']", {
      element(el) {
        meta.description =
          meta.description ?? el.getAttribute("content") ?? undefined;
      },
    })
    .on("meta[property='og:description']", {
      element(el) {
        meta.description =
          meta.description ?? el.getAttribute("content") ?? undefined;
      },
    })
    .on("meta[property='og:image']", {
      element(el) {
        meta.image = meta.image ?? el.getAttribute("content") ?? undefined;
      },
    })
    .on("script[type='application/ld+json']", {
      text(chunk) {
        if (chunk.text) jsonLdBlocks.push(chunk.text);
      },
    })
    .transform(metaResponse)
    .text();

  // ── Phase 2: content extraction ────────────────────────────────────────────
  // We build a simple text-based Markdown from the main content elements.
  const parts: string[] = [];
  let inSkip = 0; // nesting counter for elements to skip
  let listDepth = 0;
  let inPre = false;
  let codeBuffer = "";

  const contentResponse = new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  await new HTMLRewriter()
    // ── skip non-content blocks ──────────────────────────────────────────────
    .on(
      "nav, header, footer, aside, script, style, noscript, form, iframe, svg",
      {
        element(el) {
          inSkip++;
          el.onEndTag(() => {
            inSkip--;
          });
        },
      }
    )
    // Skip elements with role=navigation/banner/contentinfo/complementary
    .on(
      "[role='navigation'], [role='banner'], [role='contentinfo'], [role='complementary'], [role='search']",
      {
        element(el) {
          inSkip++;
          el.onEndTag(() => {
            inSkip--;
          });
        },
      }
    )
    // ── headings ─────────────────────────────────────────────────────────────
    .on("h1", {
      element(el) {
        if (!inSkip) {
          parts.push("\n# ");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    .on("h2", {
      element(el) {
        if (!inSkip) {
          parts.push("\n## ");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    .on("h3", {
      element(el) {
        if (!inSkip) {
          parts.push("\n### ");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    .on("h4", {
      element(el) {
        if (!inSkip) {
          parts.push("\n#### ");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    .on("h5", {
      element(el) {
        if (!inSkip) {
          parts.push("\n##### ");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    .on("h6", {
      element(el) {
        if (!inSkip) {
          parts.push("\n###### ");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    // ── paragraphs ────────────────────────────────────────────────────────────
    .on("p", {
      element(el) {
        if (!inSkip) {
          parts.push("\n");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    // ── blockquote ────────────────────────────────────────────────────────────
    .on("blockquote", {
      element(el) {
        if (!inSkip) {
          parts.push("\n> ");
          el.onEndTag(() => parts.push("\n"));
        }
      },
    })
    // ── lists ─────────────────────────────────────────────────────────────────
    .on("ul, ol", {
      element(el) {
        if (!inSkip) {
          listDepth++;
          parts.push("\n");
          el.onEndTag(() => {
            listDepth--;
            parts.push("\n");
          });
        }
      },
    })
    .on("li", {
      element(el) {
        if (!inSkip) {
          parts.push("\n" + "  ".repeat(Math.max(listDepth - 1, 0)) + "- ");
          el.onEndTag(() => {});
        }
      },
    })
    // ── links ─────────────────────────────────────────────────────────────────
    .on("a[href]", {
      element(el) {
        if (!inSkip) {
          const href = el.getAttribute("href") ?? "";
          parts.push("[");
          el.onEndTag(() => parts.push(`](${href})`));
        }
      },
    })
    // ── emphasis ─────────────────────────────────────────────────────────────
    .on("strong, b", {
      element(el) {
        if (!inSkip) {
          parts.push("**");
          el.onEndTag(() => parts.push("**"));
        }
      },
    })
    .on("em, i", {
      element(el) {
        if (!inSkip) {
          parts.push("_");
          el.onEndTag(() => parts.push("_"));
        }
      },
    })
    // ── inline code ───────────────────────────────────────────────────────────
    .on("code", {
      element(el) {
        if (!inSkip && !inPre) {
          parts.push("`");
          el.onEndTag(() => parts.push("`"));
        }
      },
    })
    // ── code blocks ───────────────────────────────────────────────────────────
    .on("pre", {
      element(el) {
        if (!inSkip) {
          inPre = true;
          codeBuffer = "";
          parts.push("\n```\n");
          el.onEndTag(() => {
            inPre = false;
            parts.push(codeBuffer + "\n```\n");
            codeBuffer = "";
          });
        }
      },
    })
    // ── images ────────────────────────────────────────────────────────────────
    .on("img[alt]", {
      element(el) {
        if (!inSkip) {
          const src = el.getAttribute("src") ?? "";
          const alt = el.getAttribute("alt") ?? "";
          parts.push(`\n![${alt}](${src})\n`);
        }
      },
    })
    // ── horizontal rule ───────────────────────────────────────────────────────
    .on("hr", {
      element(el) {
        if (!inSkip) parts.push("\n---\n");
      },
    })
    // ── line breaks ───────────────────────────────────────────────────────────
    .on("br", {
      element(el) {
        if (!inSkip) parts.push("  \n");
      },
    })
    // ── table ─────────────────────────────────────────────────────────────────
    .on("th, td", {
      element(el) {
        if (!inSkip) {
          parts.push("| ");
          el.onEndTag(() => parts.push(" "));
        }
      },
    })
    .on("tr", {
      element(el) {
        if (!inSkip) {
          el.onEndTag(() => parts.push("|\n"));
        }
      },
    })
    // ── text nodes ────────────────────────────────────────────────────────────
    .on("body", {
      text(chunk) {
        if (inSkip) return;
        const t = chunk.text;
        if (!t.trim()) {
          // preserve single whitespace between inline elements
          if (t.includes(" ") || t.includes("\t")) parts.push(" ");
          return;
        }
        if (inPre) {
          codeBuffer += t;
        } else {
          parts.push(t.replace(/\s+/g, " "));
        }
      },
    })
    .transform(contentResponse)
    .text();

  // ── Assemble output ────────────────────────────────────────────────────────
  const frontmatterFields: string[] = [];
  if (meta.title) frontmatterFields.push(`title: ${meta.title}`);
  if (meta.description)
    frontmatterFields.push(`description: ${meta.description}`);
  if (meta.image) frontmatterFields.push(`image: ${meta.image}`);

  const frontmatter =
    frontmatterFields.length > 0
      ? `---\n${frontmatterFields.join("\n")}\n---\n\n`
      : "";

  const body = parts
    .join("")
    // collapse 3+ blank lines to 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const jsonLd =
    jsonLdBlocks.length > 0
      ? `\n\n\`\`\`json\n${jsonLdBlocks.join("\n")}\n\`\`\``
      : "";

  return frontmatter + body + jsonLd;
}

// ─── middleware ───────────────────────────────────────────────────────────────

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, next } = ctx;
  const accept = request.headers.get("Accept") ?? "";

  // Fetch the underlying response.
  let response = await next();

  // Only process text/html responses.
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Inject Link header into all HTML responses for agent discovery
  response = new Response(response.body, response);
  if (!response.headers.has("Link")) {
    response.headers.append("Link", '</llms.txt>; rel="service-desc"');
  }

  // Pass through non-markdown requests with the added header
  if (!accept.includes("text/markdown")) {
    return response;
  }

  const html = await response.clone().text();
  const markdown = await htmlToMarkdown(html);

  const tokenCount = estimateTokens(markdown);

  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "x-markdown-tokens": String(tokenCount),
    Vary: "Accept",
    // Forward important upstream headers
    ...(response.headers.get("Cache-Control")
      ? { "Cache-Control": response.headers.get("Cache-Control")! }
      : {}),
    ...(response.headers.get("ETag")
      ? { ETag: response.headers.get("ETag")! }
      : {}),
    ...(response.headers.get("Link")
      ? { Link: response.headers.get("Link")! }
      : {}),
  });

  return new Response(markdown, {
    status: response.status,
    headers,
  });
};
