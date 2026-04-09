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
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    const styles = [
      "short modern haircut",
      "long wavy hair",
      "bob haircut",
      "curly hairstyle",
      "blonde straight hair"
    ];

    const style = styles[Math.floor(Math.random() * styles.length)];

    // 🔥 IMAGE EDITING
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        image: image,
        prompt: `Edit this image: change ONLY the hairstyle to ${style}. Keep the same face, same person, same lighting, ultra realistic.`,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!data.data) {
      return res.status(500).json({ error: "Błąd AI", details: data });
    }

    const imageBase64 = data.data[0].b64_json;

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
