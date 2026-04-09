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

    // 👉 KONWERSJA NA BASE64
    const base64 = buffer.toString("base64");

    const result = await client.responses.create({
      model: "gpt-4.1-mini", // 🔥 ważne – działa z obrazami
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Change ONLY the hairstyle, keep same face, realistic photo",
            },
            {
              type: "input_image",
              image_base64: base64,
            },
          ],
        },
      ],
    });

    // 👉 WYCIĄGANIE OBRAZU
    const image = result.output[0]?.content?.find(
      (c) => c.type === "output_image"
    );

    if (!image) {
      throw new Error("Brak obrazu w odpowiedzi AI");
    }

    return res.status(200).json({
      image: `data:image/png;base64,${image.image_base64}`,
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
