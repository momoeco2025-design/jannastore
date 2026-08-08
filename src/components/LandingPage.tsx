import React, { useState, useEffect, useRef } from 'react';
import { ProductData, Wilaya, Order, StoreSettings } from '../types';
import { ALGERIAN_WILAYAS } from './WilayaData';
import { 
  Facebook, Instagram, Music, Home,
  ShoppingCart, ShoppingBag, Star, ShieldCheck, Truck, Sparkles, RefreshCw, 
  Wind, Layers, Package, Phone, User, MapPin, Send, Check, 
  ArrowRight, ChevronLeft, ChevronRight, Clock, Flame, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import jannaLogo from '../assets/images/janna_logo_1785583716049.jpg';
import jannaCover from '../assets/images/janna_cover_1785583732181.jpg';

interface LandingPageProps {
  key?: string;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onGoHome?: () => void;
}

export default function LandingPage({ onOpenAdmin, isAdminLoggedIn, onGoHome }: LandingPageProps) {
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
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [shippingType, setShippingType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');
  const [wilayasList, setWilayasList] = useState<Wilaya[]>(ALGERIAN_WILAYAS);

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    if (!product) return;

    // Switch main gallery image if there's an image assigned to this color name
    const matchingImgIdx = product.images.findIndex(img => img.colorName === colorName);
    if (matchingImgIdx !== -1) {
      setActiveImageIndex(matchingImgIdx);
      return;
    }

    // Check if the color object has an imageUrl
    const colObj = product.colors?.find(c => c.name === colorName);
    if (colObj?.imageUrl) {
      const imgIdxByUrl = product.images.findIndex(img => img.url === colObj.imageUrl);
      if (imgIdxByUrl !== -1) {
        setActiveImageIndex(imgIdxByUrl);
      }
    }
  };
  
  // Form submission feedback
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Countdown timer (e.g. 1 hour, 34 mins, 12 secs, resetting or starting high)
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 42, seconds: 28 });
  const [stockCount, setStockCount] = useState(12);
  const [isFormInView, setIsFormInView] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to hide mobile floating CTA when order form is visible
  useEffect(() => {
    if (!formRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFormInView(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [loading]);

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

  // Meta Pixel tracking effect
  useEffect(() => {
    const pixelId = product?.pixelId || storeSettings?.metaPixelId;
    if (!pixelId) return;

    const w = window as any;
    const d = document;
    if (!w.fbq) {
      const n: any = w.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!w._fbq) w._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      const t: any = d.createElement('script');
      t.async = !0;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const elem = d.getElementsByTagName('script')[0];
      if (elem && elem.parentNode) {
        elem.parentNode.insertBefore(t, elem);
      } else {
        d.head.appendChild(t);
      }
      w.fbq('init', pixelId);
    }

    const testCode = storeSettings?.metaTestEventCode;
    const options = testCode ? { test_event_code: testCode } : undefined;

    w.fbq('track', 'PageView', options);
    // Track stats on backend
    if (product?.slug) {
      fetch('/api/stats/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: product.slug, eventType: 'pageView' })
      }).catch(() => {});
    }

    if (product) {
      w.fbq('track', 'ViewContent', {
        content_name: product.title,
        content_ids: [product.slug || product.id || 'product'],
        content_type: 'product',
        value: product.price,
        currency: storeSettings?.currency || 'DZD'
      }, options);

      if (product.slug) {
        fetch('/api/stats/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug: product.slug, eventType: 'viewContent' })
        }).catch(() => {});
      }
    }
  }, [product?.pixelId, storeSettings?.metaPixelId, storeSettings?.metaTestEventCode, storeSettings?.currency, product?.id]);

  // Track Purchase event when successOrder is set (with eventID deduplication)
  useEffect(() => {
    if (successOrder && (window as any).fbq) {
      const testCode = storeSettings?.metaTestEventCode;
      const options = {
        ...(testCode ? { test_event_code: testCode } : {}),
        eventID: successOrder.id
      };
      (window as any).fbq('track', 'Purchase', {
        value: successOrder.totalPrice,
        currency: storeSettings?.currency || 'DZD',
        content_name: successOrder.productName || product?.title,
        content_ids: [successOrder.productSlug || product?.slug || 'product'],
        content_type: 'product',
        num_items: successOrder.quantity
      }, options);
    }
  }, [successOrder, storeSettings?.currency]);

  const handleFormInteraction = () => {
    if (!(window as any)._checkoutTracked && (window as any).fbq) {
      (window as any)._checkoutTracked = true;
      const testCode = storeSettings?.metaTestEventCode;
      const options = testCode ? { test_event_code: testCode } : undefined;
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: product?.title,
        content_ids: [product?.slug || product?.id || 'product'],
        content_type: 'product',
        value: totalPrice,
        currency: storeSettings?.currency || 'DZD',
        num_items: quantity
      }, options);

      if (product?.slug) {
        fetch('/api/stats/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug: product.slug, eventType: 'initiateCheckout' })
        }).catch(() => {});
      }
    }
  };

  const trackAddToCart = () => {
    if ((window as any).fbq) {
      const testCode = storeSettings?.metaTestEventCode;
      const options = testCode ? { test_event_code: testCode } : undefined;
      (window as any).fbq('track', 'AddToCart', {
        content_name: product?.title,
        content_ids: [product?.slug || product?.id || 'product'],
        content_type: 'product',
        value: totalPrice,
        currency: storeSettings?.currency || 'DZD',
        num_items: quantity
      }, options);
    }
    if (product?.slug) {
      fetch('/api/stats/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: product.slug, eventType: 'addToCart' })
      }).catch(() => {});
    }
  };

  const handleFormLead = () => {
    if (!(window as any)._leadTracked && (window as any).fbq) {
      (window as any)._leadTracked = true;
      const testCode = storeSettings?.metaTestEventCode;
      const options = testCode ? { test_event_code: testCode } : undefined;
      (window as any).fbq('track', 'Lead', {
        content_name: product?.title,
        content_ids: [product?.slug || product?.id || 'product'],
        content_type: 'product',
        value: totalPrice,
        currency: storeSettings?.currency || 'DZD',
        num_items: quantity
      }, options);

      if (product?.slug) {
        fetch('/api/stats/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSlug: product.slug, eventType: 'lead' })
        }).catch(() => {});
      }
    }
  };

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
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0].name);
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
          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0].name);
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
    trackAddToCart();
    setIsFormInView(true);
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
          selectedColor: selectedColor || (product?.colors?.[0]?.name || ''),
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
    <div className="min-h-screen bg-[#dcecdb] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      
      {/* Dynamic Promo Bar */}
      <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white text-center py-2 px-4 text-sm font-bold shadow-sm flex items-center justify-center gap-2 animate-pulse">
        <Flame size={16} className="text-yellow-300 animate-bounce" />
        <span>{product.promoText}</span>
      </div>

      {/* Elegant Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm py-2 px-3 md:px-6 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          <div 
            onClick={onGoHome}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 ${onGoHome ? 'cursor-pointer hover:opacity-90' : ''}`}
          >
            <img 
              src={product.logoUrl || jannaLogo} 
              alt="Store Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {onGoHome && (
            <button 
              onClick={onGoHome}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs transition-all shadow-xs cursor-pointer"
              title="تصفح جميع المنتجات والعروض الحصرية في المتجر"
            >
              <ShoppingBag size={14} />
              <span>تصفح منتجات أخرى مميزة</span>
            </button>
          )}
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
        
        {/* Product Hero Section (Cleaned up: Images -> Title -> Price) */}
        <section className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 space-y-5">
          
          {/* Main Image & Sub Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner group max-w-xl mx-auto">
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
            </div>

            {/* Sub-images / Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Title & Price directly under images */}
          <div className="space-y-3 border-t border-slate-100 pt-4 max-w-xl mx-auto">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
              {product.title}
            </h1>

            <div className="bg-emerald-50/90 rounded-2xl p-4 flex justify-between items-center border border-emerald-200/80">
              <div>
                <span className="text-xs text-slate-500 block font-bold">السعر الحالي:</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl md:text-3xl font-black text-emerald-700">{product.price} دج</span>
                  {product.oldPrice && (
                    <span className="text-sm text-slate-400 line-through font-semibold">{product.oldPrice} دج</span>
                  )}
                </div>
              </div>
              {product.oldPrice && product.oldPrice > product.price && (
                <div className="text-right">
                  <span className="bg-red-100 text-red-700 text-xs font-black py-1 px-2.5 rounded-lg block">
                    توفير {product.oldPrice - product.price} دج!
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* High Converting Checkout Form (Unified Single-Card Layout directly under Hero) */}
        <section ref={formRef} id="checkout-section" className="scroll-mt-20">
          <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-5 md:p-8 space-y-6 relative overflow-hidden">
            
            {/* Header Badge & Title */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white -mx-5 -mt-5 md:-mx-8 md:-mt-8 p-5 md:p-6 mb-2">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-emerald-700/80 text-emerald-100 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                  <Package size={14} />
                  <span>الشحن متوفر لجميع بلديات الجزائر 🇩🇿</span>
                </span>
                <span className="text-[11px] bg-amber-400 text-slate-900 font-black px-2.5 py-1 rounded-lg">
                  الدفع عند الاستلام COD
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                🛒 استمارة الطلب السريع
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                من فضلك أَدخِل بياناتك في الأسفل، وسنتصل بك هاتفياً لتأكيد الطلب وشحن المنتجات لباب منزلك!
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} onFocus={handleFormInteraction} className="space-y-4">
              
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User size={15} className="text-emerald-600" />
                  <span>الاسم الكامل (الاسم واللقب) <strong className="text-red-500">*</strong></span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="أدخل اسمك الكامل هنا"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.length > 2) handleFormLead();
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white transition-all font-semibold"
                />
              </div>

              {/* Phone field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone size={15} className="text-emerald-600" />
                  <span>رقم الهاتف <strong className="text-red-500">*</strong></span>
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="مثال: 06XXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (e.target.value.length > 5) handleFormLead();
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm focus:bg-white transition-all font-mono font-semibold"
                  dir="ltr"
                />
              </div>

              {/* Product Color Selection inside Checkout Form */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80">
                  <label className="block text-xs font-black text-emerald-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Palette size={16} className="text-emerald-600" />
                      <span>اختر لون المنتج المفضّل: <strong className="text-red-500">*</strong></span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {selectedColor || product.colors[0].name}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.colors.map(col => {
                      const isSelected = selectedColor === col.name || (!selectedColor && col === product.colors![0]);
                      return (
                        <button
                          key={col.id || col.name}
                          type="button"
                          onClick={() => handleColorSelect(col.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/30'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner inline-block shrink-0" 
                            style={{ backgroundColor: col.hex || '#000' }} 
                          />
                          <span>{col.name}</span>
                          {isSelected && <Check size={13} className="text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Wilaya and Commune row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Wilaya select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={15} className="text-emerald-600" />
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
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={15} className="text-emerald-600" />
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
                <label className="block text-xs font-bold text-slate-800">نوع التوصيل</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShippingType('home')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      shippingType === 'home'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm ring-1 ring-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>توصيل للمنزل 🏠</span>
                    <span className="text-[10px] text-slate-500 font-normal">لباب بيتك (+{selectedWilaya.shippingHome} دج)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingType('desk')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      shippingType === 'desk'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm ring-1 ring-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>استلام من المكتب 🏢</span>
                    <span className="text-[10px] text-slate-500 font-normal">توفير وتكلفة أقل (+{selectedWilaya.shippingDesk} دج)</span>
                  </button>
                </div>
              </div>

              {/* Quantity and notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                {/* Quantity counter */}
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">الكمية المطلوبة</label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3.5 py-2.5 hover:bg-slate-200 text-slate-700 font-black transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-grow text-center font-extrabold text-sm">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-3.5 py-2.5 hover:bg-slate-200 text-slate-700 font-black transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">ملاحظات (مقاس، لون، وقت الاتصال)</label>
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

              {/* High pulsing checkout button directly underneath input fields */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:bg-slate-400 active:scale-[0.98] text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer relative overflow-hidden`}
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

              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] pt-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>جميع بياناتك الشخصية مشفرة ومحمية بخصوصية تامة</span>
              </div>

              {/* Pricing Invoice Summary directly at the bottom of the form */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 space-y-2.5 mt-4 border border-slate-800 shadow-inner">
                <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                  <span>سعر المنتج ({quantity} قطعة):</span>
                  <span className="font-bold text-white">{productPrice * quantity} دج</span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                  <span>
                    تكلفة الشحن لولاية <strong className="text-amber-300">({selectedWilaya.nameAr})</strong>:
                  </span>
                  <span className="font-bold text-white">
                    {shippingCost === 0 ? 'مجاني' : `${shippingCost} دج`}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="font-black text-sm text-amber-400">السعر الإجمالي للدفع عند الاستلام:</span>
                  <span className="font-black text-2xl text-amber-400">{totalPrice} دج</span>
                </div>
              </div>
            </form>

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

      {/* Floating CTA for Mobile Screens - Automatically hidden when order form is in view */}
      {!isFormInView && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-30 transition-all duration-300">
          <button 
            onClick={scrollToForm}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm py-3.5 rounded-full shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingCart size={18} />
            <span>أطلبي المنتج الآن والدفع عند الاستلام</span>
          </button>
        </div>
      )}

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
              <div className="bg-slate-50 rounded-2xl p-4 text-right space-y-2.5 text-xs border border-slate-100">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">رقم طلبك الفريد:</span>
                  <span className="font-bold text-slate-900 font-mono">{successOrder.id}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">الاسم الكامل:</span>
                  <span className="font-bold text-slate-900">{successOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">رقم الهاتف:</span>
                  <span className="font-bold text-slate-900 font-mono">{successOrder.phone}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">الولاية والبلدية:</span>
                  <span className="font-bold text-slate-900">{successOrder.wilayaName} - {successOrder.commune}</span>
                </div>
                {successOrder.selectedColor && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-slate-500">اللون المختار:</span>
                    <span className="font-extrabold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                      <span>🎨</span>
                      <span>{successOrder.selectedColor}</span>
                    </span>
                  </div>
                )}

                {/* Price Breakdown Details */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">سعر المنتج ({successOrder.quantity} قطعة):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {(successOrder.totalPrice - (successOrder.shippingPrice || 0))} دج
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500">تكلفة الشحن:</span>
                  <span className="font-bold text-slate-900">
                    {successOrder.shippingPrice === 0 ? 'مجاني' : `${successOrder.shippingPrice || 0} دج`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="font-extrabold text-emerald-900">السعر الإجمالي للدفع عند الاستلام:</span>
                  <span className="font-black text-lg text-emerald-700">{successOrder.totalPrice} دج</span>
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
