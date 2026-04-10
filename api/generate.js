import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS
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

    // 🔥 KONWERSJA BASE64 → BUFFER
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const result = await openai.images.edit({
      model: "gpt-image-1",
      prompt: `Change hairstyle to ${style}. Keep same face, realistic photo.`,
      image: buffer,
      size: "1024x1024"
    });

    return res.status(200).json({
      image: `data:image/png;base64,${result.data[0].b64_json}`
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}
