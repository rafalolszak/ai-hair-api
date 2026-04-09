import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // 🔥 KONWERSJA DO BLOB (KLUCZOWE)
    const blob = new Blob([buffer]);

    const result = await client.images.edit({
      model: "gpt-image-1",
      image: blob,
      prompt:
        "Change the hairstyle of the person to a modern haircut, keep the same face, realistic, high quality",
      size: "1024x1024",
    });

    return res.status(200).json({
      image: `data:image/png;base64,${result.data[0].b64_json}`,
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
