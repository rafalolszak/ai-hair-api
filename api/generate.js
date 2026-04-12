import Replicate from "replicate";

export default async function handler(req, res) {
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

  let promptyDoWykonania = [];
  let additionalDetails = "";

  // Rozbijanie promptu z frontendu
  if (rawPrompt && rawPrompt.includes("Styles:")) {
    const stylesPart = rawPrompt.split('Details:')[0].replace('Styles:', '').trim();
    additionalDetails = rawPrompt.split('Details:')[1]?.trim() || "";
    const wybraneStyle = stylesPart.split(',').map(s => s.trim()).filter(s => s !== "");

    if (wybraneStyle.length > 0) {
      promptyDoWykonania = wybraneStyle.map(style => ({
        displayTag: style, // zachowujemy krótką nazwę do wyświetlenia
        fullPrompt: `high quality photo of a person with ${style} hairstyle, ${additionalDetails}, photorealistic, 8k`
      }));
    }
  } 

  if (promptyDoWykonania.length === 0) {
    promptyDoWykonania = [{
      displayTag: "Metamorfoza",
      fullPrompt: rawPrompt || "znajdź włosy i zmień je na proste blond"
    }];
  }

  try {
    // KLUCZOWA ZMIANA: Wysyłamy wszystkie zapytania naraz (równolegle)
    const obietniceGeneracji = promptyDoWykonania.map(async (item) => {
      const output = await replicate.run(
        "google/nano-banana",
        {
          input: {
            "image_input": [image], 
            "prompt": item.fullPrompt
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

      return { prompt: item.displayTag, url: finalUrl };
    });

    // Czekamy aż wszystkie zapytania wrócą
    const wyniki = await Promise.all(obietniceGeneracji);

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ 
      error: "Błąd: " + error.message
    });
  }
}
