import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const prediction = await replicate.predictions.get(id);
    res.status(200).json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
