export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const image = body.image;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // 🔥 TESTOWY OBRAZ (żeby sprawdzić czy działa)
    return res.status(200).json({
      image: "https://picsum.photos/400/500"
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
}
