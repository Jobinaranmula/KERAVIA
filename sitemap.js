const PAGES = ["", "about", "journey", "projects", "gallery", "memories", "interests", "kerala", "contact"];

export default function sitemap() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (!base) return [];
  return PAGES.map((p) => ({ url: `${base}/${p}`, lastModified: new Date() }));
}
