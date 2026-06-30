import { afterEach, describe, expect, it } from "vitest";

import { __setGeoReaderForTest, lookupCountry, resolveCountry, swedishCountryName } from "./index";

const fakeReader = {
  get(ip: string) {
    if (ip === "8.8.8.8") return { country: { iso_code: "US" } };
    if (ip === "193.13.0.1") return { country: { iso_code: "SE" } };
    return null;
  },
};

afterEach(() => __setGeoReaderForTest(null));

describe("lookupCountry", () => {
  it("slår upp land och svenskt namn", () => {
    __setGeoReaderForTest(fakeReader);
    expect(lookupCountry("8.8.8.8")).toEqual({ country: "US", countryName: "USA" });
    expect(lookupCountry("193.13.0.1")).toEqual({ country: "SE", countryName: "Sverige" });
  });

  it("okänd eller tom IP → null", () => {
    __setGeoReaderForTest(fakeReader);
    expect(lookupCountry("1.1.1.1")).toBeNull();
    expect(lookupCountry("")).toBeNull();
    expect(lookupCountry(null)).toBeNull();
  });

  it("utan laddad läsare → null", () => {
    __setGeoReaderForTest(null);
    expect(lookupCountry("8.8.8.8")).toBeNull();
  });
});

describe("resolveCountry", () => {
  it("använder proxy-header som snabbväg (versaliserad)", () => {
    __setGeoReaderForTest(null); // ingen MMDB → bevisar att headern används
    expect(resolveCountry("se", "1.2.3.4")).toEqual({ country: "SE", countryName: "Sverige" });
  });

  it("ignorerar pseudokoder och faller till MMDB", () => {
    __setGeoReaderForTest(fakeReader);
    expect(resolveCountry("XX", "8.8.8.8")).toEqual({ country: "US", countryName: "USA" });
    expect(resolveCountry("T1", "193.13.0.1")).toEqual({ country: "SE", countryName: "Sverige" });
  });

  it("ogiltig header och okänd IP → null", () => {
    __setGeoReaderForTest(fakeReader);
    expect(resolveCountry("sweden", "10.0.0.1")).toBeNull();
  });
});

describe("swedishCountryName", () => {
  it("översätter ISO2 till svenskt namn", () => {
    expect(swedishCountryName("GB")).toBe("Storbritannien");
    expect(swedishCountryName("DE")).toBe("Tyskland");
  });
});
