import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { ProductData, Order, OrderStatus, Wilaya, TelegramSettings, StoreSettings } from "./src/types";
import { ALGERIAN_WILAYAS } from "./src/components/WilayaData";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "cod_store_db.json");

const defaultTelegramSettings: TelegramSettings = {
  botToken: "8961528392:AAFW0btuFMIX-Q6Z3QBCT1oUO7MYNxlsSVE",
  chatId: "-1004320308373",
  enabled: true
};

const defaultStoreSettings: StoreSettings = {
  storeName: "جنة ستور | Janna Store 🛍️",
  storeSub: "متجركم المفضل للتسوق الإلكتروني في الجزائر 🇩🇿",
  tickerItems: [
    "🚚 توصيل سريع وآمن لباب المنزل متوفر لـ 58 ولاية جزائرية!",
    "⭐ جودة ممتازة وخامات أصلية ممتازة مختارة ومضمونة 100% من متجرنا",
    "💵 الدفع عند الاستلام - افحصي سلعتك وتأكدي منها بحرية تامة قبل الدفع",
    "🔄 الضمان الذهبي: استبدال مجاني أو استرجاع الأموال سهل وسريع خلال 7 أيام",
    "💥 أسعار مناسبة وجد تنافسية مع تخفيضات حصرية كبرى تصل إلى 40%",
    "📞 خدمة زبائن متميزة متوفرة هاتفياً لتأكيد طلبياتكم والإجابة على أي استفسار"
  ]
};


// Ensure express json body-parser can accept large base64 images
app.use(express.json({ limit: "15mb" }));

// Create uploads folder for computer uploaded product images
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images static route
app.use("/uploads", express.static(UPLOADS_DIR));

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح API لـ Gemini غير متوفر. الرجاء إعداده في الإعدادات (Secrets).");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Gemini JSON Response Schema
const productAiSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "اسم المنتج باللغة العربية، جذاب ومقنع للمشترين الجزائريين" },
    subtitle: { type: Type.STRING, description: "عنوان فرعي مشوق يبرز القيمة الأساسية للمنتج ويحث على الشراء" },
    description: { type: Type.STRING, description: "وصف كامل ومفصل ومقنع للمنتج بأسلوب تسويقي رائع ومناسب للسوق الجزائري، مع توضيح الفوائد وكيفية الاستعمال، استخدم السطور الفارغة للتنسيق" },
    price: { type: Type.INTEGER, description: "سعر المنتج المقترح بالدينار الجزائري (مثلا 5900)" },
    oldPrice: { type: Type.INTEGER, description: "السعر القديم قبل الخصم بالدينار الجزائري (مثلا 9500)" },
    promoText: { type: Type.STRING, description: "عبارة ترويجية تشجيعية (مثل شحن مجاني، تخفيض اليوم، الدفع عند الاستلام)" },
    features: {
      type: Type.ARRAY,
      description: "4 مميزات رئيسية للمنتج لتسهيل القراءة وتوضيح فوائده للمشتري",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "معرف فريد مثل f1, f2, f3, f4" },
          title: { type: Type.STRING, description: "عنوان ميزة فريد ومختصر وجذاب" },
          description: { type: Type.STRING, description: "وصف مختصر للميزة يوضح الفائدة العملية للمشتري" },
          icon: { type: Type.STRING, description: "اسم الأيقونة المناسبة من مكتبة lucide-react (مثل: Wind, Layers, ShieldCheck, Sparkles, Heart, Star, CheckCircle, Flame, Zap, ShoppingBag, Clock, Gift, Award)" }
        },
        required: ["id", "title", "description", "icon"]
      }
    },
    reviews: {
      type: Type.ARRAY,
      description: "3 آراء ومراجعات لزبائن جزائريين مفترضين بالدرجة الجزائرية (الدارجة) لتكون واقعية جداً ومقنعة",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "معرف فريد مثل r1, r2, r3" },
          name: { type: Type.STRING, description: "اسم جزائري ثلاثي أو ثنائي واقعي (مثل أمينة ب.، محمد م.، سارة ق.)" },
          rating: { type: Type.INTEGER, description: "تقييم من 4 إلى 5 نجوم" },
          comment: { type: Type.STRING, description: "تعليق زبون بالعامية الجزائرية (الدارجة) يعبر عن فرحته بالمنتج وسرعة التوصيل والتعامل الحسن" },
          date: { type: Type.STRING, description: "تاريخ حديث بصيغة YYYY-MM-DD" },
          wilaya: { type: Type.STRING, description: "اسم ولاية جزائرية واقعية (مثل الجزائر، وهران، قسنطينة، سطيف، تيزي وزو، الشلف، باتنة)" }
        },
        required: ["id", "name", "rating", "comment", "date", "wilaya"]
      }
    }
  },
  required: ["title", "subtitle", "description", "price", "oldPrice", "promoText", "features", "reviews"]
};

