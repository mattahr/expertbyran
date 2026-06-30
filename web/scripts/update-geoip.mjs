// web/scripts/update-geoip.mjs
//
// Uppdaterar den buntade DB-IP Country Lite-databasen. Körs manuellt vid behov:
//   node scripts/update-geoip.mjs
//
// DB-IP publicerar gratis månadsfiler under CC BY 4.0 (attribuering i NOTICE).
// Vi provar innevarande och ett par föregående månader eftersom den nyaste
// kan saknas tidigt i månaden.
import { createWriteStream } from "node:fs";
import { rename } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";

const OUT = path.join(import.meta.dirname, "..", "geoip", "dbip-country-lite.mmdb");

function monthCandidates() {
  const now = new Date();
  const out = [];
  for (let back = 0; back < 3; back++) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

for (const month of monthCandidates()) {
  const url = `https://download.db-ip.com/free/dbip-country-lite-${month}.mmdb.gz`;
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    console.log(`hoppar ${month} (HTTP ${res.status})`);
    continue;
  }
  const tmp = `${OUT}.tmp`;
  await pipeline(Readable.fromWeb(res.body), createGunzip(), createWriteStream(tmp));
  await rename(tmp, OUT);
  console.log(`uppdaterade ${OUT} från ${month}`);
  process.exit(0);
}

console.error("kunde inte hämta någon DB-IP-fil");
process.exit(1);
