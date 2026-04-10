import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { image, hairstyle } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "No image" });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Change ONLY the hairstyle to: ${hairstyle}. Keep the same face, identity and lighting. Make it ultra realistic.`
            },
            {
              type: "input_image",
              image_url: image // 🔥 działa z base64!
            }
          ]
        }
      ],
      modalities: ["image"]
    });

    const imageBase64 = response.output[0].content[0].image_base64;

    res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`
    });

  } catch (err) {
    console.error("ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
}
