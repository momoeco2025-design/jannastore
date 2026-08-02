const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

// 1. Remove the footer
const footerStart = code.indexOf('<footer');
const footerEnd = code.indexOf('</footer>') + 9;
if (footerStart !== -1 && footerEnd !== -1) {
  code = code.slice(0, footerStart) + code.slice(footerEnd);
}

// 2. Insert social icons below ticker
const socialPillsCode = `
        {/* Social Links Centered Below Ticker */}
        {(storeSettings?.socialLinks?.facebook || storeSettings?.socialLinks?.instagram || storeSettings?.socialLinks?.tiktok || storeSettings?.socialLinks?.telegram) && (
          <div className="flex justify-center gap-3 py-2">
            {storeSettings?.socialLinks?.facebook && (
              <a href={storeSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-full font-extrabold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Facebook size={18} />
                <span>صفحتنا</span>
              </a>
            )}
            {storeSettings?.socialLinks?.instagram && (
              <a href={storeSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-pink-50 text-pink-600 border border-pink-200 px-4 py-2 rounded-full font-extrabold text-sm hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <Instagram size={18} />
                <span>إنستغرام</span>
              </a>
            )}
            {storeSettings?.socialLinks?.tiktok && (
              <a href={storeSettings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-zinc-50 text-zinc-800 border border-zinc-200 px-4 py-2 rounded-full font-extrabold text-sm hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
                <Music size={18} />
                <span>تيك توك</span>
              </a>
            )}
            {storeSettings?.socialLinks?.telegram && (
              <a href={storeSettings.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-sky-50 text-sky-600 border border-sky-200 px-4 py-2 rounded-full font-extrabold text-sm hover:bg-sky-600 hover:text-white transition-all shadow-sm">
                <Send size={18} />
                <span>تيليغرام</span>
              </a>
            )}
          </div>
        )}
`;

const insertAfterStyle = code.indexOf('</style>') + 8;
const divEnd = code.indexOf('</div>', insertAfterStyle) + 6; // closes the ticker wrapping div

code = code.slice(0, divEnd) + '\n' + socialPillsCode + code.slice(divEnd);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log('Fixed LandingPage');
