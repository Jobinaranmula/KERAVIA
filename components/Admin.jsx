"use client";

import { useCallback, useEffect, useState } from "react";
import { sb, fileUrl } from "@/lib/supabase";
import { compress, upload, removeFile } from "@/lib/upload";

const SETTINGS = [
  ["owner_name", "പേര്", "text"],
  ["hero_subtitle", "Home സ്വാഗത വാചകം", "area"],
  ["about_text", "About Me", "area"],
  ["journey_intro", "Journey ആമുഖം", "area"],
  ["projects_intro", "Projects ആമുഖം", "area"],
  ["skills_intro", "Skills ആമുഖം", "area"],
  ["services_intro", "Services ആമുഖം", "area"],
  ["gallery_intro", "Gallery ആമുഖം", "area"],
  ["memories_intro", "Memories ആമുഖം", "area"],
  ["interests_intro", "Interests ആമുഖം", "area"],
  ["kerala_intro", "Kerala ആമുഖം", "area"],
  ["contact_intro", "Contact ആമുഖം", "area"],
  ["contact_email", "Contact Email", "text"],
  ["footer_text", "Footer Text", "text"],
  ["seo_description", "SEO Description", "area"],
];

const CRUD = {
  journey: {
    title: "Journey",
    fields: [
      ["year", "വർഷം"],
      ["title", "ശീർഷകം", "required"],
      ["body", "വിവരണം", "area"],
    ],
  },
  projects: {
    title: "Projects",
    image: true,
    fields: [
      ["title", "Project പേര്", "required"],
      ["description", "വിവരണം", "area"],
      ["url", "Project Link"],
    ],
  },
  skills: {
    title: "Skills",
    fields: [
      ["title", "Skill പേര്", "required"],
      ["description", "വിവരണം", "area"],
    ],
  },
  services: {
    title: "Services",
    fields: [
      ["title", "Service പേര്", "required"],
      ["description", "വിവരണം", "area"],
    ],
  },
  memories: {
    title: "Memories",
    image: true,
    fields: [
      ["date_label", "തീയതി / വർഷം"],
      ["title", "ശീർഷകം", "required"],
      ["body", "ഓർമ്മ", "area"],
    ],
  },
  interests: {
    title: "Interests",
    fields: [
      ["name", "ഇഷ്ടം", "required"],
      ["description", "വിവരണം", "area"],
    ],
  },
  kerala_items: {
    title: "Kerala",
    image: true,
    fields: [
      ["title", "ശീർഷകം", "required"],
      ["body", "വിവരണം", "area"],
    ],
  },
};

const TABS = [
  ["settings", "Settings"],
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

function ErrorText({ children }) {
  return <p className="msg err">{children}</p>;
}

export default function Admin() {
  const [state, setState] = useState("loading");
  const [tab, setTab] = useState("settings");

  const checkAdmin = useCallback(async (session) => {
    if (!session) {
      setState("out");
      return;
    }

    try {
      const { data, error } = await sb()
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Admin verification:", error);
        setState("denied");
        return;
      }

      setState(data ? "in" : "denied");
    } catch (error) {
      console.error(error);
      setState("noenv");
    }
  }, []);

  useEffect(() => {
    let client;

    try {
      client = sb();
    } catch (error) {
      console.error(error);
      setState("noenv");
      return;
    }

    let active = true;

    client.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          setState("out");
          return;
        }

        checkAdmin(data.session);
      })
      .catch((error) => {
        console.error(error);
        if (active) setState("noenv");
      });

    const { data } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (active) checkAdmin(session);
      }
    );

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  async function logout() {
    await sb().auth.signOut();
    setState("out");
  }

  if (state === "loading") {
    return <div className="glass formbox">Admin പരിശോധിക്കുന്നു...</div>;
  }

  if (state === "noenv") {
    return (
      <div className="glass formbox">
        <ErrorText>Supabase connection പരിശോധിക്കുക.</ErrorText>
      </div>
    );
  }

  if (state === "out") return <Login />;

  if (state === "denied") {
    return (
      <div className="glass formbox">
        <ErrorText>ഈ അക്കൗണ്ടിന് Admin അനുമതിയില്ല.</ErrorText>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <section className="admin-panel">
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <button className="btn sm" onClick={logout}>Logout</button>
      </div>

      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "on" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass" style={{ padding: 20 }}>
        {tab === "settings" && <SettingsEditor />}
        {CRUD[tab] && (
          <Crud key={tab} table={tab} config={CRUD[tab]} />
        )}
        {tab === "media" && <MediaManager />}
        {tab === "messages" && <Messages />}
      </div>
    </section>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const { error } = await sb().auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) setMessage(error.message);
    } catch (error) {
      setMessage(error.message || "Login പരാജയപ്പെട്ടു.");
    }

    setBusy(false);
  }

  return (
    <form className="glass formbox" onSubmit={submit}>
      <h2>Admin Login</h2>

      <label htmlFor="admin-email">Email</label>
      <input
        id="admin-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
        required
      />

      <label htmlFor="admin-password">Password</label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <button className="btn fill" disabled={busy}>
        {busy ? "Logging in..." : "Login"}
      </button>

      {message && <ErrorText>{message}</ErrorText>}
    </form>
  );
}

