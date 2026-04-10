import OpenAI from "openai";
import fetch from "node-fetch";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    // 🔥 URL NA STAŁE (najprościej)
    const imageUrl = "https://images.unsplash.com/photo-1594824475317-3f3d7a8c3b0d";

    // Pobierz obraz
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();

    const imageFile = new File([arrayBuffer], "image.png", {
      type: "image/png",
    });

    const result = await client.images.edit({
      model: "gpt-image-1.5",
      image: [imageFile],
      prompt: "Zmień fryzurę na nowoczesną fade",
    });

    const base64 = result.data[0].b64_json;

    // 👇 ZWRACAMY GOTOWY OBRAZ
    res.status(200).json({
      image: `data:image/png;base64,${base64}`,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
