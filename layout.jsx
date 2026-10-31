import "./globals.css";
import Shell from "@/components/Shell";
import { getSettings } from "@/lib/data";

// Content is edited by the admin at any time, so pages are always rendered fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSettings();
  const description =
    s.seo_description ||
    "KERAVIA — Jobin Skariah-ന്റെ വ്യക്തിഗത വെബ്സൈറ്റ്. MY ROOTS. MY WORLD.";
  return {
    title: {
      default: "KERAVIA — Jobin Skariah | MY ROOTS. MY WORLD.",
      template: "%s | KERAVIA",
    },
    description,
    openGraph: {
      title: "KERAVIA — MY ROOTS. MY WORLD.",
      description,
      type: "website",
      siteName: "KERAVIA",
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b2218",
};

export default async function RootLayout({ children }) {
  const s = await getSettings();
  return (
    <html lang="ml">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <style>{".rv{opacity:1!important;transform:none!important}.ld{display:none!important}.hero h1 span,.tag,.sub,.hero .btn{opacity:1!important;transform:none!important;filter:none!important}"}</style>
        </noscript>
      </head>
      <body>
        <Shell footer={s.footer_text || "MY ROOTS. MY WORLD."} owner={s.owner_name || "Jobin Skariah"}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
