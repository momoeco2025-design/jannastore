const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

const oldSocials = `<div className="flex flex-1 justify-center items-center overflow-x-auto mx-2 md:mx-4">
          {(storeSettings?.socialLinks?.facebook || storeSettings?.socialLinks?.instagram || storeSettings?.socialLinks?.tiktok || storeSettings?.socialLinks?.telegram) && (
            <div className="flex justify-center gap-1.5 md:gap-2">
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
        </div>`;

const newSocials = `<div className="flex flex-1 justify-center items-center overflow-x-auto mx-2 md:mx-4">
          <div className="flex justify-center gap-1.5 md:gap-2">
            {/* Facebook */}
            {storeSettings?.socialLinks?.facebook ? (
              <a href={storeSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Facebook size={16} />
              </a>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full font-extrabold text-xs opacity-50 cursor-not-allowed">
                <Facebook size={16} />
              </div>
            )}
            
            {/* Instagram */}
            {storeSettings?.socialLinks?.instagram ? (
              <a href={storeSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-pink-50 text-pink-600 border border-pink-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <Instagram size={16} />
              </a>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full font-extrabold text-xs opacity-50 cursor-not-allowed">
                <Instagram size={16} />
              </div>
            )}
            
            {/* TikTok */}
            {storeSettings?.socialLinks?.tiktok ? (
              <a href={storeSettings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-zinc-50 text-zinc-800 border border-zinc-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-zinc-800 hover:text-white transition-all shadow-sm">
                <Music size={16} />
              </a>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full font-extrabold text-xs opacity-50 cursor-not-allowed">
                <Music size={16} />
              </div>
            )}
            
            {/* Telegram */}
            {storeSettings?.socialLinks?.telegram ? (
              <a href={storeSettings.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-sky-50 text-sky-600 border border-sky-200 px-3 py-1.5 rounded-full font-extrabold text-xs hover:bg-sky-600 hover:text-white transition-all shadow-sm">
                <Send size={16} />
              </a>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full font-extrabold text-xs opacity-50 cursor-not-allowed">
                <Send size={16} />
              </div>
            )}
          </div>
        </div>`;

code = code.replace(oldSocials, newSocials);
fs.writeFileSync('src/components/LandingPage.tsx', code);
console.log('Updated socials successfully.');
