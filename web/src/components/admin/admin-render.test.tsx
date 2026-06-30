// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AreaPicker } from "./AreaPicker";
import { AuthorPicker } from "./AuthorPicker";
import { BarList } from "./BarList";
import { BLOG_CONFIG, MarkdownContentAdmin } from "./MarkdownContentAdmin";
import { StatsDashboard } from "./StatsDashboard";
import { TimeseriesChart } from "./TimeseriesChart";

describe("admin UI render-smoke", () => {
  it("BarList: tomt visar text, fyllt visar etikett", () => {
    expect(renderToStaticMarkup(<BarList items={[]} />)).toContain("Ingen data");
    expect(renderToStaticMarkup(<BarList items={[{ label: "/blogg", value: 5, sub: "3 unika" }]} />)).toContain("/blogg");
  });

  it("TimeseriesChart: tomt och fyllt utan krasch", () => {
    expect(renderToStaticMarkup(<TimeseriesChart points={[]} />)).toContain("Ingen data");
    const html = renderToStaticMarkup(
      <TimeseriesChart points={[{ day: "2026-06-01", pageviews: 3, visitors: 2 }, { day: "2026-06-02", pageviews: 5, visitors: 4 }]} />,
    );
    expect(html).toContain("<svg");
  });

  it("StatsDashboard renderar tomläge utan krasch", () => {
    const html = renderToStaticMarkup(<StatsDashboard />);
    expect(html).toContain("Sidvisningar");
    expect(html).toContain("Exkludera bottar");
  });

  it("MarkdownContentAdmin renderar laddningsläge", () => {
    expect(renderToStaticMarkup(<MarkdownContentAdmin config={BLOG_CONFIG} />)).toContain("Laddar");
  });

  it("AuthorPicker visar expertval och fritext", () => {
    const html = renderToStaticMarkup(
      <AuthorPicker
        experts={[{ slug: "anna", name: "Anna Ek", role: "Analytiker" }]}
        value={{ authorSlug: "anna" }}
        onChange={() => {}}
      />,
    );
    expect(html).toContain("Anna Ek");
    expect(html).toContain("Visningsnamn");
  });

  it("AreaPicker listar områden som kryssrutor", () => {
    const html = renderToStaticMarkup(
      <AreaPicker areas={[{ slug: "digitalisering", name: "Digitalisering" }]} selected={[]} onChange={() => {}} />,
    );
    expect(html).toContain("Digitalisering");
    expect(html).toContain("Välj minst ett område");
  });
});
