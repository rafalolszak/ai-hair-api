import formidable from "formidable";
import fs from "fs";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(500).json({ error: "Błąd parsowania" });
      }

      const file = files.image;

      if (!file) {
        return res.status(400).json({ error: "Brak zdjęcia" });
      }

      const imageBuffer = fs.readFileSync(file.filepath);

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: "Realistic hairstyle transformation, same person, new hairstyle",
        image: imageBuffer
      });

      return res.status(200).json({
        image: response.data[0].url
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });
}
