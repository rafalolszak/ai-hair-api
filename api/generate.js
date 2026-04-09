import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const body = req.body;

    console.log("BODY:", body);

    if (!body || !body.image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    // 🔥 TEST OPENAI
    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: "Modern hairstyle, realistic person, studio photo",
      size: "512x512"
    });

    return res.status(200).json({
      image: `data:image/png;base64,${result.data[0].b64_json}`
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: "Błąd AI",
      details: err.message
    });
  }
}