// Default product data
const defaultProduct: ProductData = {
  title: "مصفف ومجفف الشعر الاحترافي 5 في 1",
  subtitle: "أحصلي على تسريحة صالون احترافية في منزلك في دقائق معدودة!",
  description: "جهاز تصفيف الشعر المتكامل 5 في 1 هو الحل المثالي لكل امرأة تبحث عن شعر ناعم، مموج أو كيرلي دون عناء أو تلف لخصيلات الشعر. يعمل بتقنية تدفق الهواء الذكية لتجفيف وتصفيف الشعر بلطف وحمايته من الحرارة الزائدة.\n\nلماذا تختارين هذا المصفف؟\n• 5 ملحقات مختلفة لتجفيف، تمليس، وتمويج الشعر.\n• تحكم ذكي بـ 3 مستويات من الحرارة وسرعة الهواء.\n• طلاء سيراميك متطور لتوزيع متساوي للحرارة وتقليل التكهرب.\n• تصميم مريح وخفيف الوزن يدور 360 درجة لسهولة الحركة.",
  price: 5900,
  oldPrice: 9500,
  promoText: "🔥 عرض خاص: تخفيض 40% اليوم فقط + التوصيل سريع والدفع عند الاستلام!",
  stockCount: 14,
  videoUrl: "",
  images: [
    { id: "1", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80", isMain: true },
    { id: "2", url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&auto=format&fit=crop&q=80", isMain: false },
    { id: "3", url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop&q=80", isMain: false },
    { id: "4", url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop&q=80", isMain: false }
  ],
  features: [
    { id: "f1", title: "تكنولوجيا تدفق الهواء", description: "يسرح ويجفف شعرك في نفس الوقت باستعمال الهواء الساخن دون حرق خصيلات الشعر", icon: "Wind" },
    { id: "f2", title: "5 ملحقات في علبة واحدة", description: "يحتوي على رؤوس مخصصة للتنعيم، التكثيف، التمويج السريع وتجفيف الشعر الكثيف", icon: "Layers" },
    { id: "f3", title: "حماية مطلقة لشعرك", description: "تنظيم حراري ذكي يقيس الحرارة باستمرار ليبقى شعرك صحياً ولامعاً وخالياً من التقصف", icon: "ShieldCheck" },
    { id: "f4", title: "سهل وسريع الاستعمال", description: "تسريحة صالون كاملة في أقل من 15 دقيقة فقط في المنزل، مما يوفر وقتك وأموالك المهدورة", icon: "Sparkles" }
  ],
  reviews: [
    { id: "r1", name: "أمينة ب.", rating: 5, comment: "روعة بزااف وسهل الاستعمال، شعري رجع رطب وهايل في دقائق. التوصيل جاني في يومين للجزائر العاصمة والتعامل تاعهم هايل.", date: "2026-07-28", wilaya: "الجزائر" },
    { id: "r2", name: "مريم ل.", rating: 5, comment: "المنتج توب توب توب! جربت شحال من مصفف بصح هذا أحسنهم بفضل الرؤوس المتنوعة، ننصح بيه كل وحدة مهتمة بشعرها.", date: "2026-07-29", wilaya: "وهران" },
    { id: "r3", name: "ياسمين ق.", rating: 4, comment: "هايل بزااف يبرد القلب، العلبة جات مغلفة مليح والجهاز جودتو ممتازة، برك التوصيل طول شوية لورقلة بصح يستاهل الانتظار.", date: "2026-07-30", wilaya: "ورقلة" }
  ]
};

// Database structure
interface DBStructure {
  product: ProductData;
  products?: ProductData[];
  orders: Order[];
  wilayas?: Wilaya[];
  telegramSettings?: TelegramSettings;
  storeSettings?: StoreSettings;
  defaultProductSlug?: string;
}



import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
const STORE_DOC_ID = "main_store";

// Read database
async function getDB(): Promise<DBStructure> {
  try {
    const docRef = doc(firestore, 'store', STORE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const parsed = docSnap.data() as DBStructure;
      let updated = false;
      if (!parsed.wilayas) {
        parsed.wilayas = ALGERIAN_WILAYAS;
        updated = true;
      }
      if (!parsed.telegramSettings) {
        parsed.telegramSettings = defaultTelegramSettings;
        updated = true;
      }
      if (!parsed.storeSettings) {
        parsed.storeSettings = defaultStoreSettings;
        updated = true;
      }
      if (!parsed.products || parsed.products.length === 0) {
        const defaultP = { ...parsed.product };
        if (!defaultP.id) defaultP.id = "p1";
        if (!defaultP.slug) defaultP.slug = "hairstyler";
        parsed.products = [defaultP];
        updated = true;
      }
      // Ensure all products in the list have id and slug
      parsed.products.forEach((p, index) => {
        if (!p.id) {
          p.id = "p" + Math.floor(100000 + Math.random() * 900000);
          updated = true;
        }
        if (!p.slug) {
          p.slug = "product-" + p.id;
          updated = true;
        }
      });
      if (updated) {
        await saveDB(parsed);
      }
      return parsed;
    }
  } catch (error) {
    console.error("Error reading database from Firestore, using defaults:", error);
  }
  
  // Create default db
  const firstProduct = { ...defaultProduct, id: "p1", slug: "hairstyler" };
  const defaultDB: DBStructure = {
    product: defaultProduct,
    products: [firstProduct],
    orders: [],
    wilayas: ALGERIAN_WILAYAS,
    telegramSettings: defaultTelegramSettings,
    storeSettings: defaultStoreSettings
  };
  await saveDB(defaultDB);
  return defaultDB;
}

// Write database
async function saveDB(data: DBStructure) {
  try {
    const docRef = doc(firestore, 'store', STORE_DOC_ID);
    await setDoc(docRef, data);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
  }
}

// Authentication middleware
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const adminToken = req.headers["x-admin-token"] || req.query.admin_token;
  if (adminToken === "ADMINMASTER") {
    next();
  } else {
    res.status(401).json({ error: "غير مصرح لك بالدخول، يرجى تقديم رمز الإدارة الصحيح." });
  }
};

// Helper to escape HTML special characters
function escapeHTML(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Helper to send order notification to Telegram
async function sendTelegramNotification(order: Order, productName: string, productPrice: number) {
  const db = await getDB();
  const settings = db.telegramSettings || defaultTelegramSettings;

  if (!settings.enabled) {
    console.log("Telegram notifications are disabled in settings");
    return;
  }

  const token = settings.botToken || "8961528392:AAFW0btuFMIX-Q6Z3QBCT1oUO7MYNxlsSVE";
  const chatId = settings.chatId || "-1004320308373";

  const escCustomerName = escapeHTML(order.customerName);
  const escPhone = escapeHTML(order.phone);
  const escWilayaName = escapeHTML(order.wilayaName);
  const escCommune = escapeHTML(order.commune);
  const escProductName = escapeHTML(productName);
  const escNotes = escapeHTML(order.notes || "لا توجد ملاحظة");

  const message = `
📦 <b>طلب جديد في جنة ستور!</b> 📦

👤 <b>الاسم الكامل:</b> ${escCustomerName}
📞 <b>رقم الهاتف:</b> ${escPhone}
📍 <b>الولاية:</b> ${escWilayaName} (رقم ${order.wilayaNum})
🏡 <b>البلدية:</b> ${escCommune}

🛒 <b>تفاصيل المنتج:</b>
• <b>المنتج:</b> ${escProductName}
• <b>سعر الحبة:</b> ${productPrice} دج
• <b>الكمية:</b> ${order.quantity} حبة

💵 <b>الحساب النهائي:</b>
• <b>سعر المنتج الإجمالي:</b> ${productPrice * order.quantity} دج
• <b>تكلفة الشحن:</b> ${order.shippingPrice} دج
• <b>المبلغ الإجمالي للدفع:</b> <b>${order.totalPrice} دج</b>

📝 <b>ملاحظة الزبون:</b>
${escNotes}

---
🆔 <b>رقم الطلب:</b> <code>${order.id}</code>
📅 <b>تاريخ الطلب:</b> ${new Date(order.createdAt).toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' })}
  `.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      })
    });
    if (!response.ok) {
      console.error("Failed to send telegram notification:", await response.text());
    } else {
      console.log("Telegram notification sent successfully!");
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}

// API Endpoints

// 1. Get Product Data (Fallback/first product or selected active default product)
app.get("/api/product", async (req: Request, res: Response) => {
  const db = await getDB();
  const defaultSlug = db.defaultProductSlug;
  const activeProduct = (db.products && defaultSlug) 
    ? (db.products.find(p => p.slug === defaultSlug) || db.products[0] || db.product)
    : (db.products?.[0] || db.product);
  res.json(activeProduct);
});

// 2. Update Product Data (Admin only - Fallback/first product)
app.post("/api/product", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  db.product = req.body;
  if (db.products && db.products.length > 0) {
    db.products[0] = { ...db.products[0], ...req.body };
  } else {
    db.products = [{ ...req.body, id: "p1", slug: "hairstyler" }];
  }
  await saveDB(db);
  res.json({ success: true, message: "تم تحديث محتوى صفحة الهبوط بنجاح!", product: db.products[0] });
});

