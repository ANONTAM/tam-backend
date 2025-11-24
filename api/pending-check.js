import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  const { data, error } = await supabase
    .from("nfts_pending_generation")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    console.error("Supabase error (pending-check):", error);
    res.statusCode = 500;
    res.json({ error: error.message });
    return;
  }

  res.statusCode = 200;
  res.json({ job: data && data.length > 0 ? data[0] : null });
}
