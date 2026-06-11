import { Lexer, Marked, type Token, type TokenizerAndRendererExtension, type Tokens } from "marked";

type ExtractedFootnote = {
  label: string;
  markdown: string;
  htmlId: string;
  html: string;
  referenceUrl?: string;
  firstReferenceId?: string;
};

type CodeFence = {
  marker: "`" | "~";
  length: number;
};

const footnoteDefinitionPattern = /^\[\^([^\]\r\n]+)\]:[ \t]*(.*)$/;
const footnoteReferencePattern = /^\[\^([^\]\r\n]+)\]/;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toFootnoteId(label: string, usedIds: Set<string>): string {
  const baseId =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "note";

  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

function getFence(line: string): CodeFence | null {
  const match = /^[ \t]{0,3}(`{3,}|~{3,})/.exec(line);

  if (!match) {
    return null;
  }

  return {
    marker: match[1][0] as "`" | "~",
    length: match[1].length,
  };
}

function isClosingFence(line: string, fence: CodeFence): boolean {
  const match = getFence(line);
  return Boolean(match && match.marker === fence.marker && match.length >= fence.length);
}

function extractFootnotes(markdown: string): {
  markdownWithoutFootnotes: string;
  footnoteSources: Array<{ label: string; markdown: string }>;
} {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const bodyLines: string[] = [];
  const footnoteSources: Array<{ label: string; markdown: string }> = [];
  let fence: CodeFence | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (fence) {
      bodyLines.push(line);

      if (isClosingFence(line, fence)) {
        fence = null;
      }

      continue;
    }

    const openingFence = getFence(line);
    if (openingFence) {
      fence = openingFence;
      bodyLines.push(line);
      continue;
    }

    const definition = footnoteDefinitionPattern.exec(line);
    if (!definition) {
      bodyLines.push(line);
      continue;
    }

    const label = definition[1].trim();
    const noteLines = [definition[2]];
    let nextIndex = index + 1;

    while (nextIndex < lines.length) {
      const nextLine = lines[nextIndex];

      if (/^(?: {4}|\t)/.test(nextLine)) {
        noteLines.push(nextLine.replace(/^(?: {4}|\t)/, ""));
        nextIndex += 1;
        continue;
      }

      if (
        nextLine.trim() === "" &&
        nextIndex + 1 < lines.length &&
        /^(?: {4}|\t)/.test(lines[nextIndex + 1])
      ) {
        noteLines.push("");
        nextIndex += 1;
        continue;
      }

      break;
    }

    footnoteSources.push({
      label,
      markdown: noteLines.join("\n").trim(),
    });
    index = nextIndex - 1;
  }

  return {
    markdownWithoutFootnotes: bodyLines.join("\n").trim(),
    footnoteSources,
  };
}

function findFirstLinkUrl(tokens: Token[]): string | undefined {
  for (const token of tokens) {
    if (token.type === "link" && /^https?:\/\//i.test(token.href)) {
      return token.href;
    }

    if ("tokens" in token && token.tokens) {
      const nestedUrl = findFirstLinkUrl(token.tokens);

      if (nestedUrl) {
        return nestedUrl;
      }
    }
  }

  return undefined;
}

function extractReferenceUrl(markdown: string): string | undefined {
  return findFirstLinkUrl(Lexer.lexInline(markdown, { gfm: true }));
}

function renderFootnoteReference(definition: ExtractedFootnote, referenceId: string): string {
  const label = escapeHtml(definition.label);
  const htmlId = escapeHtml(definition.htmlId);
  const escapedReferenceId = escapeHtml(referenceId);
  const popoverId = `fn-popover-${definition.htmlId}-${referenceId.replace(/^fnref-/, "")}`;
  const href = definition.referenceUrl ? escapeHtml(definition.referenceUrl) : `#fn-${htmlId}`;
  const linkAttributes = definition.referenceUrl
    ? `href="${href}" target="_blank" rel="noopener noreferrer" aria-describedby="${escapeHtml(popoverId)}" aria-label="Öppna referens ${label} i ny flik"`
    : `href="${href}" aria-describedby="${escapeHtml(popoverId)}" aria-label="Visa referens ${label}"`;

  return [
    `<sup id="${escapedReferenceId}" data-footnote-ref>`,
    `<a ${linkAttributes}>${label}</a>`,
    `<span id="${escapeHtml(popoverId)}" role="tooltip" data-footnote-popover>`,
    `<span data-footnote-popover-title>Referens ${label}</span>`,
    `<span data-footnote-popover-body>${definition.html}</span>`,
    "</span>",
    "</sup>",
  ].join("");
}

