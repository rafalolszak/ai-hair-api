import OpenAI, { toFile } from "openai";

export const config = {
  api: {
    bodyParser: false,
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
    // 🔥 pobieramy dane z FormData (BEZ formidable)
    const formData = await req.formData();

    const file = formData.get("image");
    const style = formData.get("style") || "modern hairstyle";

    if (!file) {
      return res.status(400).json({ error: "Brak pliku" });
    }

    // 🔥 konwersja na buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🔥 kluczowe — toFile
    const imageFile = await toFile(buffer, "image.png", {
      type: file.type || "image/png",
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 🔥 EDYCJA OBRAZU
    const response = await openai.images.edit({
      model: "gpt-image-1.5",
      image: [imageFile],
      prompt: `Change hairstyle to ${style}. Keep same face, same identity, realistic, natural lighting.`,
      size: "1024x1024",
    });

    const imageData = response.data[0];

    if (!imageData) {
      console.error("BRAK DATA:", response);
      return res.status(500).json({ error: "Brak odpowiedzi z AI" });
    }

    // 🔥 obsługa obu przypadków (b64 / url)
    let imageUrl;

    if (imageData.b64_json) {
      imageUrl = `data:image/png;base64,${imageData.b64_json}`;
    } else if (imageData.url) {
      imageUrl = imageData.url;
    } else {
      console.error("BRAK OBRAZU:", response);
      return res.status(500).json({ error: "AI nie zwróciło obrazu" });
    }

    return res.status(200).json({
      image: imageUrl,
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message || "Server error",
    });
  }
}
