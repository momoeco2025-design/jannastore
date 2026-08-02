const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const insertionPoint = code.lastIndexOf('      </main>');

const settingsTabCode = `
        {/* Tab 5: Store Settings */}
        {activeTab === 'settings' && storeSettings && (
          <div className="space-y-6" dir="rtl">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <div className="space-y-1 text-right">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Settings className="text-slate-600" size={22} />
                  <span>إعدادات المتجر وروابط التواصل الاجتماعي</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  تعديل اسم المتجر وإضافة روابط صفحاتك على مواقع التواصل ليتمكن الزبائن من متابعتك.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-right">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800">اسم المتجر الأساسي</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800">وصف المتجر (الشريط العلوي)</label>
                  <input
                    type="text"
                    value={storeSettings.storeSub}
                    onChange={(e) => setStoreSettings({...storeSettings, storeSub: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-extrabold text-sm text-slate-900 mb-4">روابط التواصل الاجتماعي (اختياري)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">Facebook</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/..."
                      value={storeSettings.socialLinks?.facebook || ''}
                      onChange={(e) => setStoreSettings({
                        ...storeSettings, 
                        socialLinks: { ...storeSettings.socialLinks, facebook: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">Instagram</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={storeSettings.socialLinks?.instagram || ''}
                      onChange={(e) => setStoreSettings({
                        ...storeSettings, 
                        socialLinks: { ...storeSettings.socialLinks, instagram: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">TikTok</label>
                    <input
                      type="text"
                      placeholder="https://tiktok.com/@..."
                      value={storeSettings.socialLinks?.tiktok || ''}
                      onChange={(e) => setStoreSettings({
                        ...storeSettings, 
                        socialLinks: { ...storeSettings.socialLinks, tiktok: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">Telegram (القناة أو الحساب)</label>
                    <input
                      type="text"
                      placeholder="https://t.me/..."
                      value={storeSettings.socialLinks?.telegram || ''}
                      onChange={(e) => setStoreSettings({
                        ...storeSettings, 
                        socialLinks: { ...storeSettings.socialLinks, telegram: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Error and Success states */}
              {storeSaveError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center justify-center gap-2">
                  <Info size={14} />
                  <span>{storeSaveError}</span>
                </div>
              )}
              {storeSaveSuccess && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-bold border border-emerald-100 flex items-center justify-center gap-2">
                  <Check size={14} />
                  <span>تم حفظ الإعدادات بنجاح!</span>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveStoreSettings}
                  disabled={savingStore}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-black text-xs transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {savingStore ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>حفظ الإعدادات والتغييرات</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
`;

const newCode = code.slice(0, insertionPoint) + settingsTabCode + code.slice(insertionPoint);
fs.writeFileSync('src/components/AdminPanel.tsx', newCode);
console.log('Inserted settings tab!');
