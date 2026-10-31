import PageHead from "@/components/PageHead";
import { getList, getSettings } from "@/lib/data";

export const metadata = {
  title: "My Services",
};

export default async function ServicesPage() {
  const [s, items] = await Promise.all([
    getSettings(),
    getList("services"),
  ]);

  return (
    <section className="pg">
      <PageHead
        title="My Services"
        intro={s.services_intro || "What I can help you with."}
      />

      {items.length === 0 ? (
        <p className="empty">സേവനങ്ങൾ ഉടൻ ചേർക്കും.</p>
      ) : (
        <div className="services-grid">
          {items.map((item, index) => (
            <article className="service-card" key={item.id || index}>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
