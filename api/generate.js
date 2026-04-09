import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {

  // ✅ CORS
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
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    // 🔥 LISTA FRYZUR
    const styles = [
      "short modern haircut",
      "long wavy hair",
      "bob haircut",
      "curly hairstyle",
      "blonde straight hair"
    ];

    const style = styles[Math.floor(Math.random() * styles.length)];

    // 🔥 GENEROWANIE OBRAZU
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `A realistic photo of a person with ${style}, natural lighting, high quality`,
      size: "1024x1024"
    });

    const imageBase64 = response.data[0].b64_json;

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
