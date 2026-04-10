import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, style } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 🔥 GENERUJEMY NOWY OBRAZ NA PODSTAWIE PROMPTU
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `A realistic photo of a person with hairstyle ${style}, similar to this person: ${image}`,
      size: "1024x1024"
    });

    return res.status(200).json({
      image: result.data[0].url
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}
