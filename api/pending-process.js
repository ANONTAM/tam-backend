// api/pending-process.js
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  // Solo permitimos POST
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  // En Vercel el body ya viene parseado si es JSON.
  // Pero si llega como string, lo parseamos.
  let payload = req.body;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      console.error("JSON parse error:", e);
      res.statusCode = 400;
      res.json({ error: "Invalid JSON body" });
      return;
    }
  }

  if (!payload || typeof payload !== "object") {
    res.statusCode = 400;
    res.json({ error: "Missing JSON body" });
    return;
  }

  const { id } = payload;

  if (!id) {
    res.statusCode = 400;
    res.json({ error: "Missing id in payload" });
    return;
  }

  try {
    // 1) Marcar como "generating"
    const { error: updateStartError } = await supabase
      .from("nfts_pending_generation")
      .update({
        status: "generating",
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateStartError) {
      console.error("Supabase error (mark generating):", updateStartError);
      res.statusCode = 500;
      res.json({ error: updateStartError.message });
      return;
    }

    // 2) Simular generación de imagen (aquí luego irán las llamadas de IA)
    const fakeImageUrl = "https://placehold.co/1024x1024?text=TAM+PENDING";

    // 3) Marcar como "generated"
    const { error: updateEndError } = await supabase
      .from("nfts_pending_generation")
      .update({
        status: "generated",
        image_url: fakeImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateEndError) {
      console.error("Supabase error (mark generated):", updateEndError);
      res.statusCode = 500;
      res.json({ error: updateEndError.message });
      return;
    }

    res.statusCode = 200;
    res.json({ ok: true, image_url: fakeImageUrl });
  } catch (e) {
    console.error("Unexpected error in pending-process:", e);
    res.statusCode = 500;
    res.json({ error: "Unexpected server error", details: String(e) });
  }
}
