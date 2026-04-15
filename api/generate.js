import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Metoda niedozwolona" });
  }

  // Odbieramy zdjęcie ORAZ konkretny prompt wysłany z frontendu
  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).json({ error: "Brak zdjęcia lub treści promptu." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // Generujemy TYLKO JEDEN wynik dla otrzymanego promptu
    // Używamy modelu instruct-pix2pix, który najlepiej radzi sobie z edycją zdjęć
    const output = await replicate.run(
      "timothybrooks/instruct-pix2pix:df0a50759051030e4635a968644558e0a75d9703487053e1a81284d720235964",
      {
        input: {
          "image_input": [image],
          prompt: prompt,
          num_inference_steps: 25,
          image_guidance_scale: 1.5,
          guidance_scale: 7.5
        }
      }
    );

    // Wyciąganie URL w bezpieczny sposób (Replicate zwraca URL lub tablicę z URL)
    let finalUrl = "";
    if (Array.isArray(output)) {
      finalUrl = output[0];
    } else if (typeof output === 'string') {
      finalUrl = output;
    } else if (output && output.url) {
      finalUrl = typeof output.url === 'function' ? output.url() : output.url;
    }

    // Zwracamy pojedynczy obiekt z URL, którego spodziewa się frontend
    return res.status(200).json({ url: finalUrl });

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ 
      error: "Błąd serwera: " + error.message 
    });
  }
}
