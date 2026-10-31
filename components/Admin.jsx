"use client";

import { useCallback, useEffect, useState } from "react";
import { sb, fileUrl } from "@/lib/supabase";
import { compress, upload, removeFile } from "@/lib/upload";

/* SETTINGS */
const SETTINGS = [
  ["owner_name", "പേര് (Owner name)", "text"],
  ["home_intro", "Home — സ്വാഗത വാചകം", "area"],
  ["about_text", "About Me", "area"],
  ["journey_intro", "Journey — ആമുഖം", "area"],
  ["projects_intro", "Projects — ആമുഖം", "area"],
  ["skills_intro", "Skills — ആമുഖം", "area"],
  ["services_intro", "Services — ആമുഖം", "area"],
  ["gallery_intro", "Gallery — ആമുഖം", "area"],
  ["memories_intro", "Memories — ആമുഖം", "area"],
  ["interests_intro", "Interests — ആമുഖം", "area"],
  ["kerala_intro", "Kerala — ആമുഖം", "area"],
  ["contact_intro", "Contact — ആമുഖം", "area"],
  ["contact_email", "Contact ഇമെയിൽ", "text"],
  ["footer_text", "Footer വാചകം", "text"],
  ["seo_description", "SEO / Google വിവരണം", "area"],
];

const f = (k, l, t = "text", req = false) => ({
  k, l, t, req,
});

/* CONTENT TABLES */
const CRUD = {
  journey: {
    fields: [
      f("year", "വർഷം"),
      f("title", "ശീർഷകം", "text", true),
      f("body", "വിവരണം", "area"),
    ],
    img: false,
  },

  projects: {
    fields: [
      f("title", "ശീർഷകം", "text", true),
      f("description", "വിവരണം", "area"),
      f("url", "ലിങ്ക് (https://…)"),
    ],
    img: true,
  },

  skills: {
    fields: [
      f("title", "Skill പേര്", "text", true),
      f("description", "വിവരണം", "area"),
    ],
    img: false,
  },

  services: {
    fields: [
      f("title", "Service പേര്", "text", true),
      f("description", "വിവരണം", "area"),
    ],
    img: false,
  },

  memories: {
    fields: [
      f("date_label", "തീയതി / വർഷം"),
      f("title", "ശീർഷകം", "text", true),
      f("body", "ഓർമ്മ", "area"),
    ],
    img: true,
  },

  interests: {
    fields: [
      f("name", "ഇഷ്ടം", "text", true),
      f("description", "വിവരണം", "area"),
    ],
    img: false,
  },

  kerala_items: {
    fields: [
      f("title", "ശീർഷകം", "text", true),
      f("body", "വിവരണം", "area"),
    ],
    img: true,
  },
};

/* ADMIN TABS */
const TABS = [
  ["settings", "Home / About / Texts"],
  ["journey", "Journey"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["services", "Services"],
  ["media", "Gallery"],
  ["memories", "Memories"],
  ["interests", "Interests"],
  ["kerala_items", "Kerala"],
  ["messages", "Messages"],
];

/* MAIN ADMIN */
export default function Admin() {
  const [state, setState] = useState("loading");
  const [tab, setTab] = useState("settings");

  const check = useCallback(async (session) => {
    if (!session) {
      setState("out");
      return;
    }

    const { data, error } = await sb()
      .from("admins")
      .select("user_id")
      .maybeSingle();

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

    client.auth.getSession().then(({ data }) => {
      check(data.session);
    });

    const { data } = client.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(() => check(session), 0);
      }
    );

    return () => data.subscription.unsubscribe();
  }, [check]);

  const logout = () => sb().auth.signOut();

  if (state === "loading") {
    return <p className="empty">Loading…</p>;
  }

  if (state === "noenv") {
    return (
      <p className="glass formbox err">
        Supabase environment variables ഇല്ല.
      </p>
    );
  }

  if (state === "out") {
    return <Login />;
  }

  if (state === "denied") {
    return (
      <div className="glass formbox">
        <p className="err">
          ഈ അക്കൗണ്ടിന് Admin അനുമതി ഇല്ല.
        </p>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <button className="btn sm" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "on" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass">
        {tab === "settings" && <SettingsEditor />}

        {CRUD[tab] && (
          <Crud
            key={tab}
            table={tab}
            cfg={CRUD[tab]}
          />
        )}

        {tab === "media" && <MediaManager />}

        {tab === "messages" && <Messages />}
      </div>
    </>
  );
}

