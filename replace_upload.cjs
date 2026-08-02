const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

const newUploadCode = `
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.post("/api/upload", adminAuth, async (req: Request, res: Response) => {
  const { imageBase64, fileName } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "الرجاء توفير الصورة للرفع." });
  }

  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "إعدادات Cloudinary غير متوفرة. الرجاء إضافتها في الإعدادات (Secrets)." });
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "jannastore_products",
      resource_type: "image"
    });
    
    // Return the secure URL from Cloudinary
    res.json({ url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error("Error saving uploaded image to Cloudinary:", error);
    res.status(500).json({ error: "فشل رفع الصورة إلى Cloudinary.", details: error.message });
  }
});
`;

const lines = code.split('\n');
const startUpload = lines.findIndex(l => l.includes('app.post("/api/upload"'));
const endUpload = lines.findIndex((l, i) => i > startUpload && l.includes('});'));

if (startUpload !== -1 && endUpload !== -1) {
  lines.splice(startUpload, endUpload - startUpload + 1, newUploadCode);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log('Replaced upload handler successfully.');
} else {
  console.log('Could not find upload handler', startUpload, endUpload);
}
