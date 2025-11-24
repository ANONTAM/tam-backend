import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(req.body || "{}");
  } catch (e) {
    res.statusCode = 400;
    res.json({ error: "Invalid JSON body" });
    return;
  }

  const { id } = payload;
  if (!id) {
    res.statusCode = 400;
    res.json({ error: "Missing id in payload" });
    return;
  }

  // 1) Marcamos como "generating"
  const { error: updateStartError } = await supabase
    .from("nfts_pending_generation")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateStartError) {
    console.error("Supabase error (mark generating):", updateStartError);
    res.statusCode = 500;
    res.json({ error: updateStartError.message });
    return;
  }

  // 2) AQUÍ IRÁ LA LLAMADA REAL A LA IA (OpenAI/Midjourney/SDXL)
  // Por ahora lo dejamos como stub y ponemos una URL falsa de imagen.
  const fakeImageUrl = "https://placehold.co/1024x1024?text=TAM+PENDING";

  // 3) Marcamos como "generated"
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
}
