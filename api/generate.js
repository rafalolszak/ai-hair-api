import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "Brak zdjęcia" });

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // Tutaj wpisz wszystkie swoje prompty
  const prompty = [
    "change hairstyle to classic bob, high quality",
    "change hairstyle to long straight blonde hair, high quality",
    "change hairstyle to curtain bangs, high quality",
    "change hairstyle to soft waves, high quality"
  ];

  try {
    const wyniki = [];

    // Generowanie POJEDYNCZO (jeden po drugim)
    for (const p of prompty) {
      const output = await replicate.run(
        "timothybrooks/instruct-pix2pix:df0a50759051030e4635a968644558e0a75d9703487053e1a81284d720235964",
        {
          input: {
            image: image,
            prompt: p,
            num_inference_steps: 25
          }
        }
      );

      let finalUrl = Array.isArray(output) ? output[0] : (output?.url || output);
      wyniki.push({ prompt: p, url: finalUrl });
    }

    // Wysyłka całej paczki po zakończeniu pętli
    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("Błąd:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
