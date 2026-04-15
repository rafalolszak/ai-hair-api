import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Odbieramy zdjęcie ORAZ prompt przesłany z frontendu
  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).json({ error: "Brak zdjęcia lub treści promptu." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // Generujemy tylko JEDNO zdjęcie dla otrzymanego promptu
    const output = await replicate.run(
      "timothybrooks/instruct-pix2pix:df0a50759051030e4635a968644558e0a75d9703487053e1a81284d720235964",
      {
        input: {
          image: image,
          prompt: prompt, // Tutaj trafia to, co wysłał frontend
          num_inference_steps: 25
        }
      }
    );

    // Wyciągamy URL zdjęcia (obsługa różnych formatów Replicate)
    let finalUrl = "";
    if (Array.isArray(output)) {
      finalUrl = output[0];
    } else if (typeof output === 'string') {
      finalUrl = output;
    } else if (output && output.url) {
      finalUrl = typeof output.url === 'function' ? output.url() : output.url;
    }

    // Zwracamy pojedynczy wynik
    return res.status(200).json({ url: finalUrl });

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
