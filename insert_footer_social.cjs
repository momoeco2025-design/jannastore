const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

// First ensure imports
if (!code.includes('Facebook')) {
  code = code.replace("import { ", "import { Facebook, Instagram, Music, Send, ");
}

const socialLinksCode = `
          <div className="space-y-4">
            <span className="font-black text-sm text-white block">تابعنا على مواقع التواصل</span>
            <div className="flex gap-4 items-center">
              {storeSettings?.socialLinks?.facebook && (
                <a href={storeSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-blue-600 hover:-translate-y-1 transition-all">
                  <Facebook size={18} />
                </a>
              )}
              {storeSettings?.socialLinks?.instagram && (
                <a href={storeSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-pink-600 hover:-translate-y-1 transition-all">
                  <Instagram size={18} />
                </a>
              )}
              {storeSettings?.socialLinks?.tiktok && (
                <a href={storeSettings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-zinc-700 hover:-translate-y-1 transition-all">
                  <Music size={18} />
                </a>
              )}
              {storeSettings?.socialLinks?.telegram && (
                <a href={storeSettings.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-blue-500 hover:-translate-y-1 transition-all">
                  <Send size={18} />
                </a>
              )}
            </div>
          </div>
`;

// Find where to insert in footer. The footer has grid-cols-3. I'll change it to grid-cols-4 and insert.
code = code.replace('<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">', '<div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">');

const insertPos = code.indexOf('<div className="space-y-3 md:text-left">');
code = code.slice(0, insertPos) + socialLinksCode + '          ' + code.slice(insertPos);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log('Added social links to footer');
