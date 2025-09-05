import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.baseUrl;

  const urls: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  for (const { slug } of source.generateParams()) {
    const path = Array.isArray(slug) ? `/${slug.join("/")}` : "/";
    if (path === "/") {
      continue;
    }
    urls.push({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return urls;
}