function SettingsEditor() {
  const [values, setValues] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb()
      .from("site_settings")
      .select("key,value");

    if (error) {
      setMessage("പിശക്: " + error.message);
      return;
    }

    setValues(
      Object.fromEntries((data || []).map((item) => [
        item.key,
        item.value || "",
      ]))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    const rows = SETTINGS.map(([key]) => ({
      key,
      value: values[key] || "",
    }));

    const { error } = await sb()
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });

    setMessage(error ? "പിശക്: " + error.message : "സേവ് ചെയ്തു ✓");
    setBusy(false);
  }

  return (
    <form onSubmit={save}>
      <h2>Website Settings</h2>

      {SETTINGS.map(([key, label, type]) => (
        <div key={key}>
          <label htmlFor={"setting-" + key}>{label}</label>

          {type === "area" ? (
            <textarea
              id={"setting-" + key}
              value={values[key] || ""}
              onChange={(e) =>
                setValues((old) => ({
                  ...old,
                  [key]: e.target.value,
                }))
              }
            />
          ) : (
            <input
              id={"setting-" + key}
              value={values[key] || ""}
              onChange={(e) =>
                setValues((old) => ({
                  ...old,
                  [key]: e.target.value,
                }))
              }
            />
          )}
        </div>
      ))}

      <button className="btn fill" disabled={busy}>
        {busy ? "Saving..." : "Save Settings"}
      </button>

      {message && <p className="msg">{message}</p>}
    </form>
  );
}

