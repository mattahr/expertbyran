import { describe, expect, it } from "vitest";

import { containsFootnotes } from "./footnotes";

describe("containsFootnotes", () => {
  it("är sant när en fotnotsdefinition finns", () => {
    expect(containsFootnotes("Text.[^1]\n\n[^1]: Källa.")).toBe(true);
  });

  it("hittar definition mitt i dokumentet", () => {
    expect(containsFootnotes("# Rubrik\n\nStycke.[^a]\n\n[^a]: Not.\n")).toBe(true);
  });

  it("är falskt för enbart en referens utan definition", () => {
    expect(containsFootnotes("Här står [^1] men ingen definition.")).toBe(false);
  });

  it("är falskt för vanlig markdown", () => {
    expect(containsFootnotes("# Rubrik\n\n- punkt\n\n**fet**")).toBe(false);
  });

  it("är falskt för tom sträng", () => {
    expect(containsFootnotes("")).toBe(false);
  });
});
