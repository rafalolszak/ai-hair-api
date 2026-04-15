import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Serwer nie otrzymał zdjęcia." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompty = [
    "change hairstyle to straight blonde hair",
    "change hairstyle to classic bob cut"
  ];

  try {
    // URUCHAMIAMY WSZYSTKIE PROMPTY JEDNOCZEŚNIE
    const obietnice = prompty.map(async (p) => {
      const output = await replicate.run(
        "timothybrooks/instruct-pix2pix:df0a50759051030e4635a968644558e0a75d9703487053e1a81284d720235964", 
        {
          input: {
            image: image, // Sprawdź w dokumentacji modelu czy to "image" czy "image_input"
            prompt: p
          }
        }
      );

      // Bezpieczne wyciąganie URL
      let finalUrl = "";
      if (Array.isArray(output)) finalUrl = output[0];
      else if (typeof output === 'string') finalUrl = output;
      else if (output && output.url) finalUrl = output.url;

      return { prompt: p, url: finalUrl };
    });

    // Czekamy aż wszystkie obietnice zostaną spełnione
    const wyniki = await Promise.all(obietnice);

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ 
      error: "Błąd Replicate: " + error.message 
    });
  }
}
