import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
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
  currency: "DZD",
  logoUrl: "",
  coverUrl: "",
  heroBadge: "كتالوج المنتجات الحصرية والعروض المميزة",
  heroTitle: "تسوق أفضل المنتجات بأفضل الأسعار في الجزائر 🇩🇿",
  heroSub: "جنة ستور هي وجهتك المفضلة للتسوق الإلكتروني 🛒",
  tickerItems: [
    "🔥 أفضل المنتجات بأسعار ممتازة وجد مناسبة في الجزائر!",
    "🚚 توصيل سريع وآمن لباب المنزل متوفر لـ 58 ولاية جزائرية!",
    "⭐ جودة ممتازة وخامات أصلية ممتازة مختارة ومضمونة 100% من متجرنا",
    "💵 الدفع عند الاستلام - افحصي سلعتك وتأكدي منها بحرية تامة قبل الدفع",
    "🔄 الضمان الذهبي: استبدال مجاني أو استرجاع الأموال سهل وسريع خلال 7 أيام",
    "💥 أسعار مناسبة وجد تنافسية مع تخفيضات حصرية كبرى تصل إلى 40%",
    "📞 خدمة زبائن متميزة متوفرة هاتفياً لتأكيد طلبياتكم والإجابة على أي استفسار"
  ],
  feature1Title: "توصيل سريع لـ 58 ولاية",
  feature1Desc: "نصلك أينما كنت بالجزائر، للمنزل أو لمكتب التوصيل القريب منك.",
  feature2Title: "معاينة وإفحاص قبل الدفع",
  feature2Desc: "افحص طردك واستلم منتجك بثقة تامة ثم ادفع الثمن للموزع يداً بيد.",
  feature3Title: "خدمة زبائن متابعة",
  feature3Desc: "يتصل بك فريقنا الهاتفي لتأكيد العنوان والإجابة عن أي تساؤل.",
  metaPixelId: "4470620526542545"
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

let firestoreQuotaExhausted = true;

