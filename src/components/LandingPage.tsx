import React, { useState, useEffect, useRef } from 'react';
import { ProductData, Wilaya, Order, StoreSettings } from '../types';
import { ALGERIAN_WILAYAS } from './WilayaData';
import { 
  Facebook, Instagram, Music,
  ShoppingCart, Star, ShieldCheck, Truck, Sparkles, RefreshCw, 
  Wind, Layers, Package, Phone, User, MapPin, Send, Check, 
  ArrowRight, ChevronLeft, ChevronRight, Clock, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import jannaLogo from '../assets/images/janna_logo_1785583716049.jpg';
import jannaCover from '../assets/images/janna_cover_1785583732181.jpg';

interface LandingPageProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export default function LandingPage({ onOpenAdmin, isAdminLoggedIn }: LandingPageProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  
  // Checkout Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaNum, setSelectedWilayaNum] = useState<number>(16); // Default Alger (16)
  const [commune, setCommune] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingType, setShippingType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');
  const [wilayasList, setWilayasList] = useState<Wilaya[]>(ALGERIAN_WILAYAS);
  
  // Form submission feedback
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Countdown timer (e.g. 1 hour, 34 mins, 12 secs, resetting or starting high)
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 42, seconds: 28 });
  const [stockCount, setStockCount] = useState(12);

  const formRef = useRef<HTMLDivElement>(null);

  const fetchStoreSettings = async () => {
    try {
      const res = await fetch('/api/store-settings');
      if (res.ok) {
        const data = await res.json();
        setStoreSettings(data);
      }
    } catch (err) {
      console.error("Error fetching store settings:", err);
    }
  };

  const fetchWilayas = async () => {
    try {
      const res = await fetch('/api/wilayas');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setWilayasList(data);
          // Auto-select the first available Wilaya if default Alger is not available
          const algerAvailable = data.find(w => w.num === 16)?.available;
          if (!algerAvailable) {
            const firstAvail = data.find(w => w.available);
            if (firstAvail) {
              setSelectedWilayaNum(firstAvail.num);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching wilayas:", err);
    }
  };

  // Fetch product data on load
  useEffect(() => {
    fetchProduct();
    fetchWilayas();
    fetchStoreSettings();
    
    // Countdown simulation
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset
          return { hours: 2, minutes: 15, seconds: 0 };
        }
      });
    }, 1000);

    // Random stock reduction to trigger FOMO (fear of missing out)
    const stockInterval = setInterval(() => {
      setStockCount(prev => (prev > 3 ? prev - (Math.random() > 0.7 ? 1 : 0) : prev));
    }, 25000);

    return () => {
      clearInterval(interval);
      clearInterval(stockInterval);
    };
  }, []);

  const getSlugFromUrl = (): string | null => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      if (pathParts[0] === 'p' && pathParts[1]) {
        return decodeURIComponent(pathParts[1]);
      }
      if (pathParts[0] !== 'admin') {
        return decodeURIComponent(pathParts[0]);
      }
    }
    return null;
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const slug = getSlugFromUrl();
      const endpoint = slug ? `/api/products/${slug}` : '/api/product';
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        if (data.stockCount) {
          setStockCount(data.stockCount);
        }
      } else if (slug) {
        // Fallback if specific slug not found
        const fallbackRes = await fetch('/api/product');
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setProduct(data);
          if (data.stockCount) {
            setStockCount(data.stockCount);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedWilaya = wilayasList.find(w => w.num === selectedWilayaNum) || wilayasList[15] || ALGERIAN_WILAYAS[15]; // Default Alger
  const shippingCost = shippingType === 'home' ? selectedWilaya.shippingHome : selectedWilaya.shippingDesk;
  const productPrice = product ? product.price : 0;
  const totalPrice = (productPrice * quantity) + shippingCost;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNextImage = () => {
    if (!product || !product.images.length) return;
    setActiveImageIndex(prev => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    if (!product || !product.images.length) return;
    setActiveImageIndex(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف');
      return;
    }
    // Simple Algerian phone number validation check (05, 06, 07, or +213)
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^(05|06|07|02|03|04|\+213|213)/.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف جزائري صالح (موبيليس، جيزي، أوريدو أو هاتف ثابت)');
      return;
    }
    if (!commune.trim()) {
      setErrorMsg('يرجى إدخال البلدية');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone,
          wilayaNum: selectedWilaya.num,
          wilayaName: selectedWilaya.nameAr,
          commune,
          quantity,
          notes,
          shippingPrice: shippingCost,
          totalPrice,
          productSlug: product?.slug || 'hairstyler'
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setSuccessOrder(resData.order);
        // Clear form
        setName('');
        setPhone('');
        setCommune('');
        setNotes('');
        setQuantity(1);
      } else {
        setErrorMsg(resData.error || 'حدث خطأ في معالجة طلبك، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      setErrorMsg('لم نتمكن من الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 font-medium text-lg dir-rtl text-right">جاري تحميل العرض الاحترافي...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-red-500 p-4 text-center">
        <p className="text-xl font-bold dir-rtl">خطأ في تحميل بيانات المنتج</p>
        <button onClick={fetchProduct} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-md">إعادة المحاولة</button>
      </div>
    );
  }

  const mainImage = product.images[activeImageIndex]?.url || product.images[0]?.url;

  const tickerItems = storeSettings?.tickerItems?.length
    ? [
        ...storeSettings.tickerItems,
        ...(product?.features?.map(f => `✨ ${f.title}: ${f.description}`) || [])
      ]
    : [
        "🚚 توصيل سريع وآمن لباب المنزل متوفر لـ 58 ولاية جزائرية!",
        "⭐ جودة ممتازة وخامات أصلية ممتازة مختارة ومضمونة 100% من متجرنا",
        "💵 الدفع عند الاستلام - افحصي سلعتك وتأكدي منها بحرية تامة قبل الدفع",
        "🔄 الضمان الذهبي: استبدال مجاني أو استرجاع الأموال سهل وسريع خلال 7 أيام",
        "💥 أسعار مناسبة وجد تنافسية مع تخفيضات حصرية كبرى تصل إلى 40%",
        "📞 خدمة زبائن متميزة متوفرة هاتفياً لتأكيد طلبياتكم والإجابة على أي استفسار",
        ...(product?.features?.map(f => `✨ ${f.title}: ${f.description}`) || [])
      ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      
      {/* Dynamic Promo Bar */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-center py-2 px-4 text-sm font-bold shadow-sm flex items-center justify-center gap-2 animate-pulse">
        <Flame size={16} className="text-yellow-300 animate-bounce" />
        <span>{product.promoText}</span>
      </div>

      {/* Elegant Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-md py-3 px-4 md:px-8 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2 flex-1 md:flex-none">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-100/50 border border-slate-100 bg-white flex items-center justify-center">
            <img 
              src={product.logoUrl || jannaLogo} 
              alt="Store Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-black text-lg md:text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent font-black">
              {storeSettings?.storeName || "جنة ستور | Janna Store 🛍️"}
            </span>
            <span className="text-[10px] text-slate-500 font-bold block -mt-1">
              {storeSettings?.storeSub || "متجركم المفضل للتسوق الإلكتروني في الجزائر 🇩🇿"}
            </span>
          </div>
        </div>

        

        {/* Social Links Centered in Header */}
        <div className="flex flex-1 justify-center items-center overflow-x-auto mx-2 md:mx-4">
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
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-none justify-end">
          <button 
            onClick={scrollToForm}
            className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black py-2 px-5 rounded-full shadow-md shadow-emerald-100 transition-all duration-200 text-sm"
          >
            <span>أطلب الآن</span>
            <ChevronLeft size={16} />
          </button>
          
          <button 
            onClick={onOpenAdmin}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 font-bold ${
              isAdminLoggedIn 
              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAdminLoggedIn ? 'لوحة التحكم الإدارية' : 'دخول الأدمن 🔐'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 space-y-8">
        
        {/* Product Cover Banner */}
        <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white">
          <img 
            src={product.coverUrl || jannaCover} 
            alt="Product Cover Banner" 
            className="w-full h-auto object-cover max-h-[380px]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Premium Urgent News Ticker (شريط الأخبار والمميزات المتحرك) */}
        <div className="bg-slate-900 text-slate-100 flex items-center h-12 overflow-hidden select-none relative z-30 text-sm md:text-[15px] font-black shadow-inner rounded-2xl md:rounded-3xl border border-slate-800">
          {/* Right Label (Fixed like Breaking News) */}
          <div className="bg-red-600 text-white px-3 sm:px-4 h-full flex items-center gap-2 shrink-0 z-20 font-black shadow-[4px_0_15px_rgba(0,0,0,0.5)] relative">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="whitespace-nowrap">عاجل ومميز 🔥</span>
          </div>

          {/* Scrolling Ticker Track */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center bg-slate-900">
            <div className="flex whitespace-nowrap gap-12 animate-ticker py-2 hover:[animation-play-state:paused] cursor-pointer">
              {/* Set 1 */}
              <div className="flex items-center gap-12 shrink-0">
                {tickerItems.map((item, index) => (
                  <span key={`ticker-1-${index}`} className="flex items-center gap-2 text-slate-100 hover:text-emerald-400 transition-colors">
                    <span className="text-emerald-400 font-extrabold">✦</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
              {/* Set 2 (Duplicated for perfect infinite scroll loop) */}
              <div className="flex items-center gap-12 shrink-0" aria-hidden="true">
                {tickerItems.map((item, index) => (
                  <span key={`ticker-2-${index}`} className="flex items-center gap-2 text-slate-100 hover:text-emerald-400 transition-colors">
                    <span className="text-emerald-400 font-extrabold">✦</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes ticker-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(50%); }
            }
            .animate-ticker {
              display: flex;
              animation: ticker-scroll 45s linear infinite;
              width: max-content;
            }
          `}</style>
        </div>

        
        {/* Product Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100">
          
          {/* Right side: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner group">
              <img 
                src={mainImage} 
                alt={product.title} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Image Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md active:scale-90 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={handleNextImage} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md active:scale-90 transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">تخفيض 40% 🔥</span>
                <span className="bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">الأكثر مبيعاً 🏆</span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border-2 transition-all duration-200 flex-shrink-0 ${
                      activeImageIndex === idx ? 'border-emerald-600 shadow-md shadow-emerald-50' : 'border-slate-100 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Left side: Product Info & Dynamic Highlights */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Reviews rating summary */}
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 w-fit px-3 py-1 rounded-full text-xs font-semibold">
                <div className="flex items-center text-amber-500">
                  <Star size={14} className="fill-amber-500" />
                </div>
                <span>4.9 / 5.0 نجوم (بناءً على {product.reviews.length} تقييم حقيقي)</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {product.title}
              </h1>

              <p className="text-lg text-emerald-600 font-extrabold flex items-center gap-1.5">
                <Sparkles size={18} className="animate-spin text-amber-500" />
                <span>{product.subtitle}</span>
              </p>

              {/* Price section */}
              <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">السعر الحالي الحصري</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600">{product.price} دج</span>
                    <span className="text-sm text-slate-400 line-through font-semibold">{product.oldPrice} دج</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-red-100 text-red-700 text-xs font-bold py-1 px-2.5 rounded-lg block">توفير {product.oldPrice - product.price} دج!</span>
                  <span className="text-[10px] text-slate-400 block mt-1">الدفع عند الاستلام (COD)</span>
                </div>
              </div>

              {/* Stock status & Urgent Countdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-2xl p-3 border border-red-100 flex items-center gap-3">
                  <div className="bg-red-600 text-white p-2 rounded-xl">
                    <Clock size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">العرض ينتهي في:</span>
                    <span className="font-mono text-xs font-black text-red-700">
                      {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 flex items-center gap-3">
                  <div className="bg-amber-500 text-white p-2 rounded-xl">
                    <Package size={18} className="animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">المخزون المتبقي:</span>
                    <span className="font-bold text-xs text-amber-800">{stockCount} قطعة فقط!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <Truck size={16} className="text-emerald-600" />
                <span>توصيل سريع وباب المنزل متوفر لـ 58 ولاية</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>الضمان الذهبي: استبدال مجاني أو استرجاع الأموال إن لم يعجبك</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                <RefreshCw size={16} className="text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span>الدفع آمن 100% فقط عند استلامك للمنتج وتفقده</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button 
              onClick={scrollToForm}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-emerald-100 transition-all duration-200 flex items-center justify-center gap-3 group mt-4 animate-bounce"
            >
              <ShoppingCart size={22} className="group-hover:translate-x-1 transition-transform" />
              <span>أطلبي الآن - الدفع عند الاستلام</span>
            </button>
          </div>
        </section>

        {/* Product In-depth Details & Features Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">مميزات ومواصفات المنتج</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">لماذا يستحق هذا المنتج الاقتناء؟</h2>
            <div className="h-1 w-12 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features list */}
            <div className="space-y-4">
              {product.features.map(f => (
                <div key={f.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex-shrink-0">
                    {f.icon === 'Wind' && <Wind size={20} />}
                    {f.icon === 'Layers' && <Layers size={20} />}
                    {f.icon === 'ShieldCheck' && <ShieldCheck size={20} />}
                    {f.icon === 'Sparkles' && <Sparkles size={20} />}
                    {f.icon !== 'Wind' && f.icon !== 'Layers' && f.icon !== 'ShieldCheck' && f.icon !== 'Sparkles' && <Sparkles size={20} />}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-slate-900">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description/Text panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              <div className="prose prose-slate max-w-none text-right">
                <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2 text-emerald-700">
                  <Sparkles size={18} />
                  <span>تفاصيل إضافية للمنتج</span>
                </h3>
                <div className="whitespace-pre-line text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </div>
              </div>

              {/* Delivery steps */}
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 space-y-3">
                <h4 className="font-bold text-xs text-emerald-800">طريقة الطلب السهلة في الجزائر:</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="space-y-1">
                    <div className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mx-auto">1</div>
                    <p className="font-bold text-slate-800">املأ الاستمارة</p>
                    <p className="text-slate-400">ادخل معلوماتك في الأسفل</p>
                  </div>
                  <div className="space-y-1">
                    <div className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mx-auto">2</div>
                    <p className="font-bold text-slate-800">تأكيد الطلب</p>
                    <p className="text-slate-400">سنتصل بك هاتفياً للتأكيد</p>
                  </div>
                  <div className="space-y-1">
                    <div className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mx-auto">3</div>
                    <p className="font-bold text-slate-800">استلم وادفع</p>
                    <p className="text-slate-400">الدفع نقداً عند استلام المنتج</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* High Converting Checkout Form (Algier Store Style) */}
        <section ref={formRef} id="checkout-section" className="scroll-mt-24">
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl text-white overflow-hidden shadow-2xl relative">
            
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="p-6 md:p-10 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Form text description */}
              <div className="md:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 bg-emerald-700/60 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-600/30">
                  <Package size={14} />
                  <span>الشحن متوفر لجميع بلديات الجزائر 🇩🇿</span>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-black leading-tight text-white">
                    استمارة الطلب السريع والسهل
                  </h2>
                  <p className="text-emerald-100 text-sm leading-relaxed">
                    من فضلك املأ معلوماتك بدقة، وسنقوم بالاتصال بك هاتفياً في غضون ساعات قليلة لتأكيد طلبك وشحن المنتج إليك مباشرة!
                  </p>
                </div>

                {/* Total dynamic pricing block */}
                <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-2xl p-5 space-y-3">
                  <span className="text-xs text-emerald-300 block">فاتورة الطلب التقديرية</span>
                  
                  <div className="flex justify-between items-center text-sm border-b border-emerald-800/50 pb-2">
                    <span className="text-emerald-200">سعر المنتج ({quantity} قطعة):</span>
                    <span className="font-bold text-white">{productPrice * quantity} دج</span>
                  </div>

                  <div className="flex justify-between items-center text-sm border-b border-emerald-800/50 pb-2">
                    <span className="text-emerald-200">
                      تكلفة الشحن لولاية <strong className="text-yellow-300">({selectedWilaya.nameAr})</strong>:
                    </span>
                    <span className="font-bold text-white">
                      {shippingCost === 0 ? 'مجاني' : `${shippingCost} دج`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-base text-yellow-300">السعر الإجمالي للدفع عند الاستلام:</span>
                    <span className="font-black text-2xl text-yellow-300">{totalPrice} دج</span>
                  </div>

                  <span className="text-[10px] text-emerald-300 block text-center pt-2 italic">
                    ⚠️ لن تدفع أي سنت الآن! الدفع يكون يداً بيد بعد استلام منتجك وتفقده.
                  </span>
                </div>
              </div>

              {/* Form inputs */}
              <div className="md:col-span-7 bg-white text-slate-800 rounded-2xl p-5 md:p-8 shadow-lg">
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User size={14} className="text-emerald-600" />
                      <span>الاسم الكامل (الاسم واللقب) <strong className="text-red-500">*</strong></span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="أدخل اسمك الكامل هنا"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone size={14} className="text-emerald-600" />
                      <span>رقم الهاتف <strong className="text-red-500">*</strong></span>
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="مثال: 06XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white transition-all font-mono font-semibold"
                      dir="ltr"
                    />
                  </div>

                  {/* Wilaya and Commune row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Wilaya select */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        <span>الولاية <strong className="text-red-500">*</strong></span>
                      </label>
                      <select
                        value={selectedWilayaNum}
                        onChange={(e) => setSelectedWilayaNum(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white transition-all font-semibold"
                      >
                        {wilayasList.filter(w => w.available).map(w => (
                          <option key={w.num} value={w.num}>
                            {String(w.num).padStart(2, '0')} - {w.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Commune field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-600" />
                        <span>البلدية <strong className="text-red-500">*</strong></span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="أدخل اسم البلدية"
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Shipping option */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">نوع التوصيل</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShippingType('home')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          shippingType === 'home'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>توصيل للمنزل 🏠</span>
                        <span className="text-[10px] text-slate-500 font-normal">توصيل لباب بيتك (+{selectedWilaya.shippingHome} دج)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShippingType('desk')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          shippingType === 'desk'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>استلام من المكتب 🏢</span>
                        <span className="text-[10px] text-slate-500 font-normal">توفر وقت وتكلفة أقل (+{selectedWilaya.shippingDesk} دج)</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity and notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    
                    {/* Quantity counter */}
                    <div className="sm:col-span-1 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">الكمية المطلوبة</label>
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="px-3 py-2.5 hover:bg-slate-200 text-slate-600 font-black transition-colors"
                        >
                          -
                        </button>
                        <span className="flex-grow text-center font-extrabold text-sm">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => q + 1)}
                          className="px-3 py-2.5 hover:bg-slate-200 text-slate-600 font-black transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">ملاحظات (مقاس، لون، وقت الاتصال)</label>
                      <input 
                        type="text"
                        placeholder="اختياري: مثلاً اتصلوا بي بعد العصر"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Error feedback */}
                  {errorMsg && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs font-bold text-center">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* High pulsing checkout button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 active:scale-[0.98] text-white font-black text-lg py-4 rounded-xl shadow-xl shadow-orange-500/20 transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer relative overflow-hidden`}
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send size={20} className="animate-bounce" />
                        <span>أكّدي طلبك الآن (الدفع عند الاستلام)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] mt-2">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>جميع بياناتك الشخصية مشفرة ومحمية بخصوصية تامة</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Real Customer Reviews Section (Algier eCommerce style) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">آراء زبائننا الكرام</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">ماذا يقولون عن منتجنا؟</h2>
            <div className="h-1 w-12 bg-emerald-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Rating Stars */}
                  <div className="flex text-amber-400 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} 
                      />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    " {review.comment} "
                  </p>
                </div>

                {/* Reviewer Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-slate-700">{review.name}</span>
                    <span>من ولاية {review.wilaya}</span>
                  </div>
                  <span>{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating CTA for Mobile Screens */}
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-30">
        <button 
          onClick={scrollToForm}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm py-3.5 rounded-full shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingCart size={18} />
          <span>أطلبي المنتج الآن والدفع عند الاستلام</span>
        </button>
      </div>

      {/* Modern Algerian COD Style Footer */}
      

      {/* Success Order Confirmation Modal */}
      <AnimatePresence>
        {successOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full p-6 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                <Check size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">🎉 تم تسجيل طلبك بنجاح!</h3>
                <p className="text-xs text-slate-500">شكراً لكِ على ثقتك بمتجرنا.</p>
              </div>

              {/* Order quick summary details */}
              <div className="bg-slate-50 rounded-2xl p-4 text-right space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-400">رقم طلبك الفريد:</span>
                  <span className="font-bold text-slate-900 font-mono">{successOrder.id}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-400">الاسم الكامل:</span>
                  <span className="font-bold text-slate-900">{successOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-400">رقم الهاتف:</span>
                  <span className="font-bold text-slate-900 font-mono">{successOrder.phone}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-slate-400">الولاية والبلدية:</span>
                  <span className="font-bold text-slate-900">{successOrder.wilayaName} - {successOrder.commune}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">مجموع الفاتورة الإجمالي:</span>
                  <span className="font-black text-base text-emerald-600">{successOrder.totalPrice} دج</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 leading-relaxed border border-amber-100">
                📞 <strong>ملاحظة هامة:</strong> سنقوم بالاتصال بك هاتفياً في غضون الساعات القليلة القادمة لتأكيد العنوان والشحن. يرجى إبقاء هاتفك قريباً والرد على المكالمة.
              </div>

              <button
                onClick={() => setSuccessOrder(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
