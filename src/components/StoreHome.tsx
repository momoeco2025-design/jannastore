import React, { useState, useEffect, useRef } from 'react';
import { ProductData, StoreSettings } from '../types';
import { 
  ShoppingBag, ShoppingCart, Truck, ShieldCheck, Star, Sparkles, 
  Search, ChevronLeft, ChevronUp, ChevronDown, Flame, Package, Phone, Check,
  Facebook, Instagram, Music, Send, Lock, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import jannaLogo from '../assets/images/janna_logo_1785583716049.jpg';
import jannaCover from '../assets/images/janna_cover_1785583732181.jpg';

interface ProductCardImageProps {
  product: ProductData;
  coverImg: string;
  discountPercent: number;
  onSelectProduct: (slug: string) => void;
}

function ProductCardImage({ product, coverImg, discountPercent, onSelectProduct }: ProductCardImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract unique product image URLs for slideshow (strictly excluding logo and store cover)
  const imageList = React.useMemo(() => {
    const list: string[] = [];
    
    // First, collect all actual product images from product.images
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img.url && !list.includes(img.url)) {
          // Exclude logo and general store cover images
          if (
            img.url !== jannaLogo && 
            img.url !== jannaCover && 
            !img.url.includes('janna_logo') && 
            !img.url.includes('janna_cover')
          ) {
            list.push(img.url);
          }
        }
      });
    }

    // If list is empty, fallback to coverImg/coverUrl ONLY if they are not store logo or cover banner
    if (list.length === 0) {
      const candidates = [coverImg, product.coverUrl].filter(Boolean);
      for (const url of candidates) {
        if (
          url && 
          url !== jannaLogo && 
          url !== jannaCover && 
          !url.includes('janna_logo') && 
          !url.includes('janna_cover') &&
          !list.includes(url)
        ) {
          list.push(url);
        }
      }
    }

    // Absolute fallback if still empty
    if (list.length === 0 && coverImg) {
      list.push(coverImg);
    }

    return list;
  }, [product.images, product.coverUrl, coverImg]);

  // Track if card is in viewport (only cycle images when product is visible to user)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Timer: Exactly 10 seconds (10000ms) interval for changing product images
  useEffect(() => {
    if (!isInView || imageList.length <= 1) return;

    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % imageList.length);
    }, 10000);

    return () => clearTimeout(timer);
  }, [isInView, currentIndex, imageList]);

  const productSlug = product.slug || product.id || 'product';

  return (
    <div 
      ref={containerRef}
      className="relative aspect-[3/4.25] sm:aspect-[1/1.05] overflow-hidden bg-slate-100 cursor-pointer group/img" 
      onClick={() => onSelectProduct(productSlug)}
    >
      <AnimatePresence mode="wait">
        <motion.img 
          key={imageList[currentIndex] || coverImg}
          src={imageList[currentIndex] || coverImg} 
          alt={product.title} 
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.85 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover brightness-[1.02] contrast-[1.06] saturate-[1.12] group-hover/img:scale-110 group-hover/img:brightness-105 group-hover/img:contrast-[1.08] transition-all duration-500 ease-out"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      {/* Image Pagination Indicators if multiple images */}
      {imageList.length > 1 && (
        <div className="absolute bottom-12 inset-x-0 z-10 flex justify-center gap-1.5 pointer-events-none">
          {imageList.map((_, idx) => (
            <span 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-xs ${
                currentIndex === idx 
                  ? 'w-5 bg-emerald-400 border border-emerald-200 shadow-sm' 
                  : 'w-1.5 bg-white/60 backdrop-blur-xs'
              }`}
            />
          ))}
        </div>
      )}

      {/* Soft Gradient Overlay at bottom of image for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10 opacity-80 group-hover/img:opacity-95 transition-opacity duration-300 pointer-events-none" />

      {/* Top Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10">
        {discountPercent > 0 && (
          <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md animate-pulse">
            تخفيض {discountPercent}%-
          </span>
        )}
        <span className="bg-slate-900/85 backdrop-blur-md text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-slate-700/50">
          <Flame size={12} className="text-amber-400" />
          <span>عرض محدود</span>
        </span>
      </div>

      {/* Price Tag Directly on Image */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 bg-emerald-600/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl shadow-xl border border-emerald-400/40">
        <span className="text-lg md:text-xl font-black">{product.price} دج</span>
        {product.oldPrice > product.price && (
          <span className="text-xs text-emerald-200 line-through font-bold opacity-90">{product.oldPrice} دج</span>
        )}
      </div>
    </div>
  );
}

interface StoreHomeProps {
  onSelectProduct: (slug: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  adminToken?: string;
}

export default function StoreHome({ onSelectProduct, onOpenAdmin, isAdminLoggedIn, adminToken }: StoreHomeProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchStoreSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === products.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedProducts = [...products];
    const temp = updatedProducts[index];
    updatedProducts[index] = updatedProducts[newIndex];
    updatedProducts[newIndex] = temp;

    setProducts(updatedProducts);

    try {
      const productIds = updatedProducts.map(p => p.id || p.slug);
      const res = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken || 'ADMINMASTER'
        },
        body: JSON.stringify({ productIds })
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل تغيير ترتيب المنتجات.');
        fetchProducts();
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم.');
      fetchProducts();
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const res = await fetch('/api/store-settings');
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultTickerItems = [
    "🔥 أفضل المنتجات بأسعار ممتازة وجد مناسبة في الجزائر!",
    "🚚 توصيل سريع وآمن لباب المنزل متوفر لـ 58 ولاية جزائرية!",
    "⭐ جودة ممتازة وخامات أصلية ممتازة مختارة ومضمونة 100% من متجرنا",
    "💵 الدفع عند الاستلام - افحصي سلعتك وتأكدي منها بحرية تامة قبل الدفع",
    "🔄 الضمان الذهبي: استبدال مجاني أو استرجاع الأموال سهل وسريع خلال 7 أيام",
    "💥 أسعار مناسبة وجد تنافسية مع تخفيضات حصرية كبرى تصل إلى 40%",
    "📞 خدمة زبائن متميزة متوفرة هاتفياً لتأكيد طلبياتكم والإجابة على أي استفسار"
  ];

  const rawTickerItems = storeSettings?.tickerItems?.length ? storeSettings.tickerItems : defaultTickerItems;
  // Duplicate ticker array to make infinite scrolling seamless
  const tickerList = [...rawTickerItems, ...rawTickerItems, ...rawTickerItems];

  const activeLogo = storeSettings?.logoUrl || jannaLogo;
  const activeCover = storeSettings?.coverUrl || jannaCover;

  return (
    <div className="min-h-screen bg-[#dcecdb] text-slate-800 flex flex-col font-sans" dir="rtl">
      
      {/* 1. Moving Breaking News Ticker (شريط خبر عاجل متحرك باللون الأخضر الفستقي Vert Pistache) */}
      <div className="bg-[#9ec899] text-emerald-950 overflow-hidden whitespace-nowrap py-2.5 px-3 relative shadow-sm border-b border-emerald-300/60 flex items-center">
        <div className="bg-emerald-900 text-amber-300 font-black text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 z-20 shadow-xs shrink-0 border border-emerald-700 ml-3">
          <Flame size={15} className="text-amber-400 animate-pulse" />
          <span>خبر عاجل 🔥</span>
        </div>

        <div className="overflow-hidden w-full relative flex items-center">
          <motion.div 
            className="flex shrink-0 w-max gap-8 items-center font-black text-xs whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            {tickerList.map((item, idx) => (
              <span key={idx} className="flex items-center gap-3 text-emerald-950">
                <span>{item}</span>
                <span className="text-emerald-700 text-sm font-extrabold">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 2. Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm py-3 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-white flex items-center justify-center shrink-0">
            <img 
              src={activeLogo} 
              alt="Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-black text-xl md:text-2xl bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              {storeSettings?.storeName || 'جنة ستور | Janna Store 🛍️'}
            </h1>
            <p className="text-[11px] text-slate-500 font-bold -mt-0.5">
              {storeSettings?.storeSub || 'متجركم الأول للتسوق الإلكتروني في الجزائر 🇩🇿'}
            </p>
          </div>
        </div>

        {/* Header Social & Admin Actions */}
        <div className="flex items-center gap-2">
          {/* Social Links */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-3 ml-2">
            {storeSettings?.socialLinks?.facebook && (
              <a href={storeSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                <Facebook size={15} />
              </a>
            )}
            {storeSettings?.socialLinks?.instagram && (
              <a href={storeSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition-colors">
                <Instagram size={15} />
              </a>
            )}
            {storeSettings?.socialLinks?.tiktok && (
              <a href={storeSettings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-100 text-zinc-800 rounded-full hover:bg-zinc-800 hover:text-white transition-colors">
                <Music size={15} />
              </a>
            )}
          </div>

          <button 
            onClick={onOpenAdmin}
            className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
              isAdminLoggedIn 
              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Lock size={14} />
            <span>{isAdminLoggedIn ? 'لوحة الإدارة' : 'دخول الأدمن'}</span>
          </button>
        </div>
      </header>

      {/* Main Store Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 md:px-8 py-8 space-y-10">
        
        {/* 3. Hero Section with Clear Store Cover Image Background */}
        <section className="relative rounded-3xl overflow-hidden shadow-xl h-[280px] md:h-[340px] flex items-end justify-start border border-slate-200">
          {/* Background Cover Image - Completely Clear and Prominent */}
          <div className="absolute inset-0 z-0">
            <img 
              src={activeCover} 
              alt="Store Cover" 
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Subtle Gradient strictly at the bottom for text contrast without covering the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
          </div>

          {/* Hero Content - Clean 2 Lines at Bottom */}
          <div className="relative z-10 p-5 md:p-8 text-white max-w-2xl space-y-1.5">
            <h2 className="text-lg md:text-2xl font-black leading-snug text-white drop-shadow-md">
              {storeSettings?.heroTitle || 'تسوق أفضل المنتجات بأفضل الأسعار في الجزائر 🇩🇿'}
            </h2>

            <p className="text-xs md:text-sm text-emerald-100 font-bold drop-shadow-sm">
              {storeSettings?.heroSub || 'جنة ستور هي وجهتك المفضلة للتسوق الإلكتروني 🛒'}
            </p>
          </div>
        </section>

        {/* 4. Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full sm:w-80">
            <input 
              type="text"
              placeholder="ابحث عن منتج بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
          </div>

          <div className="text-xs text-slate-500 font-bold text-center sm:text-left">
            <span>عدد المنتجات المتاحة حالياً: </span>
            <strong className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-sm">{filteredProducts.length}</strong>
          </div>
        </div>

        {/* Admin Reorder Banner Notification */}
        {isAdminLoggedIn && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 font-black text-xs md:text-sm">
              <Sparkles size={20} className="text-amber-600 animate-bounce shrink-0" />
              <span>وضع الأدمن مفعل: يمكنك تغيير ترتيب ظهور المنتجات مباشرة من هنا بالضغط على الأسهم ⬆️ ⬇️ الموجودة أعلى كل منتج!</span>
            </div>
            <button
              onClick={onOpenAdmin}
              className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              الرجوع للوحة التحكم
            </button>
          </div>
        )}

        {/* 5. Products Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-slate-500 text-sm font-bold">جاري تحميل المنتجات المتاحة في المتجر...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Package size={48} className="text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">لم يتم العثور على أي منتج</h3>
            <p className="text-xs text-slate-400">يرجى التأكد من كلمة البحث أو إضافة منتجات جديدة من لوحة الأدمن.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p, index) => {
              const coverImg = p.images?.find(i => i.isMain)?.url || p.images?.[0]?.url || p.coverUrl || activeLogo;
              const discountPercent = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
              const productSlug = p.slug || p.id || 'product';

              return (
                <motion.div
                  key={p.id || p.slug}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-slate-100 flex flex-col justify-between transition-all group relative"
                >
                  {/* Admin Direct Product Reorder Control Bar */}
                  {isAdminLoggedIn && (
                    <div className="bg-amber-500 text-slate-950 px-4 py-2.5 flex items-center justify-between font-black text-xs border-b border-amber-600 shadow-sm z-20">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={15} className="text-slate-900" />
                        <span>ترتيب المنتج: #{index + 1}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveProduct(index, 'up');
                          }}
                          disabled={index === 0}
                          className="bg-slate-900 text-white hover:bg-emerald-600 disabled:opacity-30 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold shadow-xs text-[11px]"
                          title="رفع المنتج للأعلى ليظهر قبل المنتجات الأخرى"
                        >
                          <ChevronUp size={16} />
                          <span>أعلى</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveProduct(index, 'down');
                          }}
                          disabled={index === filteredProducts.length - 1}
                          className="bg-slate-900 text-white hover:bg-emerald-600 disabled:opacity-30 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold shadow-xs text-[11px]"
                          title="إنزال المنتج للأسفل"
                        >
                          <ChevronDown size={16} />
                          <span>أسفل</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col h-full justify-between">
                    <div>
                      {/* Image Header with Automatic Slideshow, Filters & Price Overlay */}
                      <ProductCardImage 
                        product={p}
                        coverImg={coverImg}
                        discountPercent={discountPercent}
                        onSelectProduct={onSelectProduct}
                      />

                      {/* Product Body Details (Text strictly at bottom) */}
                      <div className="p-4 space-y-2">
                        <h3 
                          onClick={() => onSelectProduct(productSlug)}
                          className="font-black text-lg text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug cursor-pointer"
                        >
                          {p.title}
                        </h3>

                        {/* Features tags (Only 2 features) */}
                        {p.features && p.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {p.features.slice(0, 2).map((feat, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                ✓ {feat.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order CTA Button at Bottom */}
                    <div className="p-4 pt-0 space-y-2">
                      <button
                        onClick={() => onSelectProduct(productSlug)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm animate-bounce"
                        style={{ animationDuration: '2.5s' }}
                      >
                        <ShoppingCart size={18} />
                        <span>اشتري الآن ( صفحة الشراء)</span>
                        <ChevronLeft size={16} className="animate-pulse" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 6. Why Shop With Us Section (Customizable Features) */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-slate-900">لماذا يفضل القائمون بالتسوق الشراء من متجرنا؟</h3>
            <p className="text-xs text-slate-500">نوفر لك تجربة تسوق موثوقة وسريعة بدون أي مخاطرة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                <Truck size={24} />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">
                {storeSettings?.feature1Title || 'توصيل سريع لـ 58 ولاية'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {storeSettings?.feature1Desc || 'نصلك أينما كنت بالجزائر، للمنزل أو لمكتب التوصيل القريب منك.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">
                {storeSettings?.feature2Title || 'معاينة وإفحاص قبل الدفع'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {storeSettings?.feature2Desc || 'افحص طردك واستلم منتجك بثقة تامة ثم ادفع الثمن للموزع يداً بيد.'}
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
              <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto">
                <Phone size={24} />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">
                {storeSettings?.feature3Title || 'خدمة زبائن متابعة'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {storeSettings?.feature3Desc || 'يتصل بك فريقنا الهاتفي لتأكيد العنوان والإجابة عن أي تساؤل.'}
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 border-t border-slate-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div>
            <h4 className="font-black text-lg text-emerald-400">
              {storeSettings?.storeName || 'جنة ستور | Janna Store'}
            </h4>
            <p className="text-xs text-slate-400">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>تسوق آمن ومضمون 100% في الجزائر 🇩🇿</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
