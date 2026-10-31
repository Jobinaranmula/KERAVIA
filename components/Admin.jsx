"use client";

import { useCallback, useEffect, useState } from "react";
import { sb, fileUrl } from "@/lib/supabase";
import { compress, upload, removeFile } from "@/lib/upload";

/* ---------- configuration ---------- */
const SETTINGS = [
  ["owner_name", "പേര് (Owner name)", "text"],
  ["hero_subtitle", "Home — സ്വാഗത വാചകം", "area"],
  ["about_text", "About Me", "area"],
  ["journey_intro", "Journey — ആമുഖം", "area"],
  ["projects_intro", "Projects — ആമുഖം", "area"],
  ["gallery_intro", "Gallery — ആമുഖം", "area"],
  ["memories_intro", "Memories — ആമുഖം", "area"],
  ["interests_intro", "Interests — ആമുഖം", "area"],
  ["kerala_intro", "Kerala — ആമുഖം", "area"],
  ["contact_intro", "Contact — ആമുഖം", "area"],
  ["contact_email", "Contact ഇമെയിൽ (പേജിൽ കാണിക്കും)", "text"],
  ["footer_text", "Footer വാചകം", "text"],
  ["seo_description", "SEO / Google വിവരണം", "area"],
];

const f = (k, l, t = "text", req = false) => ({ k, l, t, req });
const CRUD = {
  journey: { fields: [f("year", "വർഷം"), f("title", "ശീർഷകം", "text", true), f("body", "വിവരണം", "area")], img: false },
  projects: { fields: [f("title", "ശീർഷകം", "text", true), f("description", "വിവരണം", "area"), f("url", "ലിങ്ക് (https://…)")], img: true },
  memories: { fields: [f("date_label", "തീയതി / വർഷം"), f("title", "ശീർഷകം", "text", true), f("body", "ഓർമ്മ", "area")], img: true },
  interests: { fields: [f("name", "ഇഷ്ടം", "text", true), f("description", "വിവരണം", "area")], img: false },
  kerala_items: { fields: [f("title", "ശീർഷകം", "text", true), f("body", "വിവരണം", "area")], img: true },
};

const TABS = [
  ["settings", "Home / About / Texts"],
  ["journey", "Journey"],
  ["projects", "Projects"],
  ["media", "Gallery"],
  ["memories", "Memories"],
  ["interests", "Interests"],
  ["kerala_items", "Kerala"],
  ["messages", "Messages"],
];

