import PageHead from "@/components/PageHead";
import { getList, getSettings } from "@/lib/data";

export const metadata = { title: "My Projects" };

export default async function Projects() {
const [s, items] = await Promise.all([
getSettings(),
getList("projects")
]);

return (
<section className="pg">
<PageHead
title="My Projects"
intro={s.projects_intro}
/>

  <div className="project-grid">
    {items.length === 0 && (
      <p className="empty">പുതിയ പ്രോജക്ടുകൾ ഉടൻ ചേർക്കും.</p>
    )}

    {items.map((i) => (
      <article key={i.id} className="glass tilt rv">
        <h3>{i.title}</h3>
        {i.description ? (
          <p>{i.description}</p>
        ) : null}
      </article>
    ))}
  </div>
</section>

);
}
