import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  // Aceptar POST (JSON) y GET (?id=...) para facilitar pruebas
  let id;

  if (req.method === "POST") {
    try {
      const payload = JSON.parse(req.body || "{}");
      id = payload.id;
    } catch (e) {
      res.statusCode = 400;
      res.json({ error: "Invalid JSON body" });
      return;
    }
  } else if (req.method === "GET") {
    id = req.query.id;
  } else {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  if (!id) {
    res.statusCode = 400;
    res.json({ error: "Missing id" });
    return;
  }

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

  // 2) AQUÍ IRÁ LA LLAMADA REAL A LA IA
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
}