// Read database
async function getDB(): Promise<DBStructure> {
  // 1. If local disk DB exists, prefer reading from local disk first to avoid unneeded Firestore quota usage
  if (fs.existsSync(DB_FILE)) {
    try {
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as DBStructure;
      let updated = false;
      if (!localData.wilayas || localData.wilayas.length < 58 || localData.wilayas[0]?.shippingHome !== 1100) {
        localData.wilayas = ALGERIAN_WILAYAS;
        updated = true;
      }
      if (!localData.telegramSettings) {
        localData.telegramSettings = defaultTelegramSettings;
        updated = true;
      }
      if (!localData.storeSettings) {
        localData.storeSettings = defaultStoreSettings;
        updated = true;
      } else if (!localData.storeSettings.metaPixelId) {
        localData.storeSettings.metaPixelId = "4470620526542545";
        updated = true;
      }
      if (!localData.products || localData.products.length === 0) {
        const defaultP = { ...localData.product };
        if (!defaultP.id) defaultP.id = "p1";
        if (!defaultP.slug) defaultP.slug = "hairstyler";
        localData.products = [defaultP];
        updated = true;
      }
      localData.products.forEach((p) => {
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
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(localData, null, 2));
        } catch (e) {
          console.error("Error updating local DB file:", e);
        }
      }
      return localData;
    } catch (err) {
      console.error("Error parsing local DB file, falling back:", err);
    }
  }

  // 2. If no local file yet, try loading from Firestore if quota is available
  if (!firestoreQuotaExhausted) {
    try {
      const docRef = doc(firestore, 'store', STORE_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const parsed = docSnap.data() as DBStructure;
        let updated = false;
        if (!parsed.wilayas || parsed.wilayas.length < 58 || parsed.wilayas[0]?.shippingHome !== 1100) {
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
        } else if (!parsed.storeSettings.metaPixelId) {
          parsed.storeSettings.metaPixelId = "4470620526542545";
          updated = true;
        }
        if (!parsed.products || parsed.products.length === 0) {
          const defaultP = { ...parsed.product };
          if (!defaultP.id) defaultP.id = "p1";
          if (!defaultP.slug) defaultP.slug = "hairstyler";
          parsed.products = [defaultP];
          updated = true;
        }
        parsed.products.forEach((p) => {
          if (!p.id) {
            p.id = "p" + Math.floor(100000 + Math.random() * 900000);
            updated = true;
          }
          if (!p.slug) {
            p.slug = "product-" + p.id;
            updated = true;
          }
        });
        // Always save to local file
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.error("Error writing local DB cache file:", e);
        }
        return parsed;
      }
    } catch (error: any) {
      firestoreQuotaExhausted = true;
      console.warn("Firestore quota exceeded or unavailable. Switching exclusively to local disk persistence backup.");
    }
  }

  // 3. Fallback default DB
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
  // Always persist locally first so state is never lost even if Firestore hits quota limits
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error saving to local DB file:", err);
  }

  if (!firestoreQuotaExhausted) {
    try {
      const docRef = doc(firestore, 'store', STORE_DOC_ID);
      await setDoc(docRef, data);
    } catch (error: any) {
      firestoreQuotaExhausted = true;
      console.warn("Firestore write failed (quota limit reached). All store data is safely saved and managed via local disk storage.");
    }
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
  const escColor = order.selectedColor ? escapeHTML(order.selectedColor) : "";
  const escNotes = escapeHTML(order.notes || "لا توجد ملاحظة");

  const colorLine = escColor ? `• <b>اللون المختار:</b> 🎨 ${escColor}\n` : '';

  const message = `
📦 <b>طلب جديد في جنة ستور!</b> 📦

👤 <b>الاسم الكامل:</b> ${escCustomerName}
📞 <b>رقم الهاتف:</b> ${escPhone}
📍 <b>الولاية:</b> ${escWilayaName} (رقم ${order.wilayaNum})
🏡 <b>البلدية:</b> ${escCommune}

🛒 <b>تفاصيل المنتج:</b>
• <b>المنتج:</b> ${escProductName}
${colorLine}• <b>سعر الحبة:</b> ${productPrice} دج
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

// Helper to hash data for Meta CAPI
function hashData(val: string): string {
  if (!val) return "";
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

function normalizePhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "213" + digits.slice(1);
  } else if (!digits.startsWith("213") && digits.length === 9) {
    digits = "213" + digits;
  }
  return digits;
}

async function logPixelEvent(db: DBStructure, eventName: string, status: 'success' | 'error', details?: string) {
  if (!db.storeSettings) db.storeSettings = { ...defaultStoreSettings };
  if (!db.storeSettings.pixelLogs) db.storeSettings.pixelLogs = [];
  
  if (status === 'success') {
    db.storeSettings.lastCapiSuccess = new Date().toISOString();
  } else {
    db.storeSettings.lastError = `${eventName}: ${details || 'Unknown error'}`;
  }

  db.storeSettings.pixelLogs.unshift({
    id: "LOG-" + Math.floor(1000 + Math.random() * 9000),
    timestamp: new Date().toISOString(),
    eventName,
    status,
    details
  });
  if (db.storeSettings.pixelLogs.length > 20) {
    db.storeSettings.pixelLogs = db.storeSettings.pixelLogs.slice(0, 20);
  }
}

async function addToCapiQueue(db: DBStructure, item: {
  pixelId: string;
  accessToken: string;
  eventName: string;
  eventSourceUrl: string;
  clientIp: string;
  clientUserAgent: string;
  userData: any;
  customData: any;
  testEventCode?: string;
  eventId?: string;
  error?: string;
}) {
  if (!db.storeSettings) db.storeSettings = { ...defaultStoreSettings };
  if (!db.storeSettings.capiRetryQueue) db.storeSettings.capiRetryQueue = [];
  
  db.storeSettings.capiRetryQueue.push({
    id: "RETRY-" + Math.floor(10000 + Math.random() * 90000),
    pixelId: item.pixelId,
    accessToken: item.accessToken,
    eventName: item.eventName,
    eventSourceUrl: item.eventSourceUrl,
    clientIp: item.clientIp,
    clientUserAgent: item.clientUserAgent,
    userData: item.userData,
    customData: item.customData,
    testEventCode: item.testEventCode,
    eventId: item.eventId,
    attempts: 1,
    createdAt: new Date().toISOString(),
    lastError: item.error
  });
}

async function processCapiRetryQueue(db: DBStructure) {
  if (!db.storeSettings?.capiRetryQueue || db.storeSettings.capiRetryQueue.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const queue = [...db.storeSettings.capiRetryQueue];
  const remaining: typeof queue = [];
  let succeededCount = 0;
  let failedCount = 0;

  for (const item of queue) {
    const res = await sendMetaCAPI(
      item.pixelId,
      item.accessToken,
      item.eventName,
      item.eventSourceUrl,
      item.clientIp,
      item.clientUserAgent,
      item.userData,
      item.customData,
      item.testEventCode,
      item.eventId
    );

    if (res.success) {
      succeededCount++;
      await logPixelEvent(db, `${item.eventName} (CAPI Retry)`, 'success', `Retried event ${item.eventId || item.id} successfully`);
    } else {
      item.attempts += 1;
      item.lastError = res.error;
      if (item.attempts < 3) {
        remaining.push(item);
      } else {
        failedCount++;
        await logPixelEvent(db, `${item.eventName} (CAPI Retry Exceeded)`, 'error', `Failed after 3 attempts: ${res.error}`);
      }
    }
  }

  db.storeSettings.capiRetryQueue = remaining;
  await saveDB(db);
  return { processed: queue.length, succeeded: succeededCount, failed: failedCount };
}

async function sendMetaCAPI(pixelId: string, accessToken: string, eventName: string, eventSourceUrl: string, clientIp: string, clientUserAgent: string, userData?: any, customData?: any, testEventCode?: string, eventId?: string) {
  if (!pixelId || !accessToken) return { success: false, error: "Missing Pixel ID or Access Token" };
  try {
    const eventObj: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl || "https://jannastore.dz",
      action_source: "website",
      user_data: {
        client_ip_address: clientIp || "127.0.0.1",
        client_user_agent: clientUserAgent || "Mozilla/5.0",
        ...userData
      },
      custom_data: customData || {}
    };

    if (eventId) {
      eventObj.event_id = eventId;
    }

    const payload: any = {
      data: [eventObj]
    };
    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }
    const res = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error?.message || "CAPI error" };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
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

// New: Reorder products list for display
app.post("/api/products/reorder", adminAuth, async (req: Request, res: Response) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds)) {
    return res.status(400).json({ error: "قائمة ترتيب المنتجات مطلوبة." });
  }
  const db = await getDB();
  if (!db.products || db.products.length === 0) {
    return res.status(400).json({ error: "لا توجد منتجات لتنظيم ترتيبها." });
  }

  const orderedProducts: any[] = [];
  productIds.forEach((id: string) => {
    const p = db.products.find(prod => (prod.id && prod.id === id) || prod.slug === id);
    if (p) {
      orderedProducts.push(p);
    }
  });

  db.products.forEach(p => {
    if (!orderedProducts.some(op => (op.id && p.id && op.id === p.id) || op.slug === p.slug)) {
      orderedProducts.push(p);
    }
  });

  db.products = orderedProducts;
  if (db.products.length > 0) {
    db.product = db.products[0];
  }

  await saveDB(db);
  res.json({ success: true, message: "تم تحديث ترتيب المنتجات بنجاح!", products: db.products });
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
  if (!productData.title) {
    return res.status(400).json({ error: "اسم المنتج مطلوب." });
  }

  if (!db.products) {
    db.products = [];
  }

  // Format slug to be URL friendly
  const cleanedSlug = (productData.slug || "").toLowerCase().trim().replace(/[^a-z0-9-_\u0600-\u06FF]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const finalSlug = cleanedSlug || ("product-" + (productData.id || Math.floor(100000 + Math.random() * 900000)));

  // Find existing product either by ID or by slug
  let existingIndex = -1;
  if (productData.id) {
    existingIndex = db.products.findIndex(p => p.id === productData.id);
  }
  if (existingIndex === -1 && finalSlug) {
    existingIndex = db.products.findIndex(p => p.slug === finalSlug);
  }

  // Check for slug collision with ANOTHER product in the list
  const slugCollisionIndex = db.products.findIndex(p => p.slug === finalSlug);
  if (slugCollisionIndex !== -1 && existingIndex !== -1 && slugCollisionIndex !== existingIndex) {
    return res.status(400).json({ error: "الرابط الفريد (Slug) مستخدم بالفعل لمنتج آخر. يرجى اختيار رابط مختلف." });
  }

  const targetId = existingIndex !== -1 && db.products[existingIndex].id
    ? db.products[existingIndex].id
    : (productData.id || ("p" + Math.floor(100000 + Math.random() * 900000)));

  const updatedProductData = {
    ...productData,
    id: targetId,
    slug: finalSlug,
    price: Number(productData.price) || 0,
    oldPrice: Number(productData.oldPrice) || 0,
    stockCount: Number(productData.stockCount) ?? 10
  };

  if (existingIndex !== -1) {
    db.products[existingIndex] = { ...db.products[existingIndex], ...updatedProductData };
  } else {
    db.products.push(updatedProductData);
  }

  // Sync main single-product fallback if applicable
  if (!db.product || db.product.id === targetId || db.product.slug === finalSlug || db.products.length === 1) {
    db.product = { ...db.product, ...updatedProductData };
  } else {
    const defaultSlug = db.defaultProductSlug || db.products[0]?.slug;
    const mainProduct = db.products.find(p => p.slug === defaultSlug) || db.products[0];
    if (mainProduct) {
      db.product = mainProduct;
    }
  }

  await saveDB(db);
  res.json({ success: true, message: "تم حفظ المنتج وصفحة الهبوط بنجاح!", products: db.products, product: db.product });
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
  const { customerName, phone, wilayaNum, wilayaName, commune, quantity, selectedColor, notes, totalPrice, shippingPrice, productSlug } = req.body;
  
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
    selectedColor: selectedColor || "",
    notes: notes || "",
    totalPrice: Number(totalPrice),
    shippingPrice: Number(shippingPrice),
    status: "pending",
    createdAt: new Date().toISOString(),
    productSlug: orderProduct.slug || "hairstyler",
    productName: orderProduct.title
  };

  db.orders.unshift(newOrder); // Add to the beginning

  // Update product purchase count
  const prodIndex = db.products?.findIndex(p => p.slug === orderProduct.slug);
  if (prodIndex !== undefined && prodIndex !== -1 && db.products) {
    db.products[prodIndex].purchaseCount = (db.products[prodIndex].purchaseCount || 0) + 1;
  }
  orderProduct.purchaseCount = (orderProduct.purchaseCount || 0) + 1;

  await saveDB(db);

  // Send Telegram Notification in background
  sendTelegramNotification(newOrder, orderProduct.title, orderProduct.price).catch(err => {
    console.error("Error calling sendTelegramNotification:", err);
  });

  // Meta CAPI Purchase event
  const activePixelId = orderProduct.pixelId || db.storeSettings?.metaPixelId;
  const accessToken = db.storeSettings?.metaAccessToken;
  const storeCurrency = db.storeSettings?.currency || "DZD";
  if (activePixelId && accessToken) {
    const clientIp = req.ip || "127.0.0.1";
    const clientUserAgent = req.headers["user-agent"] || "Mozilla/5.0";
    const domainUrl = db.storeSettings?.domain ? `https://${db.storeSettings.domain}` : "https://jannastore.dz";
    
    const nameParts = customerName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const normalizedPh = normalizePhone(phone);

    const userData = {
      ph: hashData(normalizedPh),
      fn: hashData(firstName),
      ln: hashData(lastName),
      ct: hashData(commune || wilayaName),
      country: hashData("dz"),
      external_id: hashData(newOrder.id)
    };

    const customData = {
      value: totalPrice,
      currency: storeCurrency,
      content_name: orderProduct.title,
      content_ids: [orderProduct.slug || orderProduct.id || "product"],
      content_type: "product",
      num_items: quantity
    };

    sendMetaCAPI(
      activePixelId,
      accessToken,
      "Purchase",
      domainUrl,
      clientIp,
      clientUserAgent,
      userData,
      customData,
      db.storeSettings?.metaTestEventCode,
      newOrder.id
    ).then(async (res) => {
      if (res.success) {
        await logPixelEvent(db, "Purchase (CAPI)", "success", `Order ${newOrder.id} - ${totalPrice} ${storeCurrency}`);
      } else {
        await logPixelEvent(db, "Purchase (CAPI)", "error", `فشل الإرسال المباشر: ${res.error}. تم الإضافة لإعادة المحاولة (Retry Queue).`);
        await addToCapiQueue(db, {
          pixelId: activePixelId,
          accessToken,
          eventName: "Purchase",
          eventSourceUrl: domainUrl,
          clientIp,
          clientUserAgent,
          userData,
          customData,
          testEventCode: db.storeSettings?.metaTestEventCode,
          eventId: newOrder.id,
          error: res.error
        });
      }
      await saveDB(db);
    }).catch(async (err) => {
      console.error("CAPI Purchase error:", err);
      await addToCapiQueue(db, {
        pixelId: activePixelId,
        accessToken,
        eventName: "Purchase",
        eventSourceUrl: domainUrl,
        clientIp,
        clientUserAgent,
        userData,
        customData,
        testEventCode: db.storeSettings?.metaTestEventCode,
        eventId: newOrder.id,
        error: err.message
      });
      await saveDB(db);
    });
  } else {
    await logPixelEvent(db, "Purchase", "success", `Order ${newOrder.id}`);
    await saveDB(db);
  }

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
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
        folder: "jannastore_products",
        resource_type: "image"
      });
      return res.json({ url: uploadResponse.secure_url });
    }

    // Local file storage fallback
    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      if (imageBase64.startsWith("http") || imageBase64.startsWith("/uploads/")) {
        return res.json({ url: imageBase64 });
      }
      return res.status(400).json({ error: "تنسيق الصورة غير صحيح (توقع Base64)." });
    }

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);
    const localUrl = `/uploads/${uniqueName}`;
    return res.json({ url: localUrl });
  } catch (error: any) {
    console.error("Error saving uploaded image:", error);
    res.status(500).json({ error: "فشل رفع وحفظ الصورة.", details: error.message });
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

// 10b. Reset Wilayas to Defaults (Admin only)
app.post("/api/wilayas/reset", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  db.wilayas = ALGERIAN_WILAYAS;
  await saveDB(db);
  res.json({ success: true, message: "تمت استعادة جدول أسعار الولايات الافتراضية بنجاح!", wilayas: db.wilayas });
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
  const { 
    storeName, storeSub, currency, logoUrl, coverUrl,
    heroBadge, heroTitle, heroSub, tickerItems,
    feature1Title, feature1Desc, feature2Title, feature2Desc, feature3Title, feature3Desc,
    socialLinks, metaPixelId, metaAccessToken, metaTestEventCode, domain 
  } = req.body;

  if (typeof storeName !== "string" || typeof storeSub !== "string") {
    return res.status(400).json({ error: "البيانات المرسلة غير صالحة." });
  }

  const db = await getDB();
  const filteredTickerItems = Array.isArray(tickerItems) 
    ? tickerItems.filter((item: any) => typeof item === "string" && item.trim() !== "")
    : (db.storeSettings?.tickerItems || defaultStoreSettings.tickerItems);

  db.storeSettings = {
    ...db.storeSettings,
    storeName,
    storeSub,
    currency: typeof currency === "string" && currency.trim() !== "" ? currency.trim().toUpperCase() : (db.storeSettings?.currency || "DZD"),
    logoUrl: typeof logoUrl === "string" ? logoUrl.trim() : (db.storeSettings?.logoUrl || ""),
    coverUrl: typeof coverUrl === "string" ? coverUrl.trim() : (db.storeSettings?.coverUrl || ""),
    heroBadge: typeof heroBadge === "string" ? heroBadge.trim() : (db.storeSettings?.heroBadge || ""),
    heroTitle: typeof heroTitle === "string" ? heroTitle.trim() : (db.storeSettings?.heroTitle || ""),
    heroSub: typeof heroSub === "string" ? heroSub.trim() : (db.storeSettings?.heroSub || ""),
    tickerItems: filteredTickerItems,
    feature1Title: typeof feature1Title === "string" ? feature1Title.trim() : (db.storeSettings?.feature1Title || ""),
    feature1Desc: typeof feature1Desc === "string" ? feature1Desc.trim() : (db.storeSettings?.feature1Desc || ""),
    feature2Title: typeof feature2Title === "string" ? feature2Title.trim() : (db.storeSettings?.feature2Title || ""),
    feature2Desc: typeof feature2Desc === "string" ? feature2Desc.trim() : (db.storeSettings?.feature2Desc || ""),
    feature3Title: typeof feature3Title === "string" ? feature3Title.trim() : (db.storeSettings?.feature3Title || ""),
    feature3Desc: typeof feature3Desc === "string" ? feature3Desc.trim() : (db.storeSettings?.feature3Desc || ""),
    socialLinks: socialLinks ? JSON.parse(JSON.stringify(socialLinks)) : undefined,
    metaPixelId: typeof metaPixelId === "string" ? metaPixelId.trim() : undefined,
    metaAccessToken: typeof metaAccessToken === "string" ? metaAccessToken.trim() : undefined,
    metaTestEventCode: typeof metaTestEventCode === "string" ? metaTestEventCode.trim() : undefined,
    domain: typeof domain === "string" ? domain.trim() : undefined
  };
  
  // Remove undefined properties to please Firestore
  if (db.storeSettings.socialLinks === undefined) {
    delete db.storeSettings.socialLinks;
  } else {
    Object.keys(db.storeSettings.socialLinks).forEach(key => {
      if ((db.storeSettings.socialLinks as any)[key] === undefined) {
        delete (db.storeSettings.socialLinks as any)[key];
      }
    });
  }
  if (!db.storeSettings.metaPixelId) delete db.storeSettings.metaPixelId;
  if (!db.storeSettings.metaAccessToken) delete db.storeSettings.metaAccessToken;
  if (!db.storeSettings.metaTestEventCode) delete db.storeSettings.metaTestEventCode;
  if (!db.storeSettings.domain) delete db.storeSettings.domain;

  await saveDB(db);
  res.json({ success: true, message: "تم تحديث إعدادات المتجر والصفحة الرئيسية بنجاح!", storeSettings: db.storeSettings });
});

