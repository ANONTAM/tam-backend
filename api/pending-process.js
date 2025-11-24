import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Aceptar tanto objeto como string
  let payload;
  try {
    if (typeof req.body === "string") {
      payload = JSON.parse(req.body || "{}");
    } else {
      payload = req.body || {};
    }
  } catch (e) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { id } = payload;
  if (!id) {
    res.status(400).json({ error: "Missing id in payload" });
    return;
  }

  // 1) Marcamos como "generating"
  const { error: updateStartError } = await supabase
    .from("nfts_pending_generation")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateStartError) {
    console.error("Supabase error (mark generating):", updateStartError);
    res.status(500).json({ error: updateStartError.message });
    return;
  }

  // 2) Stub de imagen (luego sustituiremos por llamada real a la IA)
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
    res.status(500).json({ error: updateEndError.message });
    return;
  }

  res.status(200).json({ ok: true, image_url: fakeImageUrl });
}
