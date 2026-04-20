import type { MetadataRoute } from "next";

import { robotsTxtRules } from "@/lib/robots-policy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: robotsTxtRules,
  };
}
