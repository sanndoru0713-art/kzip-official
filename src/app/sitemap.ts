import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import { insights } from "@/data/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");

  const staticPages = [
    "",
    "/about",
    "/services",
    "/projects",
    "/global",
    "/insights",
    "/contact",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const servicePages = services.map((service) => ({
    url: `${base}/services/${service.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const projectPages = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const insightPages = insights.map((post) => ({
    url: `${base}/insights/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...servicePages, ...projectPages, ...insightPages];
}
