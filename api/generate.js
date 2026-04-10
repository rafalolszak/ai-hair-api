import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  try {
    const { image, hairstyle } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    console.log("START GENERATION");

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Change ONLY the hairstyle to: ${hairstyle}. Keep same face, identity and lighting. Ultra realistic.`
            },
            {
              type: "input_image",
              image_base64: image.replace(/^data:image\/\w+;base64,/, "")
            }
          ]
        }
      ],
      modalities: ["image"]
    });

    // 🔥 bezpieczne wyciąganie obrazu
    const imageBase64 = response.output
      ?.find(item => item.type === "message")
      ?.content?.find(c => c.type === "output_image")
      ?.image_base64;

    if (!imageBase64) {
      console.log("FULL RESPONSE:", JSON.stringify(response, null, 2));
      return res.status(500).json({
        error: "No image generated"
      });
    }

    console.log("SUCCESS");

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
