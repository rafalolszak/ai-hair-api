export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    // 🔥 TEST – zawsze zwraca zdjęcie
    return res.status(200).json({
      image: "https://picsum.photos/500/600?random=" + Math.random()
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
