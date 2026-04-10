import Replicate from "replicate";
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export default async function handler(req, res) {
  const { image_url, prompt } = JSON.parse(req.body);

  try {
    // 1. GENEROWANIE MASKI (Automatyczne wykrywanie włosów)
    const maskPrediction = await replicate.run(
      "lucataco/segment-anything-post-processor:0076a084df7026df17332c9431e6c38b698114f1146399a9b69b59d9c242a514",
      { input: { image: image_url, mask_only: true } }
    );
    
    const mask_url = maskPrediction.mask;

    // 2. GENEROWANIE FRYZURY (Inpainting)
    const prediction = await replicate.predictions.create({
      version: "9548f65cc7f278416215a0bc054b6732997198754b7324c00078864f1d44102c",
      input: {
        image: image_url,
        mask: mask_url, // Przekazujemy wygenerowaną maskę!
        prompt: `professional photo of a person with ${prompt}, salon quality`,
        num_inference_steps: 25,
        mask_blur: 0.1
      }
    });

    return res.status(200).json({ id: prediction.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
