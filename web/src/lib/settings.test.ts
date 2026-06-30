// @vitest-environment node
import { describe, expect, it } from "vitest";

import { openDatabase } from "@/lib/db/client";
import { getOrCreateSecret, getSetting, setSetting } from "./settings";

function testDb() {
  return openDatabase(":memory:");
}

describe("settings", () => {
  it("returnerar null för okänd nyckel", () => {
    expect(getSetting("saknas", testDb())).toBeNull();
  });

  it("round-trippar värden", () => {
    const db = testDb();
    setSetting("foo", "bar", db);
    expect(getSetting("foo", db)).toBe("bar");
    setSetting("foo", "baz", db);
    expect(getSetting("foo", db)).toBe("baz");
  });

  it("getOrCreateSecret är stabil över anrop", () => {
    const db = testDb();
    const a = getOrCreateSecret("session_secret", db);
    const b = getOrCreateSecret("session_secret", db);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
