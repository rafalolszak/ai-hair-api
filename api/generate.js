import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ CORS (Shopify)
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
    // 🔥 zabezpieczenie przed undefined
    const body = req.body || {};

    const image = body.image;
    const hairstyle = body.hairstyle || "short modern haircut";

    if (!image) {
      return res.status(400).json({ error: "No image received" });
    }

    console.log("Request received");

    const prompt = `
    Change ONLY the hairstyle of the person in this image.

    Keep:
    - same face
    - same identity
    - same lighting
    - same background

    Hairstyle: ${hairstyle}

    Requirements:
    - ultra realistic
    - natural hair texture
    - no face distortion
    - high quality salon result
    `;

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: image, // base64 (bez data:image/png;base64,)
      prompt: prompt,
      size: "1024x1024"
    });

    const result = response.data[0].b64_json;

    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${result}`
    });

  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      error: "Generation failed",
      details: error.message
    });
  }
}
