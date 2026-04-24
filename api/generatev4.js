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
    // Seedream wymaga, aby obraz był przekazany w formacie, który Replicate rozumie
    // Często najlepiej działa przesłanie czystego base64 (z nagłówkiem data:image/jpeg;base64,...)
    // lub bezpośrednio jako string.
    
    const output = await replicate.run(
      "bytedance/seedream-4.5", 
      {
        input: {
          image_input: [image], // Model wymaga tablicy (array)
          prompt: prompt,
          size: "2K",
          aspect_ratio: "match_input_image",
          sequential_image_generation: "disabled"
        }
      }
    );

    // Obsługa wyjścia modelu (Seedream zwraca URL obrazu)
    let finalUrl = "";
    if (Array.isArray(output)) {
      finalUrl = output[0];
    } else {
      finalUrl = output;
    }

    return res.status(200).json({ url: finalUrl });

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error);
    return res.status(500).json({ error: error.message });
  }
}