function renderFootnotesSection(footnotes: ExtractedFootnote[]): string {
  if (footnotes.length === 0) {
    return "";
  }

  const items = footnotes
    .map((footnote) => {
      const label = escapeHtml(footnote.label);
      const htmlId = escapeHtml(footnote.htmlId);
      const labelHtml = footnote.firstReferenceId
        ? `<a href="#${escapeHtml(footnote.firstReferenceId)}" data-footnote-backref aria-label="Tillbaka till fotnot ${label}">${label}</a>`
        : `<span data-footnote-label>${label}</span>`;

      return [
        `<li id="fn-${htmlId}" data-footnote-item>`,
        labelHtml,
        `<span data-footnote-body>${footnote.html}</span>`,
        "</li>",
      ].join("");
    })
    .join("\n");

  return [
    '<section data-footnotes aria-label="Referenser">',
    "<h2>Referenser</h2>",
    "<ol>",
    items,
    "</ol>",
    "</section>",
  ].join("\n");
}

function createFootnoteExtension(footnotesByLabel: Map<string, ExtractedFootnote>): TokenizerAndRendererExtension {
  const referenceCounts = new Map<string, number>();

  return {
    name: "footnoteRef",
    level: "inline",
    start(src) {
      return src.indexOf("[^");
    },
    tokenizer(src) {
      const match = footnoteReferencePattern.exec(src);

      if (!match) {
        return undefined;
      }

      const label = match[1].trim();

      if (!footnotesByLabel.has(label)) {
        return undefined;
      }

      return {
        type: "footnoteRef",
        raw: match[0],
        label,
      };
    },
    renderer(token: Tokens.Generic) {
      const label = String(token.label);
      const footnote = footnotesByLabel.get(label);

      if (!footnote) {
        return token.raw;
      }

      const count = (referenceCounts.get(label) ?? 0) + 1;
      referenceCounts.set(label, count);

      const referenceId = count === 1 ? `fnref-${footnote.htmlId}` : `fnref-${footnote.htmlId}-${count}`;

      if (!footnote.firstReferenceId) {
        footnote.firstReferenceId = referenceId;
      }

      return renderFootnoteReference(footnote, referenceId);
    },
  };
}

// Bumpa när renderingslogiken ändras så att lagrad HTML kan renderas om
// (POST /api/v1/rerender renderar om rader med avvikande version).
export const MARKDOWN_RENDERER_VERSION = 1;

export async function renderBlogMarkdown(markdown: string): Promise<string> {
  const { markdownWithoutFootnotes, footnoteSources } = extractFootnotes(markdown);

  if (footnoteSources.length === 0) {
    const plainRenderer = new Marked({ gfm: true });
    return plainRenderer.parse(markdown);
  }

  const inlineRenderer = new Marked({ gfm: true });
  const usedIds = new Set<string>();
  const footnotes = await Promise.all(
    footnoteSources.map(async (source) => ({
      label: source.label,
      markdown: source.markdown,
      htmlId: toFootnoteId(source.label, usedIds),
      html: await inlineRenderer.parseInline(source.markdown),
      referenceUrl: extractReferenceUrl(source.markdown),
    })),
  );
  const footnotesByLabel = new Map(footnotes.map((footnote) => [footnote.label, footnote]));
  const renderer = new Marked({
    gfm: true,
    extensions: [createFootnoteExtension(footnotesByLabel)],
  });

  const html = await renderer.parse(markdownWithoutFootnotes);
  return `${html}\n${renderFootnotesSection(footnotes)}`;
}
