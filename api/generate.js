import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(500).json({ error: "Upload error" });
      }

      const file = files.image;

      if (!file) {
        return res.status(400).json({ error: "Brak zdjęcia" });
      }

      // 🔥 odczyt pliku
      const buffer = fs.readFileSync(file.filepath);

      const formData = new FormData();
      formData.append("model", "gpt-image-1");

      formData.append("image", buffer, {
        filename: "photo.png",
        contentType: "image/png",
      });

      formData.append(
        "prompt",
        "Change ONLY hairstyle. Keep same face, same person, ultra realistic hairstyle."
      );

      // 🔥 request do OpenAI
      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(500).json({
          error: "OpenAI error",
          details: data,
        });
      }

      const imageBase64 = data.data[0].b64_json;

      return res.status(200).json({
        image: `data:image/png;base64,${imageBase64}`,
      });

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