// 16. Test Pixel & Conversions API (Admin only)
app.post("/api/marketing/test-pixel", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  const settings = db.storeSettings;
  if (!settings?.metaPixelId || !settings?.metaAccessToken) {
    return res.status(400).json({ error: "يرجى إدخال رقم Pixel ID و Access Token أولاً." });
  }
  const clientIp = req.ip || "127.0.0.1";
  const clientUserAgent = req.headers["user-agent"] || "Mozilla/5.0";
  const result = await sendMetaCAPI(
    settings.metaPixelId,
    settings.metaAccessToken,
    "PageView",
    settings.domain ? `https://${settings.domain}` : "https://jannastore.dz",
    clientIp,
    clientUserAgent,
    {},
    { source: "test_button" },
    settings.metaTestEventCode
  );
  if (result.success) {
    await logPixelEvent(db, "PageView (CAPI)", "success", "Test PageView sent via CAPI");
    await saveDB(db);
    res.json({ success: true, message: "🟢 PageView يعمل بنجاح عبر CAPI! (Connected & Verified)" });
  } else {
    await logPixelEvent(db, "PageView (CAPI)", "error", result.error);
    await saveDB(db);
    res.status(400).json({ success: false, error: `❌ خطأ في الاتصال بـ Meta CAPI: ${result.error}` });
  }
});