function Crud({ table, config }) {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState({});
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const titleField = config.fields.find((field) =>
    field.includes("required")
  )?.[0] || config.fields[0][0];

  const load = useCallback(async () => {
    const { data, error } = await sb()
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      setMessage("പിശക്: " + error.message);
    } else {
      setRows(data || []);
    }
  }, [table]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(row = null) {
    setEditing(row || {});
    setValues(row ? { ...row } : {});
    setFile(null);
    setMessage("");
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    let uploadedPath = null;

    try {
      const record = {};

      for (const [key] of config.fields) {
        record[key] = String(values[key] || "").trim();
      }

      const required = config.fields.find((field) =>
        field.includes("required")
      );

      if (required && !record[required[0]]) {
        throw new Error(required[1] + " നൽകണം.");
      }

      if (record.url && !/^https?:\/\//i.test(record.url)) {
        throw new Error("ശരിയായ http/https ലിങ്ക് നൽകുക.");
      }

      if (config.image && file) {
        const prepared = file.type.startsWith("image/")
          ? await compress(file)
          : file;

        uploadedPath = await upload(table, prepared);
        record.image_path = uploadedPath;
      }

      if (editing.id) {
        const { error } = await sb()
          .from(table)
          .update(record)
          .eq("id", editing.id);

        if (error) throw error;

        if (uploadedPath && editing.image_path) {
          await removeFile(editing.image_path);
        }
      } else {
        record.sort_order =
          rows.reduce((max, row) =>
            Math.max(max, Number(row.sort_order) || 0), 0
          ) + 1;

        const { error } = await sb()
          .from(table)
          .insert(record);

        if (error) throw error;
      }

      setEditing(null);
      setValues({});
      setFile(null);
      await load();
      setMessage("സേവ് ചെയ്തു ✓");
    } catch (error) {
      if (uploadedPath) {
        await removeFile(uploadedPath).catch(() => {});
      }
      setMessage("പിശക്: " + (error.message || "സേവ് ചെയ്യാനായില്ല"));
    }

    setBusy(false);
  }

  async function remove(row) {
    if (!confirm("ഈ item ഒഴിവാക്കണോ?")) return;

    const { error } = await sb()
      .from(table)
      .delete()
      .eq("id", row.id);

    if (error) {
      setMessage("പിശക്: " + error.message);
      return;
    }

    if (row.image_path) {
      await removeFile(row.image_path).catch(() => {});
    }

    await load();
    setMessage("ഒഴിവാക്കി ✓");
  }

  async function move(index, direction) {
    const other = index + direction;
    if (other < 0 || other >= rows.length) return;

    const first = rows[index];
    const second = rows[other];

    const { error: firstError } = await sb()
      .from(table)
      .update({ sort_order: second.sort_order ?? other + 1 })
      .eq("id", first.id);

    const { error: secondError } = await sb()
      .from(table)
      .update({ sort_order: first.sort_order ?? index + 1 })
      .eq("id", second.id);

    if (firstError || secondError) {
      setMessage("ക്രമം മാറ്റാൻ കഴിഞ്ഞില്ല.");
    }

    await load();
  }

  if (editing !== null) {
    return (
      <form onSubmit={save}>
        <h2>{editing.id ? "തിരുത്തുക" : "പുതിയത് ചേർക്കുക"}</h2>

        {config.fields.map(([key, label, type]) => (
          <div key={key}>
            <label htmlFor={"field-" + key}>{label}</label>

            {type === "area" ? (
              <textarea
                id={"field-" + key}
                value={values[key] || ""}
                onChange={(e) =>
                  setValues((old) => ({
                    ...old,
                    [key]: e.target.value,
                  }))
                }
              />
            ) : (
              <input
                id={"field-" + key}
                value={values[key] || ""}
                onChange={(e) =>
                  setValues((old) => ({
                    ...old,
                    [key]: e.target.value,
                  }))
                }
              />
            )}
          </div>
        ))}

        {config.image && (
          <>
            {editing.image_path && (
              <img
                src={fileUrl(editing.image_path)}
                alt=""
                style={{ width: 120, display: "block" }}
              />
            )}

            <label htmlFor="content-image">ചിത്രം</label>
            <input
              id="content-image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </>
        )}

        <button className="btn fill" disabled={busy}>
          {busy ? "Saving..." : "Save"}
        </button>

        <button
          className="btn"
          type="button"
          onClick={() => setEditing(null)}
        >
          Cancel
        </button>

        {message && <p className="msg">{message}</p>}
      </form>
    );
  }

  return (
    <div>
      <h2>{config.title}</h2>

      <button
        className="btn fill"
        type="button"
        onClick={() => startEdit()}
      >
        + പുതിയത് ചേർക്കുക
      </button>

      {message && <p className="msg">{message}</p>}

      {rows.length === 0 && (
        <p className="empty">ഇതുവരെ ഒന്നും ചേർത്തിട്ടില്ല.</p>
      )}

      {rows.map((row, index) => (
        <div className="row" key={row.id}>
          {row.image_path && (
            <img src={fileUrl(row.image_path)} alt="" />
          )}

          <div className="grow">
            <b>{row[titleField]}</b>
          </div>

          <div className="acts">
            <button className="btn sm" onClick={() => move(index, -1)}>
              ↑
            </button>
            <button className="btn sm" onClick={() => move(index, 1)}>
              ↓
            </button>
            <button className="btn sm" onClick={() => startEdit(row)}>
              Edit
            </button>
            <button className="btn sm danger" onClick={() => remove(row)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MediaManager() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await sb()
      .from("media")
      .select("*")
      .order("sort_order", { ascending: false });

    if (error) setMessage("പിശക്: " + error.message);
    else setRows(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    setBusy(true);
    let count = 0;

    for (const file of files) {
      let path = null;

      try {
        const isVideo = file.type.startsWith("video/");
        const prepared = isVideo ? file : await compress(file);

        path = await upload("gallery", prepared);

        const { error } = await sb()
          .from("media")
          .insert({
            kind: isVideo ? "video" : "image",
            path,
            caption: "",
            sort_order: rows.length + count + 1,
          });

        if (error) throw error;
        count++;
      } catch (error) {
        if (path) await removeFile(path).catch(() => {});
        setMessage("പിശക്: " + error.message);
        break;
      }
    }

    if (count) setMessage(`${count} ഫയൽ ചേർത്തു ✓`);
    setBusy(false);
    await load();
  }

  async function deleteMedia(row) {
    if (!confirm("ഈ ഫയൽ ഒഴിവാക്കണോ?")) return;

    const { error } = await sb()
      .from("media")
      .delete()
      .eq("id", row.id);

    if (error) {
      setMessage("പിശക്: " + error.message);
      return;
    }

    await removeFile(row.path).catch(() => {});
    await load();
  }

  async function saveCaption(row, caption) {
    const { error } = await sb()
      .from("media")
      .update({ caption })
      .eq("id", row.id);

    setMessage(error ? "പിശക്: " + error.message : "Caption സേവ് ചെയ്തു ✓");
    if (!error) await load();
  }

  return (
    <div>
      <h2>Gallery Upload</h2>

      <label htmlFor="gallery-files">ഫോട്ടോ / വീഡിയോ തിരഞ്ഞെടുക്കുക</label>
      <input
        id="gallery-files"
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm"
        onChange={uploadFiles}
        disabled={busy}
      />

      {busy && <p>Upload നടക്കുന്നു...</p>}
      {message && <p className="msg">{message}</p>}

      <div className="mgrid">
        {rows.map((row) => (
          <div className="mcard" key={row.id}>
            {row.kind === "video" ? (
              <video src={fileUrl(row.path)} controls />
            ) : (
              <img src={fileUrl(row.path)} alt={row.caption || ""} />
            )}

            <input
              defaultValue={row.caption || ""}
              placeholder="Caption"
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value !== (row.caption || "")) {
                  saveCaption(row, value);
                }
              }}
            />

            <button
              className="btn sm danger"
              onClick={() => deleteMedia(row)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Messages() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await sb()
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setMessage("പിശക്: " + error.message);
    else setRows(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRead(row) {
    const { error } = await sb()
      .from("messages")
      .update({ is_read: !row.is_read })
      .eq("id", row.id);

    if (error) setMessage("പിശക്: " + error.message);
    else await load();
  }

  async function removeMessage(row) {
    if (!confirm("സന്ദേശം ഒഴിവാക്കണോ?")) return;

    const { error } = await sb()
      .from("messages")
      .delete()
      .eq("id", row.id);

    if (error) setMessage("പിശക്: " + error.message);
    else await load();
  }

  return (
    <div>
      <h2>Contact Messages</h2>

      {message && <p className="msg">{message}</p>}

      {rows.length === 0 && (
        <p className="empty">സന്ദേശങ്ങളില്ല.</p>
      )}

      {rows.map((row) => (
        <article className="row" key={row.id}>
          <div className="grow">
            <b>{row.name}</b>
            <p>{row.email}</p>
            <p>{row.body}</p>
            <small>
              {row.created_at
                ? new Date(row.created_at).toLocaleString()
                : ""}
            </small>
          </div>

          <div className="acts">
            <button className="btn sm" onClick={() => toggleRead(row)}>
              {row.is_read ? "Unread" : "Read"}
            </button>
            <button
              className="btn sm danger"
              onClick={() => removeMessage(row)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