// 2b. Get All Products List (Public or Admin)
app.get("/api/products", async (req: Request, res: Response) => {
  const db = await getDB();
  const products = db.products || [db.product];
  const defaultSlug = db.defaultProductSlug || products[0]?.slug;
  const productsWithDefault = products.map(p => ({
    ...p,
    isDefault: p.slug === defaultSlug
  }));
  res.json(productsWithDefault);
});

// New: Set default landing page for homepage
app.post("/api/products/set-default", adminAuth, async (req: Request, res: Response) => {
  const { slug } = req.body;
  if (!slug) {
    return res.status(400).json({ error: "الرابط الفريد (Slug) مطلوب." });
  }
  const db = await getDB();
  const products = db.products || [db.product];
  const exists = products.some(p => p.slug === slug);
  if (!exists && db.product.slug !== slug) {
    return res.status(404).json({ error: "المنتج غير موجود." });
  }
  db.defaultProductSlug = slug;
  await saveDB(db);
  res.json({ success: true, message: "تم تعيين الصفحة كصفحة رئيسية بنجاح!", defaultProductSlug: slug });
});

// 2c. Get Product By Slug (Public)
app.get("/api/products/:slug", async (req: Request, res: Response) => {
  const db = await getDB();
  const { slug } = req.params;
  const product = db.products?.find(p => p.slug === slug);
  if (!product) {
    return res.status(404).json({ error: "هذه الصفحة غير موجودة أو تم حذفها." });
  }
  res.json(product);
});

