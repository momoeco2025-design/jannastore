const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

const newDbCode = `
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseApp = initializeApp({
  credential: applicationDefault(),
  projectId: "gifted-vent-h3bk6",
});
const firestore = getFirestore(firebaseApp, "ai-studio-f377b210-6282-4af0-bb93-14d7874625b5");
const STORE_DOC_ID = "main_store";

// Read database
async function getDB(): Promise<DBStructure> {
  try {
    const doc = await firestore.collection('store').doc(STORE_DOC_ID).get();
    if (doc.exists) {
      const parsed = doc.data() as DBStructure;
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
    await firestore.collection('store').doc(STORE_DOC_ID).set(data);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
  }
}
`;

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('// Read database'));
const endIdx = lines.findIndex(l => l.includes('// Authentication middleware'));

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx, newDbCode);
  fs.writeFileSync('server.ts', lines.join('\n'));
  console.log('Replaced DB functions successfully.');
} else {
  console.log('Could not find start or end index.', startIdx, endIdx);
}
