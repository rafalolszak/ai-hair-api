import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: "Realistyczna osoba z nową fryzurą, różne style włosów",
      size: "1024x1024"
    });

    return res.status(200).json({
      image: `data:image/png;base64,${result.data[0].b64_json}`
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Błąd AI" });
  }
}