// 2d. Create or Update Product (Admin only)
app.post("/api/products/save", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  const productData = req.body;
  if (!productData.title || !productData.slug) {
    return res.status(400).json({ error: "اسم المنتج والرابط الفريد (Slug) مطلوبان." });
  }

  // Format slug to be URL friendly
  const formattedSlug = productData.slug.toLowerCase().trim().replace(/[^a-z0-9-_\u0600-\u06FF]/g, '-').replace(/-+/g, '-');

  // Check if slug is already used by another product
  const existingWithSlug = db.products?.find(p => p.slug === formattedSlug && p.id !== productData.id);
  if (existingWithSlug) {
    return res.status(400).json({ error: "الرابط الفريد (Slug) مستخدم بالفعل لمنتج آخر. يرجى اختيار رابط مختلف." });
  }

  if (!db.products) {
    db.products = [];
  }

  const updatedProductData = {
    ...productData,
    slug: formattedSlug
  };

  if (updatedProductData.id) {
    // Update existing
    const index = db.products.findIndex(p => p.id === updatedProductData.id);
    if (index !== -1) {
      db.products[index] = { ...db.products[index], ...updatedProductData };
    } else {
      db.products.push(updatedProductData);
    }
  } else {
    // Add new
    const newProduct = {
      ...updatedProductData,
      id: "p" + Math.floor(100000 + Math.random() * 900000)
    };
    db.products.push(newProduct);
  }

  // Ensure first product matches db.product fallback
  if (db.products.length > 0) {
    db.product = db.products[0];
  }

  await saveDB(db);
  res.json({ success: true, message: "تم حفظ المنتج وصفحة الهبوط بنجاح!", products: db.products });
});

