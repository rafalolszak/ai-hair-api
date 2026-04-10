export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // --- POPRAWKA TUTAJ ---
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { /* nie JSON */ }
    }
    
    const image_url = body?.image_url;
    const prompt = body?.prompt || "long blonde hair";

    if (!image_url) {
      return res.status(400).json({ error: "Nie wysłałeś zdjęcia!" });
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "9548f65cc7f278416215a0bc054b6732997198754b7324c00078864f1d44102c",
        input: { image: image_url, prompt: `professional photo, ${prompt}`, num_inference_steps: 25 },
      }),
    });

    const data = await response.json();
    return res.status(200).json({ id: data.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
