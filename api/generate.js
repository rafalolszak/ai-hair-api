import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image } = req.body;

  // Sprawdzenie czy zdjęcie dotarło
  if (!image) {
    return res.status(400).json({ error: "Serwer nie otrzymał zdjęcia." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompty = [
"change hairstyle to classic bob"
"change hairstyle to long straight hair"
// "change hairstyle to softwaves"
// "change hairstyle to curtain bungs"
// "change hairstyle to slidepart"
// "change hairstyle to hightponytail"
// "change hairstyle to layered shag
// "change hairstyle to french braid"
// "change hairstyle to blond baleyage"
// "zmień kolor włosów na rudę"
   
  ];

  try {
    const wyniki = [];

    for (const p of prompty) {
      // Zmieniamy strukturę zapytania na taką, którą Replicate akceptuje najlepiej
      const output = await replicate.run(
        "google/nano-banana",
        {
          input: {
            "image_input": [image], // Wysyłamy bezpośrednio jako string (bez [])
            "prompt": p
          }
        }
      );

      // Wyciąganie URL w bezpieczny sposób
      let finalUrl = "";
      if (Array.isArray(output)) {
        finalUrl = output[0];
      } else if (output && typeof output === 'string') {
        finalUrl = output;
      } else if (output && output.url) {
        finalUrl = typeof output.url === 'function' ? output.url() : output.url;
      }

      wyniki.push({ prompt: p, url: finalUrl });
    }

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    // Zwracamy konkretny błąd do Shopify, żebyś widział go w konsoli
    return res.status(500).json({ 
      error: "Błąd Replicate: " + error.message,
      stack: error.stack 
    });
  }
}
