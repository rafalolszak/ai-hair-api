import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image_url, prompt } = JSON.parse(req.body);

    // KROK 1: Automatyczna maska włosów
    const segmentation = await replicate.run(
      "lucataco/segment-anything-post-processor:0076a084df7026df17332c9431e6c38b698114f1146399a9b69b59d9c242a514",
      { input: { image: image_url, mask_only: true } }
    );

    // KROK 2: Stable Diffusion Inpainting
    const prediction = await replicate.predictions.create({
      version: "9548f65cc7f278416215a0bc054b6732997198754b7324c00078864f1d44102c",
      input: {
        image: image_url,
        mask: segmentation.mask,
        prompt: `A highly realistic, professional salon photo of a person with ${prompt}, natural hair texture, highly detailed, 8k resolution`,
        negative_prompt: "cartoon, anime, low quality, distorted face, messy, ugly",
        num_inference_steps: 30,
        mask_blur: 0.1
      }
    });

    return res.status(200).json({ id: prediction.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
