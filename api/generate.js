import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, prompt: rawPrompt } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Serwer nie otrzymał zdjęcia." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // --- LOGIKA ROZBICIA PROMPTU ---
  let promptyDoWykonania = [];
  let additionalDetails = "";

  if (rawPrompt && rawPrompt.includes("Styles:")) {
    // Wyciągamy to co jest między "Styles:" a "Details:"
    const stylesPart = rawPrompt.split('Details:')[0].replace('Styles:', '').trim();
    // Wyciągamy dodatkowe uwagi użytkownika
    additionalDetails = rawPrompt.split('Details:')[1]?.trim() || "";

    // Tworzymy tablicę wybranych fryzur
    const wybraneStyle = stylesPart.split(',').map(s => s.trim()).filter(s => s !== "");

    if (wybraneStyle.length > 0) {
      // Dla każdego zaznaczonego stylu tworzymy osobny, pełny prompt dla AI
      promptyDoWykonania = wybraneStyle.map(style => 
        `high quality photo of a person with ${style} hairstyle, ${additionalDetails}, photorealistic, 8k`
      );
    }
  } 

  // Jeśli tablica nadal jest pusta (użytkownik nic nie kliknął, tylko wpisał tekst)
  if (promptyDoWykonania.length === 0) {
    const fallbackPrompt = rawPrompt || "znajdź włosy i zmień je na proste blond";
    promptyDoWykonania = [fallbackPrompt];
  }

  try {
    const wyniki = [];

    // Pętla wykonuje się tyle razy, ile stylów zaznaczył użytkownik
    for (const p of promptyDoWykonania) {
      const output = await replicate.run(
        "google/nano-banana", // Upewnij się, że to poprawny model do edycji włosów
        {
          input: {
            "image_input": [image], 
            "prompt": p
          }
        }
      );

      let finalUrl = "";
      if (Array.isArray(output)) {
        finalUrl = output[0];
      } else if (typeof output === 'string') {
        finalUrl = output;
      } else if (output?.url) {
        finalUrl = typeof output.url === 'function' ? output.url() : output.url;
      }

      // prompt w wynikach to nazwa konkretnej fryzury, żeby frontend mógł ją podpisać
      wyniki.push({ prompt: p, url: finalUrl });
    }

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ 
      error: "Błąd Replicate: " + error.message
    });
  }
}
