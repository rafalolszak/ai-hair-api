import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image, hairstyle } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image" });
    }

    // 🔥 konwersja base64 → buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const prompt = `
    Change ONLY the hairstyle.
    Keep same face, identity and lighting.

    Hairstyle: ${hairstyle}

    Ultra realistic, no face distortion.
    `;

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: buffer, // 🔥 TERAZ JEST POPRAWNIE
      prompt: prompt,
      size: "1024x1024"
    });

    const result = response.data[0].b64_json;

    res.status(200).json({
      image: `data:image/png;base64,${result}`
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
}
