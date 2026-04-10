import OpenAI, { toFile } from "openai";

const client = new OpenAI({
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

    // 🔥 pobieramy obraz z URL
    const response = await fetch(image);
    const buffer = Buffer.from(await response.arrayBuffer());

    // 🔥 konwersja do pliku dla OpenAI
    const file = await toFile(buffer, "input.png", {
      type: "image/png",
    });

    // 🔥 AI zmienia fryzurę
    const result = await client.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt:
        "Change ONLY the hairstyle of the person, keep same face, same person, realistic photo, natural lighting",
      size: "1024x1024",
    });

    return res.status(200).json({
      image: `data:image/png;base64,${result.data[0].b64_json}`,
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}      error: e.message,
    });
  }
}
