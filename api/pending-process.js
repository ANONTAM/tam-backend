export default async function handler(req, res) {
  // Queremos ver qué está llegando exactamente al servidor
  res.status(200).json({
    method: req.method,
    headers: req.headers,
    bodyType: typeof req.body,
    body: req.body,
  });
}
