import PageHead from "@/components/PageHead";
import { getList, getSettings } from "@/lib/data";

export const metadata = {
  title: "Kerala",
};

export const dynamic = "force-dynamic";

export default async function KeralaPage() {
  const [settings, items] = await Promise.all([
    getSettings(),
    getList("kerala_items"),
  ]);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  return (
    <section className="pg">
      <PageHead
        title="Kerala"
        intro={settings.kerala_intro || "കേരളത്തിന്റെ സൗന്ദര്യവും സംസ്കാരവും."}
      />

      <div className="kerala-grid">
        {items.length === 0 ? (
          <p className="empty">
            കേരളത്തെക്കുറിച്ചുള്ള വിവരങ്ങൾ ഉടൻ ചേർക്കും.
          </p>
        ) : (
          items.map((item) => (
            <article className="glass rv" key={item.id}>
              {item.image_path && (
                <img
                  className="content-image"
                  src={`${base}/storage/v1/object/public/media/${item.image_path}`}
                  alt={item.title || "Kerala"}
                />
              )}

              <h3>{item.title}</h3>

              {item.body && <p>{item.body}</p>}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
