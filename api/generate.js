import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Serwer nie otrzymał zdjęcia." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompty = [
    "change hairstyle to classic bob, do not change the face position"
    
  ];

  try {
    // URUCHAMIAMY WSZYSTKO JEDNOCZEŚNIE (SZYBCIEJ)
    const obietnice = prompty.map(p => 
      replicate.run(
        "timothybrooks/instruct-pix2pix:df0a50759051030e4635a968644558e0a75d9703487053e1a81284d720235964", // Przykładowy model do edycji
        {
          input: {
            image: image, // Wysyłamy string
            prompt: p,
            num_inference_steps: 20 // Możesz zmniejszyć dla szybkości
          }
        }
      ).then(output => {
        // Logika wyciągania URL
        let finalUrl = Array.isArray(output) ? output[0] : (output?.url || output);
        return { prompt: p, url: finalUrl };
      })
    );

    const wyniki = await Promise.all(obietnice);

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ 
      error: "Błąd Replicate: " + error.message 
    });
  }
}
