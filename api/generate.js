import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  // Nagłówki dla Shopify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Odczyt danych z Shopify
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { image_url, prompt } = body;

    console.log("Otrzymano prośbę o generowanie dla:", prompt);

    if (!image_url) throw new Error("Brak obrazu w żądaniu");

    // Start zadania w Replicate
    const prediction = await replicate.predictions.create({
      // Używamy stabilnego modelu inpainting
      version: "9548f65cc7f278416215a0bc054b6732997198754b7324c00078864f1d44102c",
      input: {
        image: image_url,
        prompt: `A professional realistic photo of a person with ${prompt}, salon quality`,
        num_inference_steps: 25
      }
    });

    console.log("Zadanie utworzone, ID:", prediction.id);
    return res.status(200).json({ id: prediction.id });

  } catch (error) {
    console.error("SZCZEGÓŁY BŁĘDU:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
