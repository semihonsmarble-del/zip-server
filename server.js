import express from "express";
import axios from "axios";
import JSZip from "jszip";

const app = express();

// ✅ FULL CORS (Shopify + Firebase sorunsuz)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json({ limit: "10mb" }));

// ✅ ZIP API
app.post("/download-zip", async (req, res) => {
  const { images } = req.body;

  if (!images || !images.length) {
    return res.status(400).send("No images");
  }

  const zip = new JSZip();

  for (let i = 0; i < images.length; i++) {
    const { url, name } = images[i];

    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const safeName = (name || `image_${i + 1}`)
        .replace(/[\\/:*?"<>|]/g, "_");

      zip.file(`${safeName}.jpg`, response.data);

    } catch (err) {
      console.log("Download error:", url);
    }
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });

  res.set({
    "Content-Type": "application/zip",
    "Content-Disposition": "attachment; filename=images.zip"
  });

  res.send(content);
});

// ✅ SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
