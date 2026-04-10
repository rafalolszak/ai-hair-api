import Replicate from "replicate";
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { image_url, prompt } = JSON.parse(req.body);

    const prediction = await replicate.predictions.create({
      version: "a718585a51cfc0cc148d8d147dfdec1bc025d5ad19830f30560113f38980a325",
      input: {
        image: image_url,
        prompt: `A professional photo of a person with ${prompt}, cinematic lighting, highly detailed, 8k, realistic skin texture`,
        instant_id_strength: 1.0, // Trzyma twarz użytkownika
        denoising_strength: 0.5,  // Balans między oryginałem a zmianą
        style: "No style"         // Zachowuje fotorealizm
      }
    });

    return res.status(200).json({ id: prediction.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
