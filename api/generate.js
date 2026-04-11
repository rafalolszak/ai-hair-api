import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Odbieramy image oraz prompt (zmieniony na userPrompt, żeby nie mylić z pętlą)
  const { image, prompt: userPrompt } = req.body;

  // Sprawdzenie czy zdjęcie dotarło
  if (!image) {
    return res.status(400).json({ error: "Serwer nie otrzymał zdjęcia." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // LOGIKA PROMPTÓW:
  // Jeśli użytkownik wpisał coś w okienko, używamy tylko tego.
  // Jeśli pole jest puste, używamy Twojej domyślnej listy.
  let promptyDoWykonania = [];

  if (userPrompt && userPrompt.trim().length > 0) {
    // Możesz dodać tu stałe frazy wzmacniające jakość, np. "realistic, 8k"
    promptyDoWykonania = [userPrompt]; 
  } else {
    promptyDoWykonania = [
      "znajdź włosy i zmień je na proste blond",
      // Tutaj możesz dopisać więcej domyślnych fryzur, np.:
      // "shorter hair, dark brown color",
      // "curly hairstyle, red hair"
    ];
  }

  try {
    const wyniki = [];

    for (const p of promptyDoWykonania) {
      const output = await replicate.run(
        "google/nano-banana",
        {
          input: {
            "image_input": [image], 
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
    return res.status(500).json({ 
      error: "Błąd Replicate: " + error.message,
      stack: error.stack 
    });
  }
}
