export default async function handler(req, res) {
  try {

    let body = req.body;

    // 🔥 jeśli body nie istnieje — próbujemy ręcznie
    if (!body || Object.keys(body).length === 0) {
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks).toString();

        if (raw) {
          body = JSON.parse(raw);
        }
      } catch (e) {
        body = {};
      }
    }

    const image = body?.image;

    if (!image) {
      return res.status(400).json({
        error: "Brak image w body"
      });
    }

    // 🔥 TEST
    return res.status(200).json({
      image: "https://picsum.photos/400/500"
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
}
