export default async function handler(req, res) {
  try {

    let body = req.body;

    // 🔥 KLUCZOWE — naprawa Vercel
    if (!body) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString();
      body = JSON.parse(rawBody);
    }

    const image = body?.image;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // 🔥 TEST (na razie)
    return res.status(200).json({
      image: "https://picsum.photos/400/500"
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
}
