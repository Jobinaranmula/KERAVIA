import PageHead from "@/components/PageHead";
import Gallery from "@/components/Gallery";
import { getList, getSettings } from "@/lib/data";

export const metadata = { title: "My Gallery" };

export default async function GalleryPage() {
const [s, items] = await Promise.all([
getSettings(),
getList("gallery")
]);

return (
<section className="pg">
<PageHead
title="My Gallery"
intro={s.gallery_intro}
/>

  {items.length === 0 ? (
    <p className="empty">ചിത്രങ്ങൾ ഉടൻ ചേർക്കും.</p>
  ) : (
    <Gallery items={items} />
  )}
</section>

);
}
