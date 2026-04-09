import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const form = formidable({});
    
    const [fields, files] = await form.parse(req);
    const file = files.image?.[0];

    if (!file) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    const imageBuffer = fs.readFileSync(file.filepath);

    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: "Realistyczna osoba z nową fryzurą, różne style włosów",
      size: "1024x1024"
    });

    const image_base64 = response.data[0].b64_json;

    return res.status(200).json({
      image: `data:image/png;base64,${image_base64}`
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Błąd AI" });
  }
}
