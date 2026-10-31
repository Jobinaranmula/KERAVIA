import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client;
/** Browser Supabase client (anon key; security is enforced by Row Level Security). */
export function sb() {
  if (!URL || !KEY) throw new Error("Supabase environment variables are missing (see .env.example).");
  if (!client) client = createClient(URL, KEY);
  return client;
}

/** Public URL of a file in the "media" storage bucket. */
export function fileUrl(path) {
  return path && URL ? `${URL}/storage/v1/object/public/media/${path}` : "";
}