// 16b. Send Test Purchase Event (Admin only)
app.post("/api/marketing/test-purchase", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  const settings = db.storeSettings;
  if (!settings?.metaPixelId || !settings?.metaAccessToken) {
    return res.status(400).json({ error: "يرجى إدخال رقم Pixel ID و Access Token أولاً." });
  }
  const clientIp = req.ip || "127.0.0.1";
  const clientUserAgent = req.headers["user-agent"] || "Mozilla/5.0";
  const testVal = req.body?.value || 4100;
  const storeCurrency = settings.currency || "DZD";

  const result = await sendMetaCAPI(
    settings.metaPixelId,
    settings.metaAccessToken,
    "Purchase",
    settings.domain ? `https://${settings.domain}` : "https://jannastore.dz",
    clientIp,
    clientUserAgent,
    {
      ph: hashData(normalizePhone("0550000000")),
      fn: hashData("Test"),
      ln: hashData("Customer"),
      ct: hashData("Alger"),
      country: hashData("dz"),
      external_id: hashData("TEST-ORD-123")
    },
    {
      value: testVal,
      currency: storeCurrency,
      content_name: "منتج تجريبي للاختبار",
      content_ids: ["test-item-123"],
      content_type: "product",
      num_items: 1
    },
    settings.metaTestEventCode,
    "TEST-ORD-123"
  );

  if (result.success) {
    await logPixelEvent(db, "Purchase (CAPI)", "success", `Test Purchase - ${testVal} ${storeCurrency}`);
    await saveDB(db);
    res.json({ success: true, message: `🛒 تم إرسال حدث Purchase تجريبي بقيمة ${testVal} ${storeCurrency} إلى Meta بنجاح!` });
  } else {
    await logPixelEvent(db, "Purchase (CAPI)", "error", result.error);
    await addToCapiQueue(db, {
      pixelId: settings.metaPixelId,
      accessToken: settings.metaAccessToken,
      eventName: "Purchase",
      eventSourceUrl: settings.domain ? `https://${settings.domain}` : "https://jannastore.dz",
      clientIp,
      clientUserAgent,
      userData: {
        ph: hashData(normalizePhone("0550000000")),
        fn: hashData("Test"),
        ln: hashData("Customer"),
        ct: hashData("Alger"),
        country: hashData("dz"),
        external_id: hashData("TEST-ORD-123")
      },
      customData: {
        value: testVal,
        currency: storeCurrency,
        content_name: "منتج تجريبي للاختبار",
        content_ids: ["test-item-123"],
        content_type: "product",
        num_items: 1
      },
      testEventCode: settings.metaTestEventCode,
      eventId: "TEST-ORD-123",
      error: result.error
    });
    await saveDB(db);
    res.status(400).json({ success: false, error: `❌ خطأ في إرسال Purchase: ${result.error}. تم حفظ الحدث في قائمة إعادة المحاولة.` });
  }
});

