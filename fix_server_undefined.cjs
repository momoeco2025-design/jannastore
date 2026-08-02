const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /db\.storeSettings = \{[\s\S]*?socialLinks\n  \};/;
const replacement = `db.storeSettings = {
    storeName,
    storeSub,
    tickerItems: tickerItems.filter((item: any) => typeof item === "string" && item.trim() !== ""),
    socialLinks: socialLinks ? JSON.parse(JSON.stringify(socialLinks)) : undefined
  };
  
  // Remove undefined properties to please Firestore
  if (db.storeSettings.socialLinks === undefined) {
    delete db.storeSettings.socialLinks;
  } else {
    Object.keys(db.storeSettings.socialLinks).forEach(key => {
      if (db.storeSettings.socialLinks[key] === undefined) {
        delete db.storeSettings.socialLinks[key];
      }
    });
  }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
