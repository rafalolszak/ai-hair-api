import FormData from "form-data";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {

  // ✅ CORS
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
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    // 🔥 base64 → buffer
    const base64Data = image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    // 🔥 form-data (Node version)
    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append("image", buffer, {
      filename: "photo.png",
      contentType: "image/png",
    });

    formData.append(
      "prompt",
      "Change ONLY hairstyle. Keep same face, same person, same lighting, ultra realistic, different hairstyle."
    );

    // 🔥 request do OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        body: formData,
      }
    );

    const data = await response.json();

    // 🔥 DEBUG (zobaczysz w logach)
    console.log("OPENAI RESPONSE:", JSON.stringify(data));

    // ❌ jeśli OpenAI zwróci błąd
    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI error",
        details: data,
      });
    }

    // ❌ jeśli brak obrazu
    if (!data.data || !data.data[0]) {
      return res.status(500).json({
        error: "Brak obrazu",
        details: data,
      });
    }

    // ✅ sukces
    const imageBase64 = data.data[0].b64_json;

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`,
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}