/* LOGIN */
function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");

    const { error } = await sb().auth.signInWithPassword({
      email: email.trim(),
      password: pw,
    });

    if (error) {
      setMsg("ലോഗിൻ പരാജയപ്പെട്ടു. ഇമെയിലും പാസ്‌വേഡും പരിശോധിക്കുക.");
    }

    setBusy(false);
  }

  return (
    <form className="glass formbox" onSubmit={go}>
      <h3>Admin Login</h3>

      <label htmlFor="a-e">Email</label>
      <input
        id="a-e"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="username"
      />

      <label htmlFor="a-p">Password</label>
      <input
        id="a-p"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        required
        autoComplete="current-password"
      />

      <button className="btn fill" type="submit" disabled={busy}>
        {busy ? "…" : "Login"}
      </button>

      <div className="msg err" role="status">
        {msg}
      </div>
    </form>
  );
}

/* SETTINGS EDITOR */
function SettingsEditor() {
  const [vals, setVals] = useState({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb()
      .from("site_settings")
      .select("key,value")
      .then(({ data, error }) => {
        if (error) {
          setMsg("പിശക്: " + error.message);
        } else {
          setVals(
            Object.fromEntries(
              (data || []).map((r) => [r.key, r.value])
            )
          );
        }
      });
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);

    const rows = SETTINGS.map(([key]) => ({
      key,
      value: (vals[key] || "").trim(),
    }));

    const { error } = await sb()
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });

    setMsg(
      error
        ? "പിശക്: " + error.message
        : "സേവ് ചെയ്തു ✓"
    );

    setBusy(false);
  }

  return (
    <form onSubmit={save}>
      <h3>Home, About & പേജ് ടെക്സ്റ്റുകൾ</h3>

      {SETTINGS.map(([key, label, type]) => (
        <div key={key}>
          <label htmlFor={"s-" + key}>{label}</label>

          {type === "area" ? (
            <textarea
              id={"s-" + key}
              value={vals[key] || ""}
              onChange={(e) =>
                setVals({
                  ...vals,
                  [key]: e.target.value,
                })
              }
            />
          ) : (
            <input
              id={"s-" + key}
              value={vals[key] || ""}
              onChange={(e) =>
                setVals({
                  ...vals,
                  [key]: e.target.value,
                })
              }
            />
          )}
        </div>
      ))}

      <button className="btn fill" type="submit" disabled={busy}>
        {busy ? "…" : "Save"}
      </button>

      <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>
        {msg}
      </div>
    </form>
  );
}

