// web/src/lib/analytics/build-visit.ts
//
// Ren, testbar berikning av en besöksrad. Allt känsligt (IP, UA, tid, geo)
// härleds server-side; klientens payload bidrar bara med presentationskontext.
import crypto from "node:crypto";

import { classifyReferrer } from "@/lib/analytics/referrer";
import { resolveCountry } from "@/lib/geo";
import { applyClientHints, parseUserAgent } from "@/lib/ua/parse";
import type { VisitInsert } from "@/lib/stores/types";
import type { TrackPayload } from "./track-schema";

export interface BuildVisitInput {
  payload: TrackPayload;
  now: number;
  ip: string;
  uaRaw: string | null;
  clientHints: { platform?: string | null; platformVersion?: string | null; mobile?: string | null };
  headerCountry: string | null;
  ownHost: string | null;
  visitorSalt: string;
}

const dayHourFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
});

function localDayHour(now: number): { day: string; hour: number } {
  const parts = dayHourFormat.formatToParts(new Date(now));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = `${get("year")}-${get("month")}-${get("day")}`;
  let hour = parseInt(get("hour"), 10);
  if (!Number.isFinite(hour) || hour === 24) hour = 0; // sv-SE kan emitta "24" vid midnatt
  return { day, hour };
}

export function buildVisit(input: BuildVisitInput): VisitInsert {
  const ua = applyClientHints(parseUserAgent(input.uaRaw), input.clientHints);
  const ref = classifyReferrer(input.payload.referrer ?? null, input.ownHost);
  const geo = resolveCountry(input.headerCountry, input.ip);
  const { day, hour } = localDayHour(input.now);

  const visitorId = crypto
    .createHash("sha256")
    .update(`${input.visitorSalt}|${input.ip}|${input.uaRaw ?? ""}`)
    .digest("hex");

  const utm = input.payload.utm ?? {};
  const languages =
    input.payload.languages && input.payload.languages.length
      ? input.payload.languages.join(",")
      : null;

  return {
    ts: input.now,
    day,
    hour,
    path: input.payload.path,
    referrerFull: input.payload.referrer ?? null,
    referrerHost: ref.host,
    source: ref.source,
    utmSource: utm.source ?? null,
    utmMedium: utm.medium ?? null,
    utmCampaign: utm.campaign ?? null,
    country: geo?.country ?? null,
    countryName: geo?.countryName ?? null,
    ip: input.ip,
    visitorId,
    uaRaw: input.uaRaw,
    browser: ua.browser,
    browserVersion: ua.browserVersion || null,
    os: ua.os,
    osVersion: ua.osVersion || null,
    device: ua.device,
    deviceBrand: ua.deviceBrand ?? null,
    deviceModel: ua.deviceModel ?? null,
    isBot: ua.isBot,
    lang: input.payload.lang ?? null,
    languages,
    timezone: input.payload.timezone ?? null,
    screenW: input.payload.screen?.w ?? null,
    screenH: input.payload.screen?.h ?? null,
    viewportW: input.payload.viewport?.w ?? null,
    viewportH: input.payload.viewport?.h ?? null,
    dpr: input.payload.dpr ?? null,
  };
}
