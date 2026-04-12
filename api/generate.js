import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, prompt } = req.body;

  if (!image || !prompt) return res.status(400).json({ error: "Brak danych." });

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  try {
    const output = await replicate.run(
      "google/nano-banana",
      {
        input: {
          "image_input": [image],
          "prompt": prompt
        }
      }
    );

    let url = Array.isArray(output) ? output[0] : (output?.url || output);
    if (typeof url === 'function') url = url();

    // Zwracamy tylko jeden obiekt
    return res.status(200).json({ url: url });

  } catch (error) {
    console.error("Błąd Replicate:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
