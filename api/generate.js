import OpenAI from "openai";

export default async function handler(req, res) {
  // ✅ CORS (Shopify / frontend)
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

    console.log("REQUEST:", { style });

    if (!image) {
      return res.status(400).json({
        error: "Brak zdjęcia"
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 🔥 GENEROWANIE OBRAZU
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Change hairstyle to ${style}. Keep same face, same person, realistic photo, high quality.`,
      image: image, // base64 z frontendu
      size: "1024x1024"
    });

    if (!result.data || !result.data[0]?.url) {
      console.error("BRAK OBRAZU:", result);
      return res.status(500).json({
        error: "AI nie zwróciło obrazu"
      });
    }

    return res.status(200).json({
      image: result.data[0].url
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
