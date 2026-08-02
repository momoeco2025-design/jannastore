const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

const tickerSocials = `
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

code = code.replace(tickerSocials, "");

const headerSocials = `

        {/* Social Links Centered in Header */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          {(storeSettings?.socialLinks?.facebook || storeSettings?.socialLinks?.instagram || storeSettings?.socialLinks?.tiktok || storeSettings?.socialLinks?.telegram) && (
            <div className="flex justify-center gap-2">
              {storeSettings?.socialLinks?.facebook && (
                <a href={storeSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  <Facebook size={16} />
                  <span>صفحتنا</span>
                </a>
              )}
              {storeSettings?.socialLinks?.instagram && (
                <a href={storeSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-pink-50 text-pink-600 border border-pink-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                  <Instagram size={16} />
                  <span>إنستغرام</span>
                </a>
              )}
              {storeSettings?.socialLinks?.tiktok && (
                <a href={storeSettings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-zinc-50 text-zinc-800 border border-zinc-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
                  <Music size={16} />
                  <span>تيك توك</span>
                </a>
              )}
              {storeSettings?.socialLinks?.telegram && (
                <a href={storeSettings.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-sky-600 hover:text-white transition-all shadow-sm">
                  <Send size={16} />
                  <span>تيليغرام</span>
                </a>
              )}
            </div>
          )}
        </div>
`;

code = code.replace(
  '      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-md py-3 px-4 md:px-8 flex justify-between items-center transition-all duration-300">\n        <div className="flex items-center gap-2">',
  '      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-md py-3 px-4 md:px-8 flex justify-between items-center transition-all duration-300">\n        <div className="flex items-center gap-2 flex-1 md:flex-none">'
);

code = code.replace(
  '<div className="flex items-center gap-4">',
  headerSocials + '\n        <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-none justify-end">'
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log('Moved socials to header');
