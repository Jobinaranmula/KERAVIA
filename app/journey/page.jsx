import PageHead from "@/components/PageHead";
import { getList, getSettings } from "@/lib/data";

export const metadata = { title: "My Journey" };

export default async function Journey() {
const [s, items] = await Promise.all([
getSettings(),
getList("journey")
]);

return (
<section className="pg">
<PageHead
title="My Journey"
intro={s.journey_intro}
/>

  <div className="timeline">
    {items.length === 0 && (
      <p className="empty">എന്റെ യാത്രയിലെ ഓർമ്മകൾ ഉടൻ ചേർക്കും.</p>
    )}

    {items.map((i) => (
      <article key={i.id} className="glass tilt rv">
        <small>{i.year}</small>
        <h3>{i.title}</h3>
        {i.body ? <p>{i.body}</p> : null}
      </article>
    ))}
  </div>
</section>

);
}
