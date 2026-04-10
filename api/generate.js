import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, style } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1",
      modalities: ["image"],
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Edit this photo: change hairstyle to ${style}. Keep same face.`
            },
            {
              type: "input_image",
              image_url: image // 🔥 MUSI być URL, NIE base64
            }
          ]
        }
      ]
    });

    const imageBase64 = response.output
      ?.flatMap(o => o.content || [])
      ?.find(c => c.type === "output_image")
      ?.image_base64;

    if (!imageBase64) {
      console.error("BRAK OBRAZU:", JSON.stringify(response, null, 2));
      return res.status(500).json({
        error: "AI nie zwróciło obrazu"
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}
