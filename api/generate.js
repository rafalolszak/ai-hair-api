import Replicate from "replicate";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).json({ error: "Missing image or prompt" });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "google/nano-banana",
      {
        input: {
          image_input: [image],
          prompt: prompt,
        },
      }
    );

    let imageUrl = null;

    // 🔥 Obsługa różnych typów odpowiedzi
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === "string") {
      imageUrl = output;
    } else if (output?.url) {
      imageUrl = output.url;
    } else if (output?.output?.[0]) {
      imageUrl = output.output[0];
    }

    // jeśli to funkcja (czasem Replicate tak zwraca)
    if (typeof imageUrl === "function") {
      imageUrl = imageUrl();
    }

    if (!imageUrl) {
      console.error("Nieznany format odpowiedzi:", output);
      return res.status(500).json({ error: "Invalid response from model" });
    }

    return res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error("Replicate error:", error);
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
}
