export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    ...(base ? { sitemap: `${base.replace(/\/$/, "")}/sitemap.xml` } : {}),
  };
}
