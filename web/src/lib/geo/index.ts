// web/src/lib/geo/index.ts
//
// Offline IP→land-uppslag mot buntad DB-IP Country Lite (MMDB). Läsaren öppnas
// en gång (förvärms i bootstrap) och cachas; uppslag är synkrona. Svenska
// landsnamn via Intl.DisplayNames (full ICU finns i runtime).

import path from "node:path";

import maxmind, { type CountryResponse } from "maxmind";

// Minimal strukturell läsartyp: maxminds Reader<CountryResponse> är tilldelningsbar
// hit, och testfejk slipper fylla i hela CountryResponse.
type GeoLookup = { country?: { iso_code?: string } | null } | null;
type GeoReader = { get(ip: string): GeoLookup };

let reader: GeoReader | null = null;
let readerPromise: Promise<void> | null = null;
let displayNames: Intl.DisplayNames | null = null;

function dbPath(): string {
  const configured = process.env.GEOIP_DB?.trim();
  if (configured) return configured;
  return path.join(process.cwd(), "geoip", "dbip-country-lite.mmdb");
}

/**
 * Öppnar och cachar MMDB-läsaren. Idempotent och promise-cachad så att
 * samtidiga anrop delar samma laddning. MÅSTE awaitas innan synkrona uppslag
 * (anropas både i bootstrap och i /api/v1/track — Next buntar instrumentation
 * och route-handlers i skilda modulgrafer, så förvärmningen i bootstrap räcker
 * inte för route-instansen).
 */
export async function loadGeo(): Promise<void> {
  if (reader) return;
  if (!readerPromise) {
    readerPromise = maxmind
      .open<CountryResponse>(dbPath())
      .then((opened) => {
        reader = opened;
      })
      .catch((error) => {
        console.error("[geo] kunde inte öppna geo-databasen:", error instanceof Error ? error.message : error);
        reader = null;
      });
  }
  return readerPromise;
}

export function isGeoLoaded(): boolean {
  return reader !== null;
}

/** Endast för test: injicera en fejk-läsare (eller null för att nollställa). */
export function __setGeoReaderForTest(fake: GeoReader | null): void {
  reader = fake;
  readerPromise = fake ? Promise.resolve() : null;
}

const ISO2 = /^[A-Za-z]{2}$/;
// CDN-värdar använder dessa pseudo-koder för okänd/anonym region.
const BOGUS = new Set(["XX", "T1", "ZZ", "O1", "A1", "A2", "AP", "EU"]);

export function swedishCountryName(iso2: string): string {
  const code = iso2.toUpperCase();
  try {
    if (!displayNames) displayNames = new Intl.DisplayNames(["sv"], { type: "region" });
    const name = displayNames.of(code);
    return name && name !== code ? name : code;
  } catch {
    return code;
  }
}

function fromIso(iso: string): { country: string; countryName: string } {
  const code = iso.toUpperCase();
  return { country: code, countryName: swedishCountryName(code) };
}

export function lookupCountry(
  ip: string | null | undefined,
): { country: string; countryName: string } | null {
  if (!reader || !ip) return null;
  let res: GeoLookup;
  try {
    res = reader.get(ip);
  } catch {
    return null;
  }
  const iso = res?.country?.iso_code;
  if (!iso) return null;
  return fromIso(iso);
}

/** Proxy-header (CF-IPCountry m.fl.) först, annars MMDB-uppslag på IP. */
export function resolveCountry(
  headerCountry: string | null | undefined,
  ip: string | null | undefined,
): { country: string; countryName: string } | null {
  if (headerCountry && ISO2.test(headerCountry) && !BOGUS.has(headerCountry.toUpperCase())) {
    return fromIso(headerCountry);
  }
  return lookupCountry(ip);
}
