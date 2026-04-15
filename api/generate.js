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
  "change hairstyle to classic bob,do not change the face position",
 //"change hairstyle to long straight hair, do not change the face position"
//"change hairstyle to softwaves, do not change the face position",
// "change hairstyle to curtain bangs, do not change the face position",
  //"change hairstyle to sidepart, do not change the face position"
  // "change hairstyle to high ponytail, do not change the face position",
  // "change hairstyle to layered shag, do not change the face position",
  // "change hairstyle to french braid, do not change the face position",
  // "change hairstyle to blond balayage, do not change the face position",
  // "zmień kolor włosów na rude, do not change the face position"
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
}    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ 
      error: "Błąd Replicate: " + error.message 
    });
  }
}
