"use client";

import { useState } from "react";
import { sb } from "@/lib/supabase";

export default function ContactForm({ email }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = new FormData(f);
    if (d.get("website")) {
      // honeypot filled => bot; pretend success
      setOk(true);
      setMsg("സന്ദേശം അയച്ചു ✓");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const { error } = await sb().from("messages").insert({
        name: String(d.get("name") || "").trim(),
        email: String(d.get("email") || "").trim(),
        body: String(d.get("body") || "").trim(),
      });
      if (error) throw error;
      setOk(true);
      setMsg("സന്ദേശം അയച്ചു ✓ നന്ദി!");
      f.reset();
    } catch {
      setOk(false);
      setMsg("അയക്കാനായില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.");
    }
    setBusy(false);
  }

  return (
    <form className="glass formbox rv" onSubmit={submit}>
      <label htmlFor="c-name">Name</label>
      <input id="c-name" name="name" required maxLength={100} autoComplete="name" />
      <label htmlFor="c-email">Email</label>
      <input id="c-email" name="email" type="email" required maxLength={200} autoComplete="email" />
      <label htmlFor="c-body">Message</label>
      <textarea id="c-body" name="body" required maxLength={2000} />
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn fill" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send Message"}
      </button>
      <div className={"msg" + (msg && !ok ? " err" : "")} role="status">{msg}</div>
      {email ? (
        <p style={{ marginTop: 10, fontSize: 14 }}>
          അല്ലെങ്കിൽ ഇമെയിൽ: <a href={`mailto:${email}`}>{email}</a>
        </p>
      ) : null}
    </form>
  );
}
