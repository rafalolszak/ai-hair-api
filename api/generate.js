import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {

  const form = formidable();

  form.parse(req, async (err, fields, files) => {

    if (err) {
      return res.status(500).json({ error: "Błąd uploadu" });
    }

    const file = files.image;

    if (!file) {
      return res.status(400).json({ error: "Brak pliku" });
    }

    try {

      const fileStream = fs.createReadStream(file.filepath);

      const formData = new FormData();
      formData.append("model", "gpt-image-1");
      formData.append("prompt", "Modern realistic hairstyle, same person, different haircut");
      formData.append("image[]", fileStream);

      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: formData
      });

      const data = await response.json();

      if (!data.data || !data.data[0]) {
        return res.status(500).json({ error: "Błąd AI", details: data });
      }

      return res.status(200).json({
        image: data.data[0].url
      });

    } catch (e) {
      return res.status(500).json({
        error: "Server error",
        details: e.message
      });
    }
  });
}