// 2e. Delete Product (Admin only)
app.delete("/api/products/:id", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  const { id } = req.params;

  if (!db.products || db.products.length <= 1) {
    return res.status(400).json({ error: "لا يمكن حذف المنتج الوحيد في المتجر. يجب أن يحتوي المتجر على منتج واحد على الأقل." });
  }

  const index = db.products.findIndex(p => p.id === id || p.slug === id);
  if (index === -1) {
    return res.status(404).json({ error: "المنتج غير موجود." });
  }

  db.products.splice(index, 1);
  // Update fallback product to be the new first product
  db.product = db.products[0];

  await saveDB(db);
  res.json({ success: true, message: "تم حذف المنتج بنجاح!", products: db.products });
});

// 3. Create a New Order
app.post("/api/orders", async (req: Request, res: Response) => {
  const { customerName, phone, wilayaNum, wilayaName, commune, quantity, notes, totalPrice, shippingPrice, productSlug } = req.body;
  
  if (!customerName || !phone || !wilayaName || !commune || !quantity) {
    return res.status(400).json({ error: "جميع الحقول الأساسية مطلوبة لإتمام الطلب." });
  }

  const db = await getDB();
  const productsList = db.products || [db.product];
  const orderProduct = productsList.find(p => p.slug === productSlug) || productsList[0] || db.product;

  const newOrder: Order = {
    id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
    customerName,
    phone,
    wilayaNum: Number(wilayaNum),
    wilayaName,
    commune,
    quantity: Number(quantity),
    notes: notes || "",
    totalPrice: Number(totalPrice),
    shippingPrice: Number(shippingPrice),
    status: "pending",
    createdAt: new Date().toISOString(),
    productSlug: orderProduct.slug || "hairstyler",
    productName: orderProduct.title
  };

  db.orders.unshift(newOrder); // Add to the beginning
  await saveDB(db);

  // Send Telegram Notification in background
  sendTelegramNotification(newOrder, orderProduct.title, orderProduct.price).catch(err => {
    console.error("Error calling sendTelegramNotification:", err);
  });

  res.status(201).json({ success: true, message: "تم إرسال طلبك بنجاح! سنتصل بك هاتفياً لتأكيد الطلب والتوصيل.", order: newOrder });
});

// 4. Get All Orders (Admin only)
app.get("/api/orders", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  res.json(db.orders);
});

// 5. Update Order Status (Admin only)
app.put("/api/orders/:id", adminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "حالة الطلب مطلوبة." });
  }

  const db = await getDB();
  const orderIndex = db.orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: "الطلب غير موجود." });
  }

  db.orders[orderIndex].status = status as OrderStatus;
  await saveDB(db);

  res.json({ success: true, message: "تم تحديث حالة الطلب بنجاح!", order: db.orders[orderIndex] });
});

// 6. Delete Order (Admin only)
app.delete("/api/orders/:id", adminAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = await getDB();
  const initialLength = db.orders.length;
  db.orders = db.orders.filter(o => o.id !== id);

  if (db.orders.length === initialLength) {
    return res.status(404).json({ error: "الطلب غير موجود." });
  }

  await saveDB(db);
  res.json({ success: true, message: "تم حذف الطلب بنجاح!" });
});

