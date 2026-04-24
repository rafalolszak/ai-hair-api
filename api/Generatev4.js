import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).json({ error: "Brak zdjęcia lub promptu." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // KLUCZOWE: Niektóre modele Replicate nie przyjmują nagłówka "data:image/..."
    // Jeśli image zawiera przecinek, bierzemy tylko to, co po nim (czysty base64)
    const cleanImage = image.includes(",") ? image.split(",")[1] : image;
    
    // Tworzymy poprawny format URI dla Replicate
    const imageUri = `data:application/octet-stream;base64,${cleanImage}`;

    const output = await replicate.run(
      "google/nano-banana", // Upewnij się na 100%, że to jest poprawny ID modelu
      {
        input: {
          "image_input": [imageUri], // Tablica zgodnie z Twoją dokumentacją
          "prompt": prompt
        }
      }
    );

    let finalUrl = "";
    if (Array.isArray(output)) {
      finalUrl = output[0];
    } else if (typeof output === 'string') {
      finalUrl = output;
    } else if (output && output.url) {
      finalUrl = typeof output.url === 'function' ? output.url() : output.url;
    }

    return res.status(200).json({ url: finalUrl });

  } catch (error) {
    console.error("BŁĄD:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
