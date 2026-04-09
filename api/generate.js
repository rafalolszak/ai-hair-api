export default async function handler(req, res) {

  let body;

  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const base64 = body?.image;

  if (!base64) {
    return res.status(400).json({ error: "Brak zdjęcia" });
  }

  try {
    // 🔥 KONWERSJA BASE64 → BINARY
    const base64Data = base64.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // 🔥 FORMDATA
    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append("prompt", "Modern hairstyle, realistic haircut, same face, different hairstyle");
    formData.append("image[]", new Blob([buffer]), "photo.png");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();

    if (!data || !data.data || !data.data[0]) {
      return res.status(500).json({
        error: "Błąd AI",
        details: data
      });
    }

    return res.status(200).json({
      image: data.data[0].url
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
