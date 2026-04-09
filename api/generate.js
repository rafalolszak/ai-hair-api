export default async function handler(req, res) {

  // 🔥 KLUCZOWE — parsowanie body
  let body;

  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const image = body?.image;

  if (!image) {
    return res.status(400).json({ error: "Brak image" });
  }

  // 🔥 TEST (na razie)
  return res.status(200).json({
    image: "https://picsum.photos/400/500"
  });
}
