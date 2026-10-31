import PageHead from "@/components/PageHead";
import { getList, getSettings } from "@/lib/data";

export const metadata = {
  title: "My Skills",
};

export default async function SkillsPage() {
  const [s, items] = await Promise.all([
    getSettings(),
    getList("skills"),
  ]);

  return (
    <section className="pg">
      <PageHead
        title="My Skills"
        intro={s.skills_intro || "Things I have learned and enjoy working with."}
      />

      {items.length === 0 ? (
        <p className="empty">കഴിവുകൾ ഉടൻ ചേർക്കും.</p>
      ) : (
        <div className="skills-grid">
          {items.map((item, index) => (
            <div className="skill-card" key={item.id || index}>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
