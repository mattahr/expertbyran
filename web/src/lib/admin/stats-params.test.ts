// @vitest-environment node
import { describe, expect, it } from "vitest";

import { parseStatsRange, parseVisitQuery } from "./stats-params";

// 2026-06-30T12:00:00Z → Europe/Stockholm-dag 2026-06-30
const NOW = Date.UTC(2026, 5, 30, 12, 0, 0);

describe("parseStatsRange", () => {
  it("default: senaste 30 dagar, exkluderar bottar", () => {
    const r = parseStatsRange(new URLSearchParams(), NOW, null);
    expect(r.to).toBe("2026-06-30");
    expect(r.from).toBe("2026-06-01");
    expect(r.excludeBots).toBe(true);
  });

  it("excludeBots=false respekteras", () => {
    expect(parseStatsRange(new URLSearchParams("excludeBots=false"), NOW, null).excludeBots).toBe(false);
  });

  it("range=all använder earliestDay", () => {
    const r = parseStatsRange(new URLSearchParams("range=all"), NOW, "2025-01-15");
    expect(r.from).toBe("2025-01-15");
    expect(r.to).toBe("2026-06-30");
  });

  it("explicita giltiga datum används; ogiltiga faller till default", () => {
    expect(parseStatsRange(new URLSearchParams("from=2026-03-01&to=2026-03-31"), NOW, null).from).toBe("2026-03-01");
    expect(parseStatsRange(new URLSearchParams("from=skräp"), NOW, null).from).toBe("2026-06-01");
  });
});

describe("parseVisitQuery", () => {
  it("klampar pageSize och page", () => {
    expect(parseVisitQuery(new URLSearchParams("pageSize=999"), NOW, null).pageSize).toBe(200);
    expect(parseVisitQuery(new URLSearchParams("pageSize=0"), NOW, null).pageSize).toBe(1);
    expect(parseVisitQuery(new URLSearchParams("page=0"), NOW, null).page).toBe(1);
  });

  it("plockar filter", () => {
    const q = parseVisitQuery(new URLSearchParams("country=SE&device=mobile&q=foo"), NOW, null);
    expect(q.country).toBe("SE");
    expect(q.device).toBe("mobile");
    expect(q.q).toBe("foo");
    expect(q.path).toBeUndefined();
  });
});
