import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "Upload error" });
      }

      const style = fields.style;
      const file = files.image;

      if (!file) {
        return res.status(400).json({ error: "Brak zdjęcia" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await openai.images.edits({
        model: "gpt-image-1",
        prompt: `Change hairstyle to ${style}. Keep same face, realistic.`,
        image: [
          fs.createReadStream(file.filepath) // 🔥 KLUCZ
        ],
        size: "1024x1024"
      });

      return res.status(200).json({
        image: response.data[0].b64_json
          ? `data:image/png;base64,${response.data[0].b64_json}`
          : response.data[0].url
      });
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