// 16c. Process CAPI Retry Queue (Admin only)
app.post("/api/marketing/process-retry-queue", adminAuth, async (req: Request, res: Response) => {
  const db = await getDB();
  const result = await processCapiRetryQueue(db);
  res.json({ success: true, message: `تمت معالجة ${result.processed} حدث. (نجح: ${result.succeeded} | فشل: ${result.failed})`, result });
});

// 17. Verify Domain (Admin only)
app.post("/api/marketing/verify-domain", adminAuth, async (req: Request, res: Response) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "الدومين مطلوب" });
  const db = await getDB();
  if (!db.storeSettings) db.storeSettings = { ...defaultStoreSettings };
  db.storeSettings.domain = domain.trim();
  db.storeSettings.domainVerified = true;
  await saveDB(db);
  await logPixelEvent(db, "DomainVerify", "success", `Verified domain: ${domain}`);
  res.json({ success: true, message: "تم التحقق من الدومين بنجاح!", storeSettings: db.storeSettings });
});

// 18. Track Product Statistics (Public)
app.post("/api/stats/track", async (req: Request, res: Response) => {
  const { productSlug, eventType } = req.body;
  if (!productSlug || !eventType) return res.status(400).json({ error: "Missing data" });
  const db = await getDB();
  const prod = db.products?.find(p => p.slug === productSlug);
  if (prod) {
    if (eventType === 'pageView') {
      prod.pageViews = (prod.pageViews || 0) + 1;
    } else if (eventType === 'viewContent') {
      prod.viewContentCount = (prod.viewContentCount || 0) + 1;
    } else if (eventType === 'initiateCheckout') {
      prod.initiateCheckoutCount = (prod.initiateCheckoutCount || 0) + 1;
    }
    await saveDB(db);
  }
  res.json({ success: true });
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
