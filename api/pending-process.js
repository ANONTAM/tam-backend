import { supabase } from "../lib/supabase.js";

export const config = {
  api: {
    bodyParser: false, // importantísimo en Vercel
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let raw;
  try {
    raw = await readBody(req);
  } catch (e) {
    res.status(400).json({ error: "Could not read body" });
    return;
  }

  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch (e) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { id } = payload;
  if (!id) {
    res.status(400).json({ error: "Missing id in payload" });
    return;
  }

  // 1) Marcamos como generating
  const { error: updateStartError } = await supabase
    .from("nfts_pending_generation")
    .update({
      status: "generating",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateStartError) {
    res.status(500).json({ error: updateStartError.message });
    return;
  }

  // 2) Generación artificial
  const fakeImageUrl = "https://placehold.co/1024x1024?text=TAM+PENDING";

  // 3) Marcamos como generated
  const { error: updateEndError } = await supabase
    .from("nfts_pending_generation")
    .update({
      status: "generated",
      image_url: fakeImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateEndError) {
    res.status(500).json({ error: updateEndError.message });
    return;
  }

  res.status(200).json({ ok: true, image_url: fakeImageUrl });
}
