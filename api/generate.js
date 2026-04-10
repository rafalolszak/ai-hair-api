import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS (Shopify!)
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

    const prompt = `
    Change ONLY the hairstyle of the person.
    Keep same face, identity and lighting.

    Hairstyle: ${hairstyle}

    Ultra realistic, natural hair, no face distortion.
    `;

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: image,
      prompt: prompt,
      size: "1024x1024"
    });

    const result = response.data[0].b64_json;

    return res.status(200).json({
      image: `data:image/png;base64,${result}`
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Generation failed",
      details: err.message
    });
  }
}
