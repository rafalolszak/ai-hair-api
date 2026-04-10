import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS (Shopify)
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

    console.log("REQUEST:", { style });

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Change hairstyle to ${style}. Keep same face, same person, realistic photo.`
            },
            {
              type: "input_image",
              image_url: image
            }
          ]
        }
      ]
    });

    // 🔥 SZUKAMY OBRAZU W ODPOWIEDZI (odporne na błędy)
    let image_base64 = null;

    for (const item of response.output) {
      if (item.content) {
        for (const c of item.content) {
          if (c.type === "output_image" && c.image_base64) {
            image_base64 = c.image_base64;
          }
        }
      }
    }

    if (!image_base64) {
      console.error("BRAK OBRAZU:", JSON.stringify(response, null, 2));
      return res.status(500).json({
        error: "AI nie zwróciło obrazu"
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${image_base64}`
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
