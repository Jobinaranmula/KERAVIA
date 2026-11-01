const BASE_URL = "https://keravia.vercel.app";

export default function sitemap() {
  const pages = [
    "",
    "/about",
    "/journey",
    "/projects",
    "/skills",
    "/services",
    "/gallery",
    "/memories",
    "/interests",
    "/kerala",
    "/contact",
  ];

  return pages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
