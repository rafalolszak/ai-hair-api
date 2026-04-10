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
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Change hairstyle to ${style}. Keep same face, realistic photo.`
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ]
    });

    // 🔥 fallback — czasem obraz jest w innym miejscu
    const content = response.output[0].content;

    const imageObj = content.find(c => c.type === "output_image");

    if (!imageObj) {
      return res.status(500).json({ error: "Brak obrazu w odpowiedzi" });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageObj.image_base64}`
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({
      error: err.message
    });
  }
}
