export default async function handler(req, res) {

  let body;

  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const image = body?.image;

  if (!image) {
    return res.status(400).json({ error: "Brak zdjęcia" });
  }

  try {

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: "Modern hairstyle, realistic haircut, same face, different hairstyle, professional lighting",
        image: image,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!data || !data.data || !data.data[0]) {
      return res.status(500).json({ error: "Błąd generowania AI", details: data });
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