/* ADD / EDIT / DELETE */
function Crud({ table, cfg }) {
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null);
  const [vals, setVals] = useState({});
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const titleKey = (
    cfg.fields.find((x) => x.req) || cfg.fields[0]
  ).k;

  const load = useCallback(async () => {
    const { data, error } = await sb()
      .from(table)
      .select("*")
      .order("sort_order")
      .order("created_at");

    if (error) {
      setMsg("പിശക്: " + error.message);
    } else {
      setRows(data || []);
    }
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  function start(row) {
    setEdit(row || {});
    setVals(row ? { ...row } : {});
    setFile(null);
    setMsg("");
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");

    let newPath = null;

    try {
      const obj = {};

      cfg.fields.forEach((field) => {
        obj[field.k] = (vals[field.k] || "").trim();
      });

      const must = cfg.fields.find((field) => field.req);

      if (must && !obj[must.k]) {
        throw new Error(must.l + " വേണം");
      }

      if (
        obj.url &&
        !/^https?:\/\//i.test(obj.url)
      ) {
        throw new Error(
          "ലിങ്ക് http:// അല്ലെങ്കിൽ https:// ൽ തുടങ്ങണം"
        );
      }

      if (cfg.img && file) {
        newPath = await upload(
          table,
          await compress(file)
        );

        obj.image_path = newPath;
      }

      if (edit.id) {
        const { error } = await sb()
          .from(table)
          .update(obj)
          .eq("id", edit.id);

        if (error) throw error;

        if (newPath && edit.image_path) {
          await removeFile(edit.image_path);
        }
      } else {
        obj.sort_order =
          rows.reduce(
            (max, row) =>
              Math.max(max, row.sort_order || 0),
            0
          ) + 1;

        const { error } = await sb()
          .from(table)
          .insert(obj);

        if (error) throw error;
      }

      setEdit(null);
      await load();
      setMsg("സേവ് ചെയ്തു ✓");
    } catch (error) {
      if (newPath) {
        await removeFile(newPath).catch(() => {});
      }

      setMsg("പിശക്: " + (error.message || error));
    }

    setBusy(false);
  }

  async function del(row) {
    if (!confirm("ഇത് ഒഴിവാക്കണോ?")) return;

    const { error } = await sb()
      .from(table)
      .delete()
      .eq("id", row.id);

    if (error) {
      setMsg("പിശക്: " + error.message);
      return;
    }

    if (row.image_path) {
      await removeFile(row.image_path);
    }

    await load();
  }

  async function move(index, direction) {
    if (!rows[index + direction]) return;

    const arr = [...rows];

    [arr[index], arr[index + direction]] = [
      arr[index + direction],
      arr[index],
    ];

    await Promise.all(
      arr.map((row, i) =>
        row.sort_order === i + 1
          ? null
          : sb()
              .from(table)
              .update({ sort_order: i + 1 })
              .eq("id", row.id)
      )
    );

    await load();
  }

  if (edit !== null) {
    return (
      <form onSubmit={save}>
        <h3>{edit.id ? "തിരുത്തുക" : "പുതിയത് ചേർക്കുക"}</h3>

        {cfg.fields.map((field) => (
          <div key={field.k}>
            <label htmlFor={"c-" + field.k}>
              {field.l}
            </label>

            {field.t === "area" ? (
              <textarea
                id={"c-" + field.k}
                value={vals[field.k] || ""}
                onChange={(e) =>
                  setVals({
                    ...vals,
                    [field.k]: e.target.value,
                  })
                }
              />
            ) : (
              <input
                id={"c-" + field.k}
                value={vals[field.k] || ""}
                onChange={(e) =>
                  setVals({
                    ...vals,
                    [field.k]: e.target.value,
                  })
                }
              />
            )}
          </div>
        ))}

        {cfg.img && (
          <>
            <label htmlFor="c-img">
              ചിത്രം (ഓപ്ഷണൽ)
            </label>

            {edit.image_path && (
              <img
                src={fileUrl(edit.image_path)}
                alt=""
                style={{
                  width: 120,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}

            <input
              id="c-img"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) =>
                setFile(e.target.files[0] || null)
              }
            />
          </>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn fill"
            type="submit"
            disabled={busy}
          >
            {busy ? "…" : "Save"}
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => setEdit(null)}
          >
            Cancel
          </button>
        </div>

        <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>
          {msg}
        </div>
      </form>
    );
  }

  return (
    <div>
      <button
        className="btn fill"
        style={{ marginTop: 0 }}
        onClick={() => start(null)}
      >
        + പുതിയത് ചേർക്കുക
      </button>

      <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>
        {msg}
      </div>

      {rows.length === 0 && (
        <p className="empty" style={{ marginTop: 10 }}>
          ഒന്നും ചേർത്തിട്ടില്ല.
        </p>
      )}

      {rows.map((row, index) => (
        <div className="row" key={row.id}>
          {row.image_path && (
            <img src={fileUrl(row.image_path)} alt="" />
          )}

          <div className="grow">
            <b>{row[titleKey]}</b>
          </div>

          <div className="acts">
            <button
              className="btn sm"
              onClick={() => move(index, -1)}
              disabled={index === 0}
            >
              ↑
            </button>

            <button
              className="btn sm"
              onClick={() => move(index, 1)}
              disabled={index === rows.length - 1}
            >
              ↓
            </button>

            <button
              className="btn sm"
              onClick={() => start(row)}
            >
              തിരുത്തുക
            </button>

            <button
              className="btn sm danger"
              onClick={() => del(row)}
            >
              ഒഴിവാക്കുക
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* GALLERY */
function MediaManager() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb()
      .from("media")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMsg("പിശക്: " + error.message);
    } else {
      setRows(data || []);
    }
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

    let top = rows.reduce(
      (max, row) => Math.max(max, row.sort_order || 0),
      0
    );

    for (const file of files) {
      setMsg(`അപ്‌ലോഡ് ചെയ്യുന്നു… ${done + 1} / ${files.length}`);

      let path = null;

      try {
        const kind = file.type.startsWith("video/")
          ? "video"
          : "image";

        path = await upload(
          "gallery",
          kind === "image" ? await compress(file) : file
        );

        const { error } = await sb()
          .from("media")
          .insert({
            kind,
            path,
            caption: "",
            sort_order: ++top,
          });

        if (error) throw error;

        done++;
      } catch (error) {
        if (path) {
          await removeFile(path).catch(() => {});
        }

        setMsg(
          `പിശക് (${file.name}): ` +
          (error.message || error)
        );

        setBusy(false);
        await load();
        return;
      }
    }

    setMsg(`${done} ഫയൽ ചേർത്തു ✓`);
    setBusy(false);
    await load();
  }

  async function saveCaption(row, caption) {
    if (caption === row.caption) return;

    const { error } = await sb()
      .from("media")
      .update({ caption })
      .eq("id", row.id);

    setMsg(
      error
        ? "പിശക്: " + error.message
        : "Caption സേവ് ചെയ്തു ✓"
    );
  }

  async function del(row) {
    if (!confirm("ഈ ഫയൽ ഒഴിവാക്കണോ?")) return;

    const { error } = await sb()
      .from("media")
      .delete()
      .eq("id", row.id);

    if (error) {
      setMsg("പിശക്: " + error.message);
      return;
    }

    await removeFile(row.path);
    await load();
  }

  return (
    <div>
      <h3>ഫോട്ടോ / വീഡിയോ അപ്‌ലോഡ്</h3>

      <label htmlFor="m-f">
        ഫയലുകൾ തിരഞ്ഞെടുക്കുക
      </label>

      <input
        id="m-f"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        onChange={onFiles}
        disabled={busy}
      />

      <div className={"msg" + (msg.startsWith("പിശക്") ? " err" : "")}>
        {msg}
      </div>

      <div className="mgrid">
        {rows.map((row) => (
          <div className="mcard" key={row.id}>
            {row.kind === "video" ? (
              <video
                src={fileUrl(row.path)}
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={fileUrl(row.path)}
                alt={row.caption}
                loading="lazy"
              />
            )}

            <input
              defaultValue={row.caption}
              placeholder="Caption"
              maxLength={200}
              onBlur={(e) =>
                saveCaption(row, e.target.value.trim())
              }
            />

            <button
              className="btn sm danger"
              onClick={() => del(row)}
            >
              ഒഴിവാക്കുക
            </button>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <p className="empty">
          ഒന്നും അപ്‌ലോഡ് ചെയ്തിട്ടില്ല.
        </p>
      )}
    </div>
  );
}

/* CONTACT MESSAGES */
function Messages() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await sb()
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMsg("പിശക്: " + error.message);
    } else {
      setRows(data || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(row) {
    const { error } = await sb()
      .from("messages")
      .update({ is_read: !row.is_read })
      .eq("id", row.id);

    if (error) {
      setMsg("പിശക്: " + error.message);
      return;
    }

    await load();
  }

  async function del(row) {
    if (!confirm("സന്ദേശം ഒഴിവാക്കണോ?")) return;

    const { error } = await sb()
      .from("messages")
      .delete()
      .eq("id", row.id);

    if (error) {
      setMsg("പിശക്: " + error.message);
      return;
    }

    await load();
  }

  return (
    <div>
      <h3>സന്ദേശങ്ങൾ</h3>

      <div className="msg err">{msg}</div>

      {rows.length === 0 && (
        <p className="empty">സന്ദേശങ്ങളില്ല.</p>
      )}

      {rows.map((row) => (
        <div
          className="row"
          key={row.id}
          style={{ opacity: row.is_read ? 0.6 : 1 }}
        >
          <div className="grow">
            <b>{row.name}</b>
            {" · "}
            <a href={`mailto:${row.email}`}>
              {row.email}
            </a>

            <div className="yr">
              {new Date(row.created_at).toLocaleString()}
            </div>

            <p style={{ whiteSpace: "pre-line" }}>
              {row.body}
            </p>
          </div>

          <div className="acts">
            <button
              className="btn sm"
              onClick={() => toggle(row)}
            >
              {row.is_read ? "Unread" : "Mark read"}
            </button>

            <button
              className="btn sm danger"
              onClick={() => del(row)}
            >
              ഒഴിവാക്കുക
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
