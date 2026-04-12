import { z } from "zod";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara en giltig ISO-tidsstämpel.",
  });

const externalHrefSchema = z
  .string()
  .url("Länken måste vara en giltig URL.")
  .refine((value) => /^https?:\/\//.test(value), "Länken måste använda http eller https.");

const internalOrExternalHrefSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//.test(value),
    "Länken måste vara intern eller en fullständig http(s)-URL.",
  );

const repositoryPathSchema = z
  .string()
  .min(1)
  .refine(
    (value) => !value.startsWith("/") && !value.includes(".."),
    "Repository path måste vara relativ och får inte innehålla '..'.",
  );

const contactLinkTypeSchema = z.enum(["email", "calendar", "linkedin", "website"]);

const contactLinkSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    type: contactLinkTypeSchema,
    url: z.string().min(1),
    description: z.string().min(1),
  })
  .superRefine((link, ctx) => {
    if (link.type === "email" && !link.url.startsWith("mailto:")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "E-postlänkar måste använda mailto:.",
      });
    }

    if (link.type !== "email" && !/^https?:\/\//.test(link.url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "Direkta kontaktlänkar måste använda http eller https.",
      });
    }
  });

const metricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().min(1).optional(),
});

const structureBlockSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const richListItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const featuredCaseSchema = z.object({
  title: z.string().min(1),
  client: z.string().min(1),
  period: z.string().min(1),
  summary: z.string().min(1),
  impact: z.string().min(1),
});

const experienceItemSchema = z.object({
  title: z.string().min(1),
  organization: z.string().min(1),
  period: z.string().min(1),
  summary: z.string().min(1),
});

const pluginMetadataSchema = z.object({
  name: slugSchema,
  repositoryPath: repositoryPathSchema,
  repositoryUrl: externalHrefSchema,
  marketplaceListed: z.boolean(),
  version: z.string().min(1),
});

const githubInstallSourceSchema = z.object({
  source: z.literal("github"),
  repo: z
    .string()
    .regex(/^[^/\s]+\/[^/\s]+$/, "GitHub-källan måste anges som owner/repo."),
  ref: z.string().min(1).optional(),
  path: repositoryPathSchema.optional(),
});

const gitInstallSourceSchema = z.object({
  source: z.literal("git"),
  url: externalHrefSchema,
  ref: z.string().min(1).optional(),
  path: repositoryPathSchema.optional(),
});

const urlInstallSourceSchema = z.object({
  source: z.literal("url"),
  url: externalHrefSchema,
});

const npmInstallSourceSchema = z.object({
  source: z.literal("npm"),
  package: z.string().min(1),
  version: z.string().min(1).optional(),
});

const installSourceSchema = z.discriminatedUnion("source", [
  githubInstallSourceSchema,
  gitInstallSourceSchema,
  urlInstallSourceSchema,
  npmInstallSourceSchema,
]);

const areaSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  sortOrder: z.number().int().nonnegative(),
  featured: z.boolean(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Accent måste vara en hex-färg."),
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  signals: z.array(z.string().min(1)).min(2),
  deliverables: z.array(z.string().min(1)).min(2),
});

const expertSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  sortOrder: z.number().int().nonnegative(),
  featured: z.boolean(),
  name: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  availability: z.string().min(1),
  areaSlugs: z.array(slugSchema).min(1),
  summary: z.string().min(1),
  profileQuote: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(3),
  metrics: z.array(metricSchema).min(2),
  selectedEngagements: z.array(featuredCaseSchema).min(2),
  experience: z.array(experienceItemSchema).min(2),
  knowledge: z.array(z.string().min(1)).min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  tools: z.array(z.string().min(1)).min(3),
  methods: z.array(z.string().min(1)).min(3),
  contactLinks: z.array(contactLinkSchema).min(2),
  plugin: pluginMetadataSchema,
});

const teamSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  sortOrder: z.number().int().nonnegative(),
  featured: z.boolean(),
  name: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  promptSummary: z.string().min(1),
  expertSlugs: z.array(slugSchema).min(1),
  plugin: pluginMetadataSchema,
});

const marketplaceSchema = z.object({
  name: slugSchema,
  repositoryUrl: externalHrefSchema,
  marketplaceJsonUrl: externalHrefSchema,
  installSource: installSourceSchema,
  description: z.string().min(1),
});

export const pluginSyncSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: isoDateTimeSchema,
  marketplace: marketplaceSchema,
  experts: z.array(
    z.object({
      slug: slugSchema,
      name: z.string().min(1),
      plugin: pluginMetadataSchema,
    }),
  ),
  teams: z.array(
    z.object({
      slug: slugSchema,
      name: z.string().min(1),
      expertSlugs: z.array(slugSchema).min(1),
      plugin: pluginMetadataSchema,
    }),
  ),
});