/* ---------- root: auth state ---------- */
export default function Admin() {
  const [state, setState] = useState("loading"); // loading | noenv | out | denied | in
  const [tab, setTab] = useState("settings");

  const check = useCallback(async (session) => {
    if (!session) return setState("out");
    // RLS lets a user read only their own row in "admins"
    const { data, error } = await sb().from("admins").select("user_id").maybeSingle();
    setState(!error && data ? "in" : "denied");
  }, []);

  useEffect(() => {
    let client;
    try {
      client = sb();
    } catch {
      setState("noenv");
      return;
    }
    client.auth.getSession().then(({ data }) => check(data.session));
    const { data } = client.auth.onAuthStateChange((_e, session) => {
      // do not await Supabase calls directly inside this callback
      setTimeout(() => check(session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [check]);

  const logout = () => sb().auth.signOut();

  if (state === "loading") return <p className="empty">Loading…</p>;
  if (state === "noenv")
    return <p className="glass formbox err">Supabase environment variables ഇല്ല. README-യിലെ ഘട്ടം കാണുക.</p>;
  if (state === "out") return <Login />;
  if (state === "denied")
    return (
      <div className="glass formbox">
        <p className="err">ഈ അക്കൗണ്ടിന് Admin അനുമതി ഇല്ല.</p>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    );

  return (
    <>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <button className="btn sm" onClick={logout}>Logout</button>
      </div>
      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="glass">
        {tab === "settings" && <SettingsEditor />}
        {CRUD[tab] && <Crud key={tab} table={tab} cfg={CRUD[tab]} />}
        {tab === "media" && <MediaManager />}
        {tab === "messages" && <Messages />}
      </div>
    </>
  );
}

/* ---------- login ---------- */
function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await sb().auth.signInWithPassword({ email: email.trim(), password: pw });
    if (error) setMsg("ലോഗിൻ പരാജയപ്പെട്ടു. ഇമെയിലും പാസ്‌വേഡും പരിശോധിക്കുക.");
    setBusy(false);
  }

  return (
    <form className="glass formbox" onSubmit={go}>
      <h3>Admin Login</h3>
      <label htmlFor="a-e">Email</label>
      <input id="a-e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
      <label htmlFor="a-p">Password</label>
      <input id="a-p" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete="current-password" />
      <button className="btn fill" type="submit" disabled={busy}>{busy ? "…" : "Login"}</button>
      <div className="msg err" role="status">{msg}</div>
    </form>
  );
}

/* ---------- page texts ---------- */
function SettingsEditor() {
  const [vals, setVals] = useState({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb()
      .from("site_settings")
      .select("key,value")
      .then(({ data, error }) => {
        if (error) setMsg("പിശക്: " + error.message);
        else setVals(Object.fromEntries((data || []).map((r) => [r.key, r.value])));
      });
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const rows = SETTINGS.map(([k]) => ({ key: k, value: (vals[k] || "").trim() }));
    const { error } = await sb().from("site_settings").upsert(rows, { onConflict: "key" });
    setMsg(error ? "പിശക്: " + error.message : "സേവ് ചെയ്തു ✓");
    setBusy(false);
  }

  return (
    <form onSubmit={save}>
      <h3>Home, About & പേജ് ടെക്സ്റ്റുകൾ</h3>
      {SETTINGS.map(([k, label, t]) => (
        <div key={k}>
          <label htmlFor={"s-" + k}>{label}</label>
          {t === "area" ? (
            <textarea id={"s-" + k} value={vals[k] || ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
          ) : (
            <input id={"s-" + k} value={vals[k] || ""} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
          )}
        </div>
      ))}
      <button className="btn fill" type="submit" disabled={busy}>Save</button>
      <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>{msg}</div>
    </form>
  );
}

/* ---------- generic add / edit / delete / reorder ---------- */
function Crud({ table, cfg }) {
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null); // null = list only, {} = new, row = editing
  const [vals, setVals] = useState({});
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const titleKey = (cfg.fields.find((x) => x.req) || cfg.fields[0]).k;

  const load = useCallback(async () => {
    const { data, error } = await sb().from(table).select("*").order("sort_order").order("created_at");
    if (error) setMsg("പിശക്: " + error.message);
    else setRows(data || []);
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  function start(r) {
    setEdit(r || {});
    setVals(r ? { ...r } : {});
    setFile(null);
    setMsg("");
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    let newPath = null;
    try {
      const o = {};
      cfg.fields.forEach((x) => (o[x.k] = (vals[x.k] || "").trim()));
      const must = cfg.fields.find((x) => x.req);
      if (must && !o[must.k]) throw new Error(must.l + " വേണം");
      if (o.url && !/^https?:\/\//i.test(o.url)) throw new Error("ലിങ്ക് http:// അല്ലെങ്കിൽ https:// ൽ തുടങ്ങണം");
      if (cfg.img && file) {
        newPath = await upload(table, await compress(file));
        o.image_path = newPath;
      }
      if (edit.id) {
        const { error } = await sb().from(table).update(o).eq("id", edit.id);
        if (error) throw error;
        if (newPath && edit.image_path) await removeFile(edit.image_path);
      } else {
        o.sort_order = rows.reduce((m, r) => Math.max(m, r.sort_order || 0), 0) + 1;
        const { error } = await sb().from(table).insert(o);
        if (error) throw error;
      }
      setEdit(null);
      await load();
      setMsg("സേവ് ചെയ്തു ✓");
    } catch (x) {
      if (newPath) await removeFile(newPath).catch(() => {});
      setMsg("പിശക്: " + (x.message || x));
    }
    setBusy(false);
  }

  async function del(r) {
    if (!confirm("ഇത് ഒഴിവാക്കണോ?")) return;
    const { error } = await sb().from(table).delete().eq("id", r.id);
    if (error) return setMsg("പിശക്: " + error.message);
    await removeFile(r.image_path);
    load();
  }

  async function move(i, d) {
    if (!rows[i + d]) return;
    const arr = [...rows];
    [arr[i], arr[i + d]] = [arr[i + d], arr[i]];
    await Promise.all(
      arr.map((r, k) => (r.sort_order === k + 1 ? null : sb().from(table).update({ sort_order: k + 1 }).eq("id", r.id)))
    );
    load();
  }

  if (edit) {
    return (
      <form onSubmit={save}>
        <h3>{edit.id ? "തിരുത്തുക" : "പുതിയത് ചേർക്കുക"}</h3>
        {cfg.fields.map((x) => (
          <div key={x.k}>
            <label htmlFor={"c-" + x.k}>{x.l}</label>
            {x.t === "area" ? (
              <textarea id={"c-" + x.k} value={vals[x.k] || ""} onChange={(e) => setVals({ ...vals, [x.k]: e.target.value })} />
            ) : (
              <input id={"c-" + x.k} value={vals[x.k] || ""} onChange={(e) => setVals({ ...vals, [x.k]: e.target.value })} />
            )}
          </div>
        ))}
        {cfg.img && (
          <>
            <label htmlFor="c-img">ചിത്രം (ഓപ്ഷണൽ){edit.image_path ? " — പുതിയത് തിരഞ്ഞെടുത്താൽ മാറും" : ""}</label>
            {edit.image_path && <img src={fileUrl(edit.image_path)} alt="" style={{ width: 120, borderRadius: 8, marginBottom: 8 }} />}
            <input id="c-img" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files[0] || null)} />
          </>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button className="btn fill" style={{ margin: 0 }} type="submit" disabled={busy}>{busy ? "…" : "Save"}</button>
          <button className="btn" style={{ margin: 0 }} type="button" onClick={() => setEdit(null)}>Cancel</button>
        </div>
        <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>{msg}</div>
      </form>
    );
  }

  return (
    <div>
      <button className="btn fill" style={{ marginTop: 0 }} onClick={() => start(null)}>+ പുതിയത്</button>
      <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>{msg}</div>
      {rows.length === 0 && <p className="empty" style={{ marginTop: 10 }}>ഒന്നും ചേർത്തിട്ടില്ല.</p>}
      {rows.map((r, i) => (
        <div className="row" key={r.id}>
          {r.image_path ? <img src={fileUrl(r.image_path)} alt="" /> : null}
          <div className="grow"><b>{r[titleKey]}</b></div>
          <div className="acts">
            <button className="btn sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Up">↑</button>
            <button className="btn sm" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="Down">↓</button>
            <button className="btn sm" onClick={() => start(r)}>തിരുത്തുക</button>
            <button className="btn sm danger" onClick={() => del(r)}>ഒഴിവാക്കുക</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- photos & videos ---------- */
function MediaManager() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb().from("media").select("*").order("sort_order", { ascending: false }).order("created_at", { ascending: false });
    if (error) setMsg("പിശക്: " + error.message);
    else setRows(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    let done = 0;
    let top = rows.reduce((m, r) => Math.max(m, r.sort_order || 0), 0);
    for (const file of files) {
      setMsg(`അപ്‌ലോഡ് ചെയ്യുന്നു… ${done + 1} / ${files.length}`);
      let path = null;
      try {
        const kind = file.type.startsWith("video/") ? "video" : "image";
        path = await upload("gallery", kind === "image" ? await compress(file) : file);
        const { error } = await sb().from("media").insert({ kind, path, caption: "", sort_order: ++top });
        if (error) throw error;
        done++;
      } catch (x) {
        if (path) await removeFile(path).catch(() => {});
        setMsg(`പിശക് (${file.name}): ` + (x.message || x));
        setBusy(false);
        load();
        return;
      }
    }
    setMsg(`${done} ഫയൽ ചേർത്തു ✓`);
    setBusy(false);
    load();
  }

  async function saveCaption(r, caption) {
    if (caption === r.caption) return;
    const { error } = await sb().from("media").update({ caption }).eq("id", r.id);
    setMsg(error ? "പിശക്: " + error.message : "Caption സേവ് ചെയ്തു ✓");
  }

  async function del(r) {
    if (!confirm("ഈ ഫയൽ ഒഴിവാക്കണോ?")) return;
    const { error } = await sb().from("media").delete().eq("id", r.id);
    if (error) return setMsg("പിശക്: " + error.message);
    await removeFile(r.path);
    load();
  }

  return (
    <div>
      <h3>ഫോട്ടോ / വീഡിയോ അപ്‌ലോഡ്</h3>
      <label htmlFor="m-f">ഫയലുകൾ (jpg, png, webp, gif, mp4, webm — ഒന്നിലധികം തിരഞ്ഞെടുക്കാം)</label>
      <input id="m-f" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={onFiles} disabled={busy} />
      <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>{msg}</div>
      <div className="mgrid">
        {rows.map((r) => (
          <div className="mcard" key={r.id}>
            {r.kind === "video" ? <video src={fileUrl(r.path)} muted playsInline preload="metadata" /> : <img src={fileUrl(r.path)} alt={r.caption} loading="lazy" />}
            <input defaultValue={r.caption} placeholder="Caption" maxLength={200} onBlur={(e) => saveCaption(r, e.target.value.trim())} />
            <button className="btn sm danger" onClick={() => del(r)}>ഒഴിവാക്കുക</button>
          </div>
        ))}
      </div>
      {rows.length === 0 && <p className="empty">ഒന്നും അപ്‌ലോഡ് ചെയ്തിട്ടില്ല.</p>}
    </div>
  );
}

/* ---------- contact messages ---------- */
function Messages() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await sb().from("messages").select("*").order("created_at", { ascending: false });
    if (error) setMsg("പിശക്: " + error.message);
    else setRows(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(r) {
    await sb().from("messages").update({ is_read: !r.is_read }).eq("id", r.id);
    load();
  }
  async function del(r) {
    if (!confirm("സന്ദേശം ഒഴിവാക്കണോ?")) return;
    await sb().from("messages").delete().eq("id", r.id);
    load();
  }

  return (
    <div>
      <h3>സന്ദേശങ്ങൾ</h3>
      <div className="msg err">{msg}</div>
      {rows.length === 0 && <p className="empty">സന്ദേശങ്ങളില്ല.</p>}
      {rows.map((r) => (
        <div className="row" key={r.id} style={{ opacity: r.is_read ? 0.6 : 1 }}>
          <div className="grow">
            <b>{r.name}</b> · <a href={`mailto:${r.email}`}>{r.email}</a>
            <div className="yr">{new Date(r.created_at).toLocaleString()}</div>
            <p style={{ whiteSpace: "pre-line" }}>{r.body}</p>
          </div>
          <div className="acts">
            <button className="btn sm" onClick={() => toggle(r)}>{r.is_read ? "Unread" : "Mark read"}</button>
            <button className="btn sm danger" onClick={() => del(r)}>ഒഴിവാക്കുക</button>
          </div>
        </div>
      ))}
    </div>
  );
}
