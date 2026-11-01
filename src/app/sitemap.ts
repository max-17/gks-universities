import type { MetadataRoute } from "next";
import { db } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const universities = await db.university.findMany({
    select: {
      id: true,
      updatedAt: true,
      programs: {
        select: { updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...universities.map((university) => ({
      url: `${siteUrl}/universities/${university.id}`,
      lastModified: new Date(
        Math.max(
          university.updatedAt.getTime(),
          university.programs[0]?.updatedAt.getTime() ?? 0,
        ),
      ),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
