const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The messed up part is from line 573 down to 602 (the end of the old upload handler)
// Let's just find the first `// 8. Generate Product Landing Page Content via Gemini AI (Admin only)`
// and remove everything between `});` of my new handler and that comment.

const lines = code.split('\n');
const newHandlerEnd = lines.findIndex(l => l === '});'); // this might match other handlers, let's be safe
// Actually, let's just find where "// 8. Generate Product" is.
const genIndex = lines.findIndex(l => l.includes('// 8. Generate Product Landing Page'));
const uploadStart = lines.findIndex(l => l.includes('import { v2 as cloudinary }'));

if (genIndex !== -1 && uploadStart !== -1) {
  // Replace everything between uploadStart and genIndex with the clean handler
  const cleanCode = `
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
  lines.splice(uploadStart, genIndex - uploadStart, cleanCode);
  
  // also move import to top
  const finalCode = lines.join('\n');
  fs.writeFileSync('server.ts', finalCode);
  console.log('Fixed server.ts');
}
