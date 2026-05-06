// @vitest-environment node

import { describe, expect, it } from "vitest";

import { renderBlogMarkdown } from "./markdown";

describe("renderBlogMarkdown", () => {
  it("renders clickable footnotes with a popover and reference section", async () => {
    const html = await renderBlogMarkdown(
      [
        "Ett beslut enligt artikel 50.[^1]",
        "",
        "[^1]: Europaparlamentets förordning. https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
      ].join("\n"),
    );

    expect(html).toContain('data-footnote-ref');
    expect(html).toContain('href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('data-footnote-popover');
    expect(html).toContain('data-footnotes');
    expect(html).toContain("<h2>Referenser</h2>");
    expect(html).toContain(
      '<a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj">https://eur-lex.europa.eu/eli/reg/2024/1689/oj</a>',
    );
    expect(html).not.toContain("[^1]: Europaparlamentets");
  });

  it("supports hyphenated footnote labels", async () => {
    const html = await renderBlogMarkdown(
      [
        "Samma bedömning gäller flera källor.[^1-5]",
        "",
        "[^1-5]: Samlad hänvisning till källa 1-5.",
      ].join("\n"),
    );

    expect(html).toContain('href="#fn-1-5"');
    expect(html).toContain('id="fn-1-5"');
    expect(html).toContain(">1-5</a>");
  });

  it("uses the first markdown link in a footnote as the click target", async () => {
    const html = await renderBlogMarkdown(
      [
        "Läs mer i rapporten.[^rapport]",
        "",
        "[^rapport]: Se [rapporten](https://example.com/report.pdf) och bakgrundsmaterial.",
      ].join("\n"),
    );

    expect(html).toContain('href="https://example.com/report.pdf"');
    expect(html).toContain('target="_blank"');
  });

  it("does not render footnote markers inside code spans", async () => {
    const html = await renderBlogMarkdown(
      [
        "Skriv `[^1]` i Markdown, men hänvisa i texten.[^1]",
        "",
        "[^1]: Källtext.",
      ].join("\n"),
    );

    expect(html).toContain("<code>[^1]</code>");
    expect(html.match(/data-footnote-ref/g)).toHaveLength(1);
  });
});
