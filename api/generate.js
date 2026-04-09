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

    // 🔥 STYLE
    const styles = [
      "short modern haircut",
      "long wavy hair",
      "bob haircut",
      "curly hairstyle",
      "blonde straight hair"
    ];

    const style = styles[Math.floor(Math.random() * styles.length)];

    // 🔥 REQUEST DO OPENAI (BEZ SDK)
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: `A realistic photo of a person with ${style}, high quality, natural look`,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!data.data) {
      return res.status(500).json({ error: "Błąd OpenAI", details: data });
    }

    const imageBase64 = data.data[0].b64_json;

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
