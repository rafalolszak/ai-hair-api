import OpenAI from "openai";
import fetch from "node-fetch";
import { File } from "node:buffer";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // 🔥 prosty URL (na stałe)
    const imageUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9";

    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();

    const file = new File([arrayBuffer], "image.png", {
      type: "image/png",
    });

    const result = await client.images.edit({
      model: "gpt-image-1.5",
      image: [file],
      prompt: "Nowoczesna fryzura fade, realistyczna",
    });

    const base64 = result.data[0].b64_json;

    return res.status(200).json({
      image: `data:image/png;base64,${base64}`,
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}