// 7. Upload Product Image from Computer (Admin only)
app.post("/api/upload", adminAuth, async (req: Request, res: Response) => {
  const { imageBase64, fileName } = req.body;
  if (!imageBase64 || !fileName) {
    return res.status(400).json({ error: "الرجاء توفير الصورة والاسم للرفع." });
  }

  try {
    // Strip the data URL prefix if present (e.g., "data:image/png;base64,")
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let base64Data = imageBase64;
    let extension = path.extname(fileName) || ".jpg";

    if (matches && matches.length === 3) {
      base64Data = matches[2];
      const mimeType = matches[1];
      if (mimeType === "image/png") extension = ".png";
      else if (mimeType === "image/jpeg" || mimeType === "image/jpg") extension = ".jpg";
      else if (mimeType === "image/gif") extension = ".gif";
      else if (mimeType === "image/webp") extension = ".webp";
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeFileName = `upload-${uniqueSuffix}${extension}`;
    const filePath = path.join(UPLOADS_DIR, safeFileName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    
    // Return relative URL for static serving
    res.json({ url: `/uploads/${safeFileName}` });
  } catch (error) {
    console.error("Error saving uploaded image:", error);
    res.status(500).json({ error: "فشل حفظ الصورة المرفوعة على الخادم." });
  }
});

// 8. Generate Product Landing Page Content via Gemini AI (Admin only)
app.post("/api/generate-product", adminAuth, async (req: Request, res: Response) => {
  const { rawDescription } = req.body;
  if (!rawDescription || rawDescription.trim() === "") {
    return res.status(400).json({ error: "الرجاء إدخال الوصف الأولي أو تفاصيل المنتج للتوليد بالذكاء الاصطناعي." });
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `أنت خبير تسويق محترف في كتابة نصوص المبيعات وصفحات الهبوط ذات التحويل العالي جداً في التجارة الإلكترونية الجزائرية ونظام الدفع عند الاستلام (COD).
مهمتك هي أخذ وصف منتج أو فكرة منتج من المستخدم وتحويلها إلى صفحة هبوط متكاملة، مقنعة وعالية التحويل للسوق الجزائري.
يجب أن ترجع النتيجة ككائن JSON ملتزماً بالهيكل والمخطط المطلوب تماماً.
احرص على كتابة محتوى مغري، مفهوم ومناسب لهجة الثقافة الجزائرية، واستعمل الدارجة الجزائرية اللطيفة والواقعية في كتابة آراء الزبائن (التقييمات) لتظهر حقيقية ومقنعة للغاية.`;

    const userPrompt = `حول الوصف التالي لمنتج إلى صفحة هبوط كاملة:
"${rawDescription}"

قم بملء جميع الحقول المطلوبة باللغة العربية وبأسلوب جذاب ومقنع جداً، واجعل المراجعات والآراء باللهجة الجزائرية (الدارجة) لتزيد الثقة ومعدل المبيعات.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: productAiSchema,
        temperature: 0.7,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("لم يتم استلام رد من نموذج الذكاء الاصطناعي.");
    }

    const generatedData = JSON.parse(resultText.trim());
    res.json(generatedData);
  } catch (error: any) {
    console.error("AI Generation error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء توليد محتوى المنتج بالذكاء الاصطناعي. تأكد من إعداد مفتاح API بشكل صحيح." });
  }
});

// 9. Get Wilayas and Shipping Prices
app.get("/api/wilayas", async (req: Request, res: Response) => {
  const db = await getDB();
  res.json(db.wilayas || ALGERIAN_WILAYAS);
});

// 10. Update Wilayas and Shipping Prices (Admin only)
app.post("/api/wilayas", adminAuth, async (req: Request, res: Response) => {
  const updatedWilayas = req.body;
  if (!Array.isArray(updatedWilayas)) {
    return res.status(400).json({ error: "البيانات المرسلة يجب أن تكون مصفوفة." });
  }

  const db = await getDB();
  db.wilayas = updatedWilayas;
  await saveDB(db);
  res.json({ success: true, message: "تم تحديث أسعار شحن الولايات بنجاح!", wilayas: db.wilayas });
});

// 11. Get Telegram Settings (Admin only)
app.get("/api/telegram-settings", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  res.json(db.telegramSettings || defaultTelegramSettings);
});

// 12. Update Telegram Settings (Admin only)
app.post("/api/telegram-settings", adminAuth, async (req: Request, res: Response) => {
  const { botToken, chatId, enabled } = req.body;
  if (typeof botToken !== "string" || typeof chatId !== "string" || typeof enabled !== "boolean") {
    return res.status(400).json({ error: "البيانات المرسلة غير صالحة." });
  }

  const db = await getDB();
  db.telegramSettings = { botToken, chatId, enabled };
  await saveDB(db);
  res.json({ success: true, message: "تم تحديث إعدادات تيليغرام بنجاح!", settings: db.telegramSettings });
});

// 13. Test Telegram Settings (Admin only)
app.post("/api/telegram-settings/test", adminAuth, async (req: Request, res: Response) => {
  const { botToken, chatId } = req.body;
  if (!botToken || !chatId) {
    return res.status(400).json({ error: "الرجاء توفير توكن البوت ومعرف المحادثة للاختبار." });
  }

  const message = `
🔔 <b>فحص اتصال بوت تيليغرام!</b> 🔔

تم الاتصال بنجاح بمتجرك الإلكتروني <b>جنة ستور (Janna Store)</b>.
ستصلك إشعارات الطلبيات الجديدة هنا مباشرة فور إرسالها من طرف الزبائن! 🎉

🌍 <b>رابط المتجر:</b> ${process.env.APP_URL || "https://jannastore.com"}
⏰ <b>وقت الفحص:</b> ${new Date().toLocaleString('ar-DZ', { timeZone: 'Africa/Algiers' })}
  `.trim();

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      })
    });

    const responseData = await response.json() as any;
    if (response.ok && responseData.ok) {
      res.json({ success: true, message: "تم إرسال رسالة الاختبار بنجاح! تفقد حسابك على تيليغرام." });
    } else {
      let friendlyError = responseData.description || "فشل الاتصال بتيليغرام.";
      if (friendlyError.includes("chat not found")) {
        friendlyError = "محادثة غير موجودة (chat not found). تأكد من إضافة البوت كعضو أو كمسؤول (Admin) في المجموعة أو القناة أولاً، وإرسال رسالة تفعيلية فيها، ثم أعد المحاولة.";
      } else if (friendlyError.includes("unauthorized") || friendlyError.includes("Not Found")) {
        friendlyError = "توكن البوت غير صحيح (Unauthorized). تأكد من نسخ رمز البوت (Bot Token) بدقة من BotFather.";
      }
      res.status(400).json({ error: friendlyError, details: responseData });
    }
  } catch (error: any) {
    console.error("Error testing telegram integration:", error);
    res.status(500).json({ error: "حدث خطأ غير متوقع أثناء محاولة الاتصال بخوادم تيليغرام.", details: error.message });
  }
});

// 14. Get Store Settings (Public)
app.get("/api/store-settings", async (req: Request, res: Response) => {
  const db = await getDB();
  res.json(db.storeSettings || defaultStoreSettings);
});

// 15. Update Store Settings (Admin only)
app.post("/api/store-settings", adminAuth, async (req: Request, res: Response) => {
  const { storeName, storeSub, tickerItems } = req.body;
  if (typeof storeName !== "string" || typeof storeSub !== "string" || !Array.isArray(tickerItems)) {
    return res.status(400).json({ error: "البيانات المرسلة غير صالحة." });
  }

  const db = await getDB();
  db.storeSettings = {
    storeName,
    storeSub,
    tickerItems: tickerItems.filter(item => typeof item === "string" && item.trim() !== "")
  };
  await saveDB(db);
  res.json({ success: true, message: "تم تحديث إعدادات المتجر بنجاح!", storeSettings: db.storeSettings });
});


// Start server function handling Vite / static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", async (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
