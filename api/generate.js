import OpenAI from "openai";
import { IncomingForm } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // 🔥 potrzebne dla formidable
  },
};

export default async function handler(req, res) {
  // CORS (Shopify)
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
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("FORM ERROR:", err);
        return res.status(500).json({ error: "Upload error" });
      }

      const style = fields.style || "modern hairstyle";
      const file = files.image?.[0];

      if (!file) {
        return res.status(400).json({ error: "Brak zdjęcia" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // 🔥 czytamy plik
      const imageBuffer = fs.readFileSync(file.filepath);

      // 🔥 NAJWAŻNIEJSZE — poprawne wywołanie API
      const response = await openai.images.edit({
        model: "gpt-image-1",
        prompt: `Change hairstyle to ${style}. Keep the same face and identity.`,
        image: [imageBuffer],
        size: "1024x1024"
      });

      const image_base64 = response.data[0].b64_json;
      const image_url = `data:image/png;base64,${image_base64}`;

      return res.status(200).json({
        image: image_url
      });
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}
