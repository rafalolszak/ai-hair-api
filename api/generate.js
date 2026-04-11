import Replicate from "replicate";

export default async function handler(req, res) {

  // ✅ CORS (Shopify potrzebuje tego)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // ✅ Parsowanie body (Vercel czasem daje string)
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const prompt = body?.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Brak prompta" });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "google/nano-banana",
      {
        input: {
          image_input: [
            "https://formmedes.pl/wp-content/uploads/2022/11/implanty-twarzy-formmedes.jpg"
          ],
          // 🔥 Łączymy Twój prompt z kontrolą AI
          prompt: `Edit this photo: change only the hairstyle to ${prompt}. Do not alter the face, eyes, nose, lips, skin, lighting, or background. Preserve identity perfectly. Only update the hair.`,
        },
      }
    );

    res.status(200).json({
      image: output.url(),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