export const siteDataSchema = z
  .object({
    version: z.number().int().positive(),
    updatedAt: isoDateTimeSchema,
    site: z.object({
      name: z.string().min(1),
      tagline: z.string().min(1),
      description: z.string().min(1),
      hero: z.object({
        eyebrow: z.string().min(1),
        title: z.string().min(1),
        intro: z.string().min(1),
        primaryCta: z.object({
          label: z.string().min(1),
          href: internalOrExternalHrefSchema,
        }),
        secondaryCta: z.object({
          label: z.string().min(1),
          href: internalOrExternalHrefSchema,
        }),
      }),
      principles: z.array(z.string().min(1)).min(3),
    }),
    organization: z.object({
      heading: z.string().min(1),
      summary: z.string().min(1),
      modelTitle: z.string().min(1),
      modelDescription: z.string().min(1),
      structure: z.array(structureBlockSchema).min(3),
      operations: z.array(metricSchema).min(3),
      workflow: z.array(richListItemSchema).min(3),
    }),
    marketplace: marketplaceSchema,
    expertAreas: z.array(areaSchema).min(1),
    teams: z.array(teamSchema).min(1),
    experts: z.array(expertSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const areaIds = new Set<string>();
    const areaSlugs = new Set<string>();
    const expertIds = new Set<string>();
    const expertSlugs = new Set<string>();
    const teamIds = new Set<string>();
    const teamSlugs = new Set<string>();
    const pluginNames = new Set<string>();
    const repositoryPaths = new Set<string>();

    data.expertAreas.forEach((area, index) => {
      if (areaIds.has(area.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expertAreas", index, "id"],
          message: "Expertområdes-ID måste vara unikt.",
        });
      }

      if (areaSlugs.has(area.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expertAreas", index, "slug"],
          message: "Expertområdesslug måste vara unik.",
        });
      }

      areaIds.add(area.id);
      areaSlugs.add(area.slug);
    });

    data.experts.forEach((expert, index) => {
      if (expertIds.has(expert.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["experts", index, "id"],
          message: "Expert-ID måste vara unikt.",
        });
      }

      if (expertSlugs.has(expert.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["experts", index, "slug"],
          message: "Expertslug måste vara unik.",
        });
      }

      expert.areaSlugs.forEach((slug, slugIndex) => {
        if (!areaSlugs.has(slug)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["experts", index, "areaSlugs", slugIndex],
            message: `Okänt expertområde: ${slug}.`,
          });
        }
      });

      if (pluginNames.has(expert.plugin.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["experts", index, "plugin", "name"],
          message: "Pluginnamn måste vara unikt mellan experter och team.",
        });
      }

      if (repositoryPaths.has(expert.plugin.repositoryPath)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["experts", index, "plugin", "repositoryPath"],
          message: "Repository path måste vara unik mellan experter och team.",
        });
      }

      pluginNames.add(expert.plugin.name);
      repositoryPaths.add(expert.plugin.repositoryPath);
      expertIds.add(expert.id);
      expertSlugs.add(expert.slug);
    });

    data.teams.forEach((team, index) => {
      if (teamIds.has(team.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["teams", index, "id"],
          message: "Team-ID måste vara unikt.",
        });
      }

      if (teamSlugs.has(team.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["teams", index, "slug"],
          message: "Teamslug måste vara unik.",
        });
      }

      if (pluginNames.has(team.plugin.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["teams", index, "plugin", "name"],
          message: "Pluginnamn måste vara unikt mellan experter och team.",
        });
      }

      if (repositoryPaths.has(team.plugin.repositoryPath)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["teams", index, "plugin", "repositoryPath"],
          message: "Repository path måste vara unik mellan experter och team.",
        });
      }

      const seenExpertSlugs = new Set<string>();

      team.expertSlugs.forEach((slug, slugIndex) => {
        if (!expertSlugs.has(slug)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["teams", index, "expertSlugs", slugIndex],
            message: `Okänd expert: ${slug}.`,
          });
        }

        if (seenExpertSlugs.has(slug)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["teams", index, "expertSlugs", slugIndex],
            message: "En expert får bara förekomma en gång i samma team.",
          });
        }

        seenExpertSlugs.add(slug);
      });

      pluginNames.add(team.plugin.name);
      repositoryPaths.add(team.plugin.repositoryPath);
      teamIds.add(team.id);
      teamSlugs.add(team.slug);
    });
  });

export type SiteData = z.infer<typeof siteDataSchema>;
export type ExpertArea = SiteData["expertAreas"][number];
export type Expert = SiteData["experts"][number];
export type Team = SiteData["teams"][number];
export type Marketplace = SiteData["marketplace"];
export type InstallSource = z.infer<typeof installSourceSchema>;
export type PluginMetadata = z.infer<typeof pluginMetadataSchema>;
export type ContactLink = z.infer<typeof contactLinkSchema>;
export type Metric = z.infer<typeof metricSchema>;

export function formatIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
