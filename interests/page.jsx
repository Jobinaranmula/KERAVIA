import PageHead from "@/components/PageHead";
import { getList, getSettings } from "@/lib/data";

export const metadata = { title: "My Interests" };

export default async function Interests() {
const [s, items] = await Promise.all([getSettings(), getList("interests")]);
return (
<section className="pg">
<PageHead title="My Interests" intro={s.interests_intro} />
<div className="chips">
{items.length === 0 && <p className="empty">ഇഷ്ടങ്ങൾ ഉടൻ ചേർക്കും.</p>}
{items.map((i) => (
<div key={i.id} className="glass chip tilt rv">
<b>{i.name}</b>
{i.description ? <small>{i.description}</small> : null}
</div>
))}
</div>
</section>
);
}
