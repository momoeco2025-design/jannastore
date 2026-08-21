import React, { useState, useEffect } from 'react';
import { ProductData, Order, OrderStatus, Review, ProductFeature, ProductImage, ProductColor, Wilaya, TelegramSettings, StoreSettings } from '../types';
import { ALGERIAN_WILAYAS } from './WilayaData';
import { 
  Lock, LogOut, Settings, Plus, Minus, Star, Trash2, Edit2, Check,
  TrendingUp, Calendar, MapPin, Phone, User, Info, DollarSign,
  Search, Filter, Download, ShoppingCart, RefreshCw, Package, ArrowRight,
  Upload, Wand2, Truck, Send, Sparkles, ShoppingBag, Copy, RotateCcw,
  ChevronUp, ChevronDown, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  onClose: () => void;
  adminToken: string;
  onLogout: () => void;
}

export default function AdminPanel({ onClose, adminToken, onLogout }: AdminPanelProps) {
  // Tabs: 'orders' or 'product' or 'shipping' or 'telegram' or 'settings'
  const [activeTab, setActiveTab] = useState<'orders' | 'product' | 'shipping' | 'telegram' | 'settings'>('orders');

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [storeSaveSuccess, setStoreSaveSuccess] = useState(false);
  const [storeSaveError, setStoreSaveError] = useState('');

  // Editing fields for Store
  const [storeName, setStoreName] = useState('');
  const [storeSub, setStoreSub] = useState('');
  const [tickerItems, setTickerItems] = useState<string[]>([]);
  const [newTickerText, setNewTickerText] = useState('');

  // Telegram Settings State
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings | null>(null);
  const [telegramLoading, setTelegramLoading] = useState(true);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState(false);
  const [telegramSaveError, setTelegramSaveError] = useState('');

  // Telegram Test State
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestSuccess, setTelegramTestSuccess] = useState(false);
  const [telegramTestError, setTelegramTestError] = useState('');

  // Wilayas / Shipping Editing State
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [wilayasLoading, setWilayasLoading] = useState<boolean>(true);
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingSaveSuccess, setShippingSaveSuccess] = useState(false);
  const [shippingSaveError, setShippingSaveError] = useState('');
  const [shippingSearch, setShippingSearch] = useState('');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wilayaFilter, setWilayaFilter] = useState<string>('all');
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);

  // Product Editing State
  const [product, setProduct] = useState<ProductData | null>(null);
  const [productLoading, setProductLoading] = useState<boolean>(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productSaveSuccess, setProductSaveSuccess] = useState(false);
  const [productSaveError, setProductSaveError] = useState('');

  // Multi-Product management states
  const [products, setProducts] = useState<ProductData[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [isEditingProductMode, setIsEditingProductMode] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodSlug, setProdSlug] = useState('');
  const [prodCoverUrl, setProdCoverUrl] = useState('');
  const [prodLogoUrl, setProdLogoUrl] = useState('');
  const [prodPixelId, setProdPixelId] = useState('');

  // Marketing Integrations state
  const [marketingSubTab, setMarketingSubTab] = useState<'meta' | 'tiktok' | 'snapchat' | 'google_ads' | 'google_analytics' | 'pinterest'>('meta');
  const [testPixelLoading, setTestPixelLoading] = useState(false);
  const [testPixelMessage, setTestPixelMessage] = useState('');
  const [domainVerifyInput, setDomainVerifyInput] = useState('');
  const [domainVerifying, setDomainVerifying] = useState(false);

  const handleTestPixel = async () => {
    setTestPixelLoading(true);
    setTestPixelMessage('');
    try {
      const res = await fetch('/api/marketing/test-pixel', {
        method: 'POST',
        headers: { 'X-Admin-Token': adminToken }
      });
      const data = await res.json();
      if (res.ok) {
        setTestPixelMessage(data.message || '🟢 PageView يعمل بنجاح عبر CAPI!');
        const sRes = await fetch('/api/store-settings');
        if (sRes.ok) {
          const sData = await sRes.json();
          setStoreSettings(sData);
        }
      } else {
        setTestPixelMessage(data.error || '❌ فشل اختبار البيكسل.');
      }
    } catch (err) {
      setTestPixelMessage('❌ خطأ في الاتصال بالخادم.');
    } finally {
      setTestPixelLoading(false);
    }
  };

  const [testPurchaseLoading, setTestPurchaseLoading] = useState(false);
  const [retryQueueLoading, setRetryQueueLoading] = useState(false);
  const [newTickerInput, setNewTickerInput] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': adminToken
          },
          body: JSON.stringify({ imageBase64: base64String, fileName: file.name })
        });
        if (res.ok) {
          const data = await res.json();
          setStoreSettings(prev => prev ? { ...prev, logoUrl: data.url } : null);
        } else {
          console.warn('فشل رفع شعار المتجر.');
        }
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': adminToken
          },
          body: JSON.stringify({ imageBase64: base64String, fileName: file.name })
        });
        if (res.ok) {
          const data = await res.json();
          setStoreSettings(prev => prev ? { ...prev, coverUrl: data.url } : null);
        } else {
          console.warn('فشل رفع صورة الغلاف.');
        }
        setUploadingCover(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingCover(false);
    }
  };

  const handleAddTickerItem = () => {
    if (!newTickerInput.trim() || !storeSettings) return;
    const current = storeSettings.tickerItems || [];
    setStoreSettings({
      ...storeSettings,
      tickerItems: [...current, newTickerInput.trim()]
    });
    setNewTickerInput('');
  };

  const handleRemoveTickerItem = (index: number) => {
    if (!storeSettings) return;
    const current = storeSettings.tickerItems || [];
    setStoreSettings({
      ...storeSettings,
      tickerItems: current.filter((_, idx) => idx !== index)
    });
  };

  const handleAddPresetTickerItems = () => {
    if (!storeSettings) return;
    const presets = [
      "🔥 أفضل المنتجات بأسعار ممتازة وجد مناسبة في الجزائر!",
      "🚚 توصيل سريع وآمن لباب المنزل متوفر لـ 58 ولاية جزائرية!",
      "⭐ جودة ممتازة وخامات أصلية ممتازة مختارة ومضمونة 100% من متجرنا",
      "💵 الدفع عند الاستلام - افحصي سلعتك وتأكدي منها بحرية تامة قبل الدفع",
      "🔄 الضمان الذهبي: استبدال مجاني أو استرجاع الأموال سهل وسريع خلال 7 أيام",
      "💥 أسعار مناسبة وجد تنافسية مع تخفيضات حصرية كبرى تصل إلى 40%",
      "📞 خدمة زبائن متميزة متوفرة هاتفياً لتأكيد طلبياتكم والإجابة على أي استفسار"
    ];
    setStoreSettings({
      ...storeSettings,
      tickerItems: presets
    });
  };

  const handleProcessRetryQueue = async () => {
    setRetryQueueLoading(true);
    setTestPixelMessage('');
    try {
      const res = await fetch('/api/marketing/process-retry-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTestPixelMessage(`🔄 ${data.message}`);
        const sRes = await fetch('/api/store-settings');
        if (sRes.ok) {
          const sData = await sRes.json();
          setStoreSettings(sData);
        }
      } else {
        setTestPixelMessage(data.error || '❌ فشل معالجة قائمة الإعادة.');
      }
    } catch (err) {
      setTestPixelMessage('❌ خطأ في الاتصال بالخادم.');
    } finally {
      setRetryQueueLoading(false);
    }
  };

  const handleTestPurchase = async () => {
    setTestPurchaseLoading(true);
    setTestPixelMessage('');
    try {
      const res = await fetch('/api/marketing/test-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ value: 4100 })
      });
      const data = await res.json();
      if (res.ok) {
        setTestPixelMessage(data.message || '🛒 تم إرسال حدث Purchase تجريبي بنجاح!');
        const sRes = await fetch('/api/store-settings');
        if (sRes.ok) {
          const sData = await sRes.json();
          setStoreSettings(sData);
        }
      } else {
        setTestPixelMessage(data.error || '❌ فشل إرسال Purchase تجريبي.');
      }
    } catch (err) {
      setTestPixelMessage('❌ خطأ في الاتصال بالخادم.');
    } finally {
      setTestPurchaseLoading(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainVerifyInput.trim()) return;
    setDomainVerifying(true);
    try {
      const res = await fetch('/api/marketing/verify-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ domain: domainVerifyInput })
      });
      const data = await res.json();
      if (res.ok && data.storeSettings) {
        setStoreSettings(data.storeSettings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDomainVerifying(false);
    }
  };

  // Local state for editing product fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodOldPrice, setProdOldPrice] = useState(0);
  const [prodPromoText, setProdPromoText] = useState('');
  const [prodStockCount, setProdStockCount] = useState(0);
  const [prodUseFixedShipping, setProdUseFixedShipping] = useState<boolean>(false);
  const [prodFixedShippingHome, setProdFixedShippingHome] = useState<number>(500);
  const [prodFixedShippingDesk, setProdFixedShippingDesk] = useState<number>(400);

  // Images state inside editor
  const [prodImages, setProdImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Colors state inside editor
  const [prodColors, setProdColors] = useState<ProductColor[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorImageUrl, setNewColorImageUrl] = useState('');

  const PRESET_COLORS = [
    { name: 'أسود', hex: '#000000' },
    { name: 'بني', hex: '#6B3E26' },
    { name: 'بني هافان', hex: '#B86B27' },
    { name: 'أحمر', hex: '#C92A2A' },
    { name: 'أزرق ملكي', hex: '#1864AB' },
    { name: 'زيتي / كحلي', hex: '#2B8A3E' },
    { name: 'أبيض / كريمي', hex: '#F8F9FA' },
    { name: 'رمادي', hex: '#495057' },
    { name: 'وردي', hex: '#E64980' },
  ];

  const handleAddColor = (name?: string, hex?: string, imageUrl?: string) => {
    const cName = name || newColorName.trim();
    if (!cName) return;
    const cHex = hex || newColorHex;
    const cImg = imageUrl !== undefined ? imageUrl : newColorImageUrl;

    const newColor: ProductColor = {
      id: "col-" + Date.now() + Math.floor(Math.random() * 1000),
      name: cName,
      hex: cHex,
      imageUrl: cImg || undefined
    };

    setProdColors(prev => [...prev, newColor]);
    if (!name) {
      setNewColorName('');
      setNewColorImageUrl('');
    }
  };

  const handleDeleteColor = (colorId: string) => {
    setProdColors(prev => prev.filter(c => c.id !== colorId));
  };

  // Features state inside editor
  const [prodFeatures, setProdFeatures] = useState<ProductFeature[]>([]);

  // Reviews state inside editor
  const [prodReviews, setProdReviews] = useState<Review[]>([]);
  const [newRevName, setNewRevName] = useState('');
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevComment, setNewRevComment] = useState('');
  const [newRevWilaya, setNewRevWilaya] = useState('الجزائر');

  // Image upload from local computer states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // AI-Powered Content Generator states
  const [aiDescriptionPrompt, setAiDescriptionPrompt] = useState('');
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuccess, setAiSuccess] = useState(false);

  // Trigger loading
  useEffect(() => {
    fetchOrders();
    fetchProduct();
    fetchProducts();
    fetchWilayas();
    fetchTelegramSettings();
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      setStoreLoading(true);
      const res = await fetch('/api/store-settings');
      if (res.ok) {
        const data = await res.json() as StoreSettings;
        setStoreSettings(data);
        setStoreName(data.storeName || '');
        setStoreSub(data.storeSub || '');
        setTickerItems(data.tickerItems || []);
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
    } finally {
      setStoreLoading(false);
    }
  };

  const handleSaveStoreSettings = async () => {
    setSavingStore(true);
    setStoreSaveSuccess(false);
    setStoreSaveError('');
    try {
      const res = await fetch('/api/store-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({
          storeName,
          storeSub,
          tickerItems,
          socialLinks: storeSettings?.socialLinks,
          metaPixelId: storeSettings?.metaPixelId,
          metaAccessToken: storeSettings?.metaAccessToken,
          metaTestEventCode: storeSettings?.metaTestEventCode,
          domain: storeSettings?.domain
        })
      });
      if (res.ok) {
        setStoreSaveSuccess(true);
        setTimeout(() => setStoreSaveSuccess(false), 3000);
        const data = await res.json();
        if (data.storeSettings) {
          setStoreSettings(data.storeSettings);
        }
      } else {
        const err = await res.json();
        setStoreSaveError(err.error || 'فشل حفظ إعدادات المتجر.');
      }
    } catch (err) {
      setStoreSaveError('فشل الاتصال بالخادم لحفظ إعدادات المتجر.');
    } finally {
      setSavingStore(false);
    }
  };

  const fetchTelegramSettings = async () => {
    try {
      setTelegramLoading(true);
      const res = await fetch('/api/telegram-settings', {
        headers: { 'X-Admin-Token': adminToken }
      });
      if (res.ok) {
        const data = await res.json();
        setTelegramSettings(data);
      }
    } catch (err) {
      console.error('Error fetching telegram settings:', err);
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleSaveTelegramSettings = async () => {
    if (!telegramSettings) return;
    setSavingTelegram(true);
    setTelegramSaveSuccess(false);
    setTelegramSaveError('');
    try {
      const res = await fetch('/api/telegram-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify(telegramSettings)
      });
      if (res.ok) {
        setTelegramSaveSuccess(true);
        setTimeout(() => setTelegramSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        setTelegramSaveError(err.error || 'فشل حفظ الإعدادات.');
      }
    } catch (err) {
      setTelegramSaveError('فشل الاتصال بالخادم.');
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramSettings) return;
    setTestingTelegram(true);
    setTelegramTestSuccess(false);
    setTelegramTestError('');
    try {
      const res = await fetch('/api/telegram-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({
          botToken: telegramSettings.botToken,
          chatId: telegramSettings.chatId
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramTestSuccess(true);
        setTimeout(() => setTelegramTestSuccess(false), 5000);
      } else {
        setTelegramTestError(data.error || 'فشل إرسال رسالة الاختبار.');
      }
    } catch (err) {
      setTelegramTestError('فشل الاتصال بالخادم للتجربة.');
    } finally {
      setTestingTelegram(false);
    }
  };

  const fetchWilayas = async () => {
    try {
      setWilayasLoading(true);
      const res = await fetch('/api/wilayas');
      if (res.ok) {
        const data = await res.json();
        setWilayas(data);
      }
    } catch (err) {
      console.error('Error fetching wilayas:', err);
    } finally {
      setWilayasLoading(false);
    }
  };

  const handleSaveShippingPrices = async () => {
    setSavingShipping(true);
    setShippingSaveSuccess(false);
    setShippingSaveError('');
    try {
      const res = await fetch('/api/wilayas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify(wilayas)
      });
      if (res.ok) {
        setShippingSaveSuccess(true);
        setTimeout(() => setShippingSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        setShippingSaveError(err.error || 'فشل حفظ الأسعار الجديدة.');
      }
    } catch (err) {
      setShippingSaveError('فشل الاتصال بالخادم.');
    } finally {
      setSavingShipping(false);
    }
  };

  const handleResetShippingPrices = async () => {
    if (!window.confirm('هل أنت تأكد من إرجاع أسعار التوصيل إلى الأسعار الرسمية للـ 58 ولاية؟')) return;
    setSavingShipping(true);
    setShippingSaveSuccess(false);
    setShippingSaveError('');
    try {
      const res = await fetch('/api/wilayas/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        }
      });
      const data = await res.json();
      if (res.ok && data.wilayas) {
        setWilayas(data.wilayas);
        setShippingSaveSuccess(true);
        setTimeout(() => setShippingSaveSuccess(false), 3000);
      } else {
        setShippingSaveError(data.error || 'فشل استعادة الأسعار.');
      }
    } catch (err) {
      setShippingSaveError('فشل الاتصال بالخادم.');
    } finally {
      setSavingShipping(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders', {
        headers: { 'X-Admin-Token': adminToken }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setProductLoading(true);
      const res = await fetch('/api/product');
      if (res.ok) {
        const data: ProductData = await res.json();
        setProduct(data);
        if (!editingProductId) {
          setProdTitle(data.title);
          setProdSlug(data.slug || 'hairstyler');
          setProdSubtitle(data.subtitle);
          setProdDescription(data.description);
          setProdPrice(data.price);
          setProdOldPrice(data.oldPrice);
          setProdPromoText(data.promoText);
          setProdStockCount(data.stockCount);
          setProdUseFixedShipping(data.useFixedShipping || false);
          setProdFixedShippingHome(data.fixedShippingHome ?? 500);
          setProdFixedShippingDesk(data.fixedShippingDesk ?? 400);
          setProdImages(data.images || []);
          setProdColors(data.colors || []);
          setProdFeatures(data.features || []);
          setProdReviews(data.reviews || []);
        }
      }
    } catch (err) {
      console.error('Error fetching product data:', err);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products list:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleStartEditProduct = (p: ProductData) => {
    setEditingProductId(p.id || null);
    setProdSlug(p.slug || '');
    setProdCoverUrl(p.coverUrl || '');
    setProdLogoUrl(p.logoUrl || '');
    setProdPixelId(p.pixelId || '');
    setProdTitle(p.title);
    setProdSubtitle(p.subtitle);
    setProdDescription(p.description);
    setProdPrice(p.price);
    setProdOldPrice(p.oldPrice);
    setProdPromoText(p.promoText);
    setProdStockCount(p.stockCount);
    setProdUseFixedShipping(p.useFixedShipping || false);
    setProdFixedShippingHome(p.fixedShippingHome ?? 500);
    setProdFixedShippingDesk(p.fixedShippingDesk ?? 400);
    setProdImages(p.images || []);
    setProdColors(p.colors || []);
    setProdFeatures(p.features || []);
    setProdReviews(p.reviews || []);
    setIsEditingProductMode(true);
  };

  const handleStartAddProduct = () => {
    setEditingProductId(null);
    setProdSlug('');
    setProdCoverUrl('');
    setProdLogoUrl('');
    setProdPixelId('');
    setProdTitle('');
    setProdSubtitle('');
    setProdDescription('');
    setProdPrice(0);
    setProdOldPrice(0);
    setProdPromoText('');
    setProdStockCount(10);
    setProdUseFixedShipping(false);
    setProdFixedShippingHome(500);
    setProdFixedShippingDesk(400);
    setProdImages([]);
    setProdColors([]);
    setProdFeatures([
      { id: "f1", title: "ميزة 1", description: "شرح الميزة بالتفصيل", icon: "Sparkles" },
      { id: "f2", title: "ميزة 2", description: "شرح الميزة بالتفصيل", icon: "Layers" },
      { id: "f3", title: "ميزة 3", description: "شرح الميزة بالتفصيل", icon: "ShieldCheck" },
      { id: "f4", title: "ميزة 4", description: "شرح الميزة بالتفصيل", icon: "Wind" }
    ]);
    setProdReviews([]);
    setIsEditingProductMode(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': adminToken
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
        setProductToDeleteId(null);
        fetchProducts();
      } else {
        const errData = await res.json();
        console.error(errData.error || 'فشل حذف المنتج.');
      }
    } catch (err) {
      console.error('حدث خطأ أثناء الاتصال بالخادم لحذف المنتج.');
    }
  };

  const handleSetDefaultProduct = async (slug: string) => {
    try {
      const res = await fetch('/api/products/set-default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ slug })
      });
      if (res.ok) {
        console.log('تم تعيين الصفحة كصفحة رئيسية بنجاح!');
        fetchProducts();
        fetchProduct();
      } else {
        const err = await res.json();
        console.warn(err.error || 'فشل تعيين الصفحة كصفحة رئيسية.');
      }
    } catch (err) {
      console.error('فشل الاتصال بالخادم.');
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
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ productIds })
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const err = await res.json();
        console.warn(err.error || 'فشل تغيير ترتيب المنتجات.');
        fetchProducts();
      }
    } catch (err) {
      console.error('فشل الاتصال بالخادم.');
      fetchProducts();
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        const errData = await res.json();
        console.warn(errData.error || 'حدث خطأ ما');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': adminToken }
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setOrderToDeleteId(null);
      } else {
        const errData = await res.json();
        console.warn(errData.error || 'حدث خطأ ما');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  // Image Management
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const newImg: ProductImage = {
      id: "img-" + Date.now(),
      url: newImageUrl,
      isMain: prodImages.length === 0
    };
    setProdImages([...prodImages, newImg]);
    setNewImageUrl('');
  };

  const handleDeleteImage = (imgId: string) => {
    const updated = prodImages.filter(img => img.id !== imgId);
    // If we deleted the main image, set first of remaining as main
    if (prodImages.find(img => img.id === imgId)?.isMain && updated.length > 0) {
      updated[0].isMain = true;
    }
    setProdImages(updated);
  };

  const handleSetMainImage = (imgId: string) => {
    setProdImages(prodImages.map(img => ({
      ...img,
      isMain: img.id === imgId
    })));
  };

  // Feature editing helper
  const handleFeatureChange = (index: number, key: keyof ProductFeature, value: string) => {
    const updated = [...prodFeatures];
    updated[index] = { ...updated[index], [key]: value };
    setProdFeatures(updated);
  };

  // Review Management
  const handleAddReview = () => {
    if (!newRevName.trim() || !newRevComment.trim()) {
      return;
    }
    const newRev: Review = {
      id: "rev-" + Date.now(),
      name: newRevName,
      rating: newRevRating,
      comment: newRevComment,
      date: new Date().toISOString().split('T')[0],
      wilaya: newRevWilaya
    };
    setProdReviews([newRev, ...prodReviews]);
    setNewRevName('');
    setNewRevComment('');
    setNewRevRating(5);
  };

  const handleDeleteReview = (revId: string) => {
    setProdReviews(prodReviews.filter(r => r.id !== revId));
  };

  // Image upload handler from computer
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت.');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Token': adminToken
            },
            body: JSON.stringify({
              imageBase64: base64String,
              fileName: file.name
            })
          });

          if (res.ok) {
            const data = await res.json();
            const newImg: ProductImage = {
              id: "img-" + Date.now(),
              url: data.url,
              isMain: prodImages.length === 0
            };
            setProdImages(prev => [...prev, newImg]);
          } else {
            const errData = await res.json();
            setUploadError(errData.error || 'فشل رفع الصورة المرفوعة.');
          }
        } catch (err) {
          setUploadError('حدث خطأ أثناء رفع الصورة إلى الخادم.');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.onerror = () => {
        setUploadError('فشل قراءة ملف الصورة من جهازك.');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('فشل في معالجة الملف المختار.');
      setUploadingImage(false);
    }
  };

  // AI-powered product generation
  const handleGenerateProductWithAI = async () => {
    if (!aiDescriptionPrompt.trim()) {
      setAiError('يرجى كتابة وصف أولي أو تفاصيل عن المنتج للذكاء الاصطناعي أولاً.');
      return;
    }

    setGeneratingWithAI(true);
    setAiError('');
    setAiSuccess(false);

    try {
      const res = await fetch('/api/generate-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify({ rawDescription: aiDescriptionPrompt })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Populate inputs
        if (data.title) setProdTitle(data.title);
        if (data.subtitle) setProdSubtitle(data.subtitle);
        if (data.description) setProdDescription(data.description);
        if (data.price) setProdPrice(Number(data.price));
        if (data.oldPrice) setProdOldPrice(Number(data.oldPrice));
        if (data.promoText) setProdPromoText(data.promoText);
        if (data.features && data.features.length > 0) setProdFeatures(data.features);
        if (data.reviews && data.reviews.length > 0) setProdReviews(data.reviews);
        
        setAiSuccess(true);
        setAiDescriptionPrompt('');
        setTimeout(() => setAiSuccess(false), 5000);
      } else {
        const errData = await res.json();
        setAiError(errData.error || 'فشل توليد محتوى بالذكاء الاصطناعي.');
      }
    } catch (err) {
      setAiError('فشل الاتصال بالخادم، يرجى التحقق من إعداد مفتاح GEMINI_API_KEY.');
    } finally {
      setGeneratingWithAI(false);
    }
  };

  // Save modified product landing page content to API
  const handleSaveProduct = async () => {
    setSavingProduct(true);
    setProductSaveSuccess(false);
    setProductSaveError('');

    if (!prodTitle.trim()) {
      setProductSaveError('يرجى إدخال اسم المنتج');
      setSavingProduct(false);
      return;
    }

    let formattedSlug = prodSlug.trim();
    if (!formattedSlug) {
      // Auto-generate a 4-digit number based on the number of products
      const count = products.length + 1;
      formattedSlug = String(count).padStart(4, '0');
      
      let tempSlug = formattedSlug;
      let counter = count;
      while(products.some(p => p.slug === tempSlug)) {
        counter++;
        tempSlug = String(counter).padStart(4, '0');
      }
      formattedSlug = tempSlug;
    } else {
      formattedSlug = formattedSlug.toLowerCase().replace(/[^a-z0-9-_\u0600-\u06FF]/g, '-').replace(/-+/g, '-');
    }

    const updatedProduct: ProductData = {
      id: editingProductId || undefined,
      slug: formattedSlug,
      title: prodTitle,
      subtitle: prodSubtitle,
      description: prodDescription,
      price: Number(prodPrice),
      oldPrice: Number(prodOldPrice),
      promoText: prodPromoText,
      stockCount: Number(prodStockCount),
      useFixedShipping: prodUseFixedShipping,
      fixedShippingHome: Number(prodFixedShippingHome),
      fixedShippingDesk: Number(prodFixedShippingDesk),
      coverUrl: prodCoverUrl,
      logoUrl: prodLogoUrl,
      pixelId: prodPixelId.trim() || undefined,
      images: prodImages,
      colors: prodColors,
      features: prodFeatures,
      reviews: prodReviews
    };

    try {
      // Save Store settings in background safely without throwing
      try {
        await fetch('/api/store-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': adminToken
          },
          body: JSON.stringify({
            storeName,
            storeSub,
            tickerItems
          })
        });
      } catch (e) {
        console.warn('Could not save store settings in background:', e);
      }

      // Then save the product
      const res = await fetch('/api/products/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken
        },
        body: JSON.stringify(updatedProduct)
      });

      if (res.ok) {
        setProductSaveSuccess(true);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
        setTimeout(() => {
          setProductSaveSuccess(false);
          setIsEditingProductMode(false);
          setEditingProductId(null);
        }, 1500);
        fetchProducts();
        fetchProduct();
        fetchStoreSettings();
      } else {
        const errData = await res.json();
        const msg = errData.error || 'حدث خطأ في الحفظ.';
        setProductSaveError(msg);
        alert(`⚠️ ${msg}`);
      }
    } catch (err: any) {
      console.error('Save product error:', err);
      const msg = 'فشل الاتصال بالخادم، يرجى المحاولة لاحقاً.';
      setProductSaveError(msg);
      alert(`⚠️ ${msg}`);
    } finally {
      setSavingProduct(false);
    }
  };



  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('لا توجد طلبات لتصديرها.');
      return;
    }

    // Algerian formatting Arabic columns
    const headers = [
      'ID الطلب', 'اسم الزبون', 'رقم الهاتف', 'الولاية', 'البلدية', 
      'الكمية', 'التوصيل', 'السعر الإجمالي (دج)', 'ملاحظات', 'تاريخ الطلب', 'الحالة'
    ];

    const rows = orders.map(o => [
      o.id,
      o.customerName,
      o.phone,
      o.wilayaName,
      o.commune,
      o.quantity,
      o.shippingPrice === 0 ? 'مجاني' : `${o.shippingPrice} دج`,
      o.totalPrice,
      o.notes || '',
      o.createdAt.substring(0, 10),
      o.status === 'pending' ? 'قيد الانتظار' : o.status === 'confirmed' ? 'مؤكد' : o.status === 'shipped' ? 'تم الشحن' : 'ملغي'
    ]);

    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `طلبات_المتجر_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering & searching orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.phone.includes(searchQuery) || 
      o.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesWilaya = wilayaFilter === 'all' || o.wilayaName === wilayaFilter;

    return matchesSearch && matchesStatus && matchesWilaya;
  });

  // Simple statistics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const confirmedOrdersCount = orders.filter(o => o.status === 'confirmed').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'shipped').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  const totalEstimatedRevenue = orders
    .filter(o => o.status === 'confirmed' || o.status === 'shipped')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col" dir="rtl">
      
      {/* Top Banner Dashboard Header */}
      <header className="bg-slate-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl">
              <Settings size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black">لوحة تحكم المدير المحترفة 🔐</h1>
              <p className="text-xs text-slate-400">إدارة مبيعات وتعديل محتوى صفحة الهبوط الجزائرية</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <ArrowRight size={16} />
              <span>معاينة صفحة الهبوط</span>
            </button>
            <button
              onClick={onLogout}
              className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-sm px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <LogOut size={16} />
              <span>خروج</span>
            </button>
          </div>

        </div>
      </header>

      {/* Stats Cards Section */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Total Estimated Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm col-span-2 md:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">المداخيل المؤكدة</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-emerald-600">{totalEstimatedRevenue} دج</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">للطلبات المؤكدة والمشحونة</span>
          </div>
        </div>

        {/* Total Orders count */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">إجمالي الطلبات</span>
            <ShoppingCart size={16} className="text-blue-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-slate-900">{totalOrdersCount} طلب</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">المستلمة عبر الاستمارة</span>
          </div>
        </div>

        {/* Pending Orders Count */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">قيد الانتظار</span>
            <RefreshCw size={16} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-amber-600">{pendingOrdersCount} طلب</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">بانتظار التأكيد الهاتفي</span>
          </div>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">تم تأكيدها</span>
            <Check size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-emerald-700">{confirmedOrdersCount} طلب</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">جاهزة للتغليف والشحن</span>
          </div>
        </div>

        {/* Shipped/Delivered */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">تم شحنها</span>
            <Package size={16} className="text-purple-600" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-purple-700">{shippedOrdersCount} طلب</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">عند شركة التوصيل</span>
          </div>
        </div>

      </section>

      {/* Tabs Selector Navigation */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-sm gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart size={16} />
            <span>إدارة الطلبات الواردة ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'product'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings size={16} />
            <span>تعديل المتجر و صفحة الهبوط 📝</span>
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'shipping'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Truck size={16} />
            <span>أسعار شحن الولايات 🚚</span>
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'telegram'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Send size={16} />
            <span>ربط تيليغرام 🤖</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings size={16} />
            <span>إعدادات المتجر ⚙️</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        
        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Search, Filter, Export Panel */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Search */}
              <div className="md:col-span-4 relative">
                <input
                  type="text"
                  placeholder="ابحث باسم الزبون، الهاتف، أو المعرف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
                <Search size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
              </div>

              {/* Status Filter */}
              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="all">كل الحالات المعروضة</option>
                  <option value="pending">⏳ قيد الانتظار</option>
                  <option value="confirmed">📞 مؤكد (مقبول)</option>
                  <option value="shipped">🚚 تم الشحن (خارج للتوصيل)</option>
                  <option value="cancelled">❌ ملغي</option>
                </select>
              </div>

              {/* Wilaya Filter */}
              <div className="md:col-span-3">
                <select
                  value={wilayaFilter}
                  onChange={(e) => setWilayaFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="all">كل ولايات الجزائر</option>
                  {ALGERIAN_WILAYAS.map(w => (
                    <option key={w.num} value={w.nameAr}>{w.nameAr}</option>
                  ))}
                </select>
              </div>

              {/* CSV Export Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleExportCSV}
                  className="w-full bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>تصدير ملف Excel</span>
                </button>
              </div>

            </div>

            {/* Orders Table view */}
            {ordersLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-sm">جاري جلب الطلبات من قاعدة البيانات...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                <ShoppingCart size={48} className="mx-auto text-slate-300" />
                <p className="mt-4 text-sm font-bold">لا توجد طلبات تطابق معايير البحث والفرز حالياً.</p>
                <p className="text-xs text-slate-400 mt-1">تأكد من تجربة الاستمارة في الأسفل لإنشاء طلبات تجريبية.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-3.5">معرف الطلب</th>
                        <th className="px-4 py-3.5">الزبون والهاتف</th>
                        <th className="px-4 py-3.5">الموقع (الولاية/البلدية)</th>
                        <th className="px-4 py-3.5">التفاصيل والكمية</th>
                        <th className="px-4 py-3.5">الفاتورة الإجمالية</th>
                        <th className="px-4 py-3.5">ملاحظات الزبون</th>
                        <th className="px-4 py-3.5 text-center">تغيير الحالة</th>
                        <th className="px-4 py-3.5 text-center">خيارات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          
                          {/* Order ID & Date */}
                          <td className="px-4 py-4">
                            <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {new Date(order.createdAt).toLocaleString('ar-DZ', { hour12: false })}
                            </span>
                          </td>

                          {/* Customer Name & Phone */}
                          <td className="px-4 py-4">
                            <span className="font-extrabold text-slate-900 block">{order.customerName}</span>
                            <a 
                              href={`tel:${order.phone}`} 
                              className="text-emerald-600 font-mono font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <Phone size={10} />
                              <span>{order.phone}</span>
                            </a>
                          </td>

                          {/* Wilaya & Commune */}
                          <td className="px-4 py-4">
                            <span className="font-bold text-slate-800 block">{order.wilayaName}</span>
                            <span className="text-slate-500 block mt-0.5">{order.commune}</span>
                          </td>

                          {/* Quantity & Item details */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              {order.productName && (
                                <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]" title={order.productName}>
                                  {order.productName}
                                </span>
                              )}
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                                  {order.quantity} قطعة
                                </span>
                                {order.selectedColor && (
                                  <span className="bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-lg border border-amber-200 text-[11px] flex items-center gap-1">
                                    <span>🎨</span>
                                    <span>{order.selectedColor}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Total Price bill */}
                          <td className="px-4 py-4 font-bold text-emerald-600">
                            <span className="text-sm">{order.totalPrice} دج</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              (شحن: {order.shippingPrice === 0 ? 'مجاني' : `${order.shippingPrice} دج`})
                            </span>
                          </td>

                          {/* Notes */}
                          <td className="px-4 py-4 text-slate-500 italic max-w-xs truncate">
                            {order.notes || <span className="text-slate-300">-</span>}
                          </td>

                          {/* Status changer buttons */}
                          <td className="px-4 py-4 text-center">
                            <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                                title="قيد الانتظار"
                                className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                  order.status === 'pending'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'text-amber-600 hover:bg-slate-200'
                                }`}
                              >
                                انتظار
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                                title="مؤكد"
                                className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                  order.status === 'confirmed'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-emerald-700 hover:bg-slate-200'
                                }`}
                              >
                                مؤكد
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                title="تم الشحن"
                                className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                  order.status === 'shipped'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'text-purple-700 hover:bg-slate-200'
                                }`}
                              >
                                مشحون
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                title="ملغي"
                                className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                  order.status === 'cancelled'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-red-700 hover:bg-slate-200'
                                }`}
                              >
                                ملغي
                              </button>
                            </div>
                          </td>

                          {/* Delete buttons */}
                          <td className="px-4 py-4 text-center">
                            {orderToDeleteId === order.id ? (
                              <div className="flex items-center justify-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-100 animate-pulse">
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer whitespace-nowrap"
                                >
                                  تأكيد حذف 🗑️
                                </button>
                                <button
                                  onClick={() => setOrderToDeleteId(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer"
                                >
                                  تراجع
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setOrderToDeleteId(order.id)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                                title="حذف الطلب"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Edit Landing Page content */}
        {activeTab === 'product' && (
          <div className="space-y-6">
            
            {!isEditingProductMode ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="text-right">
                    <h3 className="text-lg font-black text-slate-900">إدارة صفحات الهبوط المتعددة 📁</h3>
                    <p className="text-xs text-slate-500">قم بإنشاء وتعديل صفحات هبوط مختلفة لكل منتج بروابط مستقلة ومباشرة.</p>
                  </div>
                  <button
                    onClick={handleStartAddProduct}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 self-start cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>إضافة صفحة هبوط ومنتج جديد ✨</span>
                  </button>
                </div>

                {productsLoading ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-sm font-semibold">جاري تحميل صفحات الهبوط...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <Package className="mx-auto text-slate-400 mb-2 animate-bounce" size={40} />
                    <p className="text-sm font-bold text-slate-700">لا توجد صفحات هبوط حالياً</p>
                    <p className="text-xs text-slate-400 mt-1">اضغط على الزر في الأعلى لإضافة صفحتك الأولى!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                    <table className="w-full text-sm text-right text-slate-500" dir="rtl">
                      <thead className="text-xs text-slate-700 bg-slate-50 font-black">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-center">ترتيب العرض ⬆️⬇️</th>
                          <th scope="col" className="px-6 py-4 text-right">المنتج والصفحة</th>
                          <th scope="col" className="px-6 py-4 text-center">رابط صفحة الهبوط</th>
                          <th scope="col" className="px-6 py-4 text-center">الصفحة الرئيسية 🏠</th>
                          <th scope="col" className="px-6 py-4 text-center">السعر الحالي</th>
                          <th scope="col" className="px-6 py-4 text-center">إحصائيات المبيعات والزيارات 📊</th>
                          <th scope="col" className="px-6 py-4 text-center">ميزات/صور/آراء</th>
                          <th scope="col" className="px-6 py-4 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {products.map((p, index) => (
                          <tr key={p.id || p.slug} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveProduct(index, 'up')}
                                  disabled={index === 0}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 font-bold transition-all cursor-pointer"
                                  title="رفع المنتج للأعلى"
                                >
                                  <ChevronUp size={16} />
                                </button>
                                <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md min-w-[24px] text-center">{index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleMoveProduct(index, 'down')}
                                  disabled={index === products.length - 1}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 font-bold transition-all cursor-pointer"
                                  title="إنزال المنتج للأسفل"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center gap-3">
                                {p.images && p.images.find(img => img.isMain) ? (
                                  <img 
                                    src={p.images.find(img => img.isMain)?.url} 
                                    alt={p.title} 
                                    className="w-12 h-12 object-cover rounded-xl border border-slate-100"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                                    📦
                                  </div>
                                )}
                                <div>
                                  <div className="font-extrabold text-slate-900 text-sm">{p.title}</div>
                                  <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{p.subtitle}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center" dir="ltr">
                              <div className="flex flex-col items-center gap-2">
                                <a 
                                  href={`/${p.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold text-xs inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50 transition-all cursor-pointer"
                                >
                                  <span>/{p.slug}</span>
                                  <Wand2 size={12} className="rotate-45" />
                                </a>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const fullUrl = `${window.location.origin}/${p.slug}`;
                                    navigator.clipboard.writeText(fullUrl);
                                    alert('تم نسخ الرابط بنجاح!\n' + fullUrl);
                                  }}
                                  className="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <Copy size={12} />
                                  <span>نسخ الرابط للمنصات (Sponsor)</span>
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {(p as any).isDefault ? (
                                <span className="bg-emerald-600 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-sm shadow-emerald-100 inline-flex items-center gap-1">
                                  <span>🟢 نشطة حالياً</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultProduct(p.slug)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] px-3 py-1.5 rounded-full transition-all border border-slate-200 cursor-pointer inline-flex items-center gap-1"
                                >
                                  <span>🏠 تعيين كرئيسية</span>
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-extrabold text-slate-900 text-xs bg-slate-100 px-2.5 py-1.5 rounded-lg">{p.price} دج</span>
                              {p.oldPrice > 0 && (
                                <span className="text-slate-400 text-[10px] line-through block mt-1">{p.oldPrice} دج</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-700">
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded" title="Page Views">👁️ {p.pageViews || 0} زائر</span>
                                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded" title="View Content">🎯 {p.viewContentCount || 0} مشاهدة</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded" title="Initiate Checkout">🛒 {p.initiateCheckoutCount || 0} طلب مبدئي</span>
                                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded" title="Purchase">💰 {p.purchaseCount || 0} مبيعة</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-extrabold mt-1">CR: {p.pageViews && p.pageViews > 0 ? (((p.purchaseCount || 0) / p.pageViews) * 100).toFixed(1) : '0.0'}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500">
                                <span className="bg-slate-50 px-2 py-1 rounded-md">⭐ {p.reviews?.length || 0} آراء</span>
                                <span className="bg-slate-50 px-2 py-1 rounded-md">✨ {p.features?.length || 0} مميزات</span>
                                <span className="bg-slate-50 px-2 py-1 rounded-md">🖼️ {p.images?.length || 0} صور</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleStartEditProduct(p)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs px-3 py-2 rounded-lg transition-colors border border-emerald-100/50 cursor-pointer flex items-center gap-1"
                                >
                                  <Edit2 size={12} />
                                  <span>تعديل</span>
                                </button>
                                {productToDeleteId === (p.id || p.slug) ? (
                                  <div className="flex items-center justify-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-100 animate-pulse">
                                    <button
                                      onClick={() => handleDeleteProduct(p.id || p.slug || "")}
                                      className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer whitespace-nowrap"
                                    >
                                      تأكيد الحذف
                                    </button>
                                    <button
                                      onClick={() => setProductToDeleteId(null)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-1 rounded-lg text-[10px] transition-all cursor-pointer whitespace-nowrap"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setProductToDeleteId(p.id || p.slug || "")}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs px-3 py-2 rounded-lg transition-colors border border-red-100/50 cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 size={12} />
                                    <span>حذف</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-8">
                
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProductMode(false);
                        setEditingProductId(null);
                      }}
                      className="text-slate-500 hover:text-slate-800 font-bold text-xs inline-flex items-center gap-1 mb-2 transition-colors cursor-pointer"
                    >
                      <span>← العودة لجميع صفحات الهبوط</span>
                    </button>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingProductId ? 'تعديل صفحة الهبوط والمنتج 📝' : 'إنشاء صفحة هبوط ومنتج جديد ✨'}
                    </h3>
                    <p className="text-xs text-slate-500">قم بتغيير أي حقل لتغيير شكل ومحتوى صفحة الهبوط فوراً</p>
                  </div>
                  <button
                    onClick={handleSaveProduct}
                    disabled={savingProduct}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-2 cursor-pointer"
                  >
                    {savingProduct ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    <span>حفظ التعديلات ونشرها</span>
                  </button>
                </div>

            {/* Feedback messages */}
            {productSaveSuccess && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-sm font-bold text-center animate-pulse">
                🎉 تم حفظ التعديلات ونشرها بنجاح! سيراها جميع عملائك في الجزائر الآن.
              </div>
            )}
            {productSaveError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-bold text-center">
                ⚠️ خطأ في الحفظ: {productSaveError}
              </div>
            )}

            {productLoading ? (
              <div className="text-center py-8 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-sm">جاري جلب تفاصيل المنتج...</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 🛍️ Section 1: Store Branding & Settings */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner space-y-6 text-right" dir="rtl">
                  <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
                    <div className="bg-emerald-600 text-white p-2 rounded-xl">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">أولاً: معلومات وهوية المتجر العامة 🛍️</h4>
                      <p className="text-[10px] text-slate-500">هذه المعلومات تظهر على كامل المتجر وشريط الأخبار العلوية.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">اسم المتجر 🛍️</label>
                      <input 
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="مثال: جنة ستور | Janna Store"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">الوصف أو السطر الفرعي ℹ️</label>
                      <input 
                        type="text"
                        value={storeSub}
                        onChange={(e) => setStoreSub(e.target.value)}
                        placeholder="مثال: متجركم المفضل للتسوق الإلكتروني في الجزائر"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Ticker settings in editor */}
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <label className="text-xs font-bold text-slate-700 block">جمل الشريط الإعلاني المتحرك (توصيل مجاني، عروض خاصة...) 📢</label>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newTickerText}
                        onChange={(e) => setNewTickerText(e.target.value)}
                        placeholder="مثال: 🚚 توصيل متاح لجميع الولايات خلال 48 ساعة"
                        className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newTickerText.trim()) return;
                          setTickerItems([...tickerItems, newTickerText.trim()]);
                          setNewTickerText('');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer"
                      >
                        إضافة
                      </button>
                    </div>

                    <div className="space-y-1.5 mt-2 max-h-[150px] overflow-y-auto pr-1">
                      {tickerItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 gap-2 transition-all">
                          <span className="text-[11px] font-semibold text-slate-700 leading-relaxed text-right flex-grow">{item}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setTickerItems(tickerItems.filter((_, idx) => idx !== index));
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="حذف"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-200 my-6"></div>

                <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-right" dir="rtl">
                  <div className="bg-emerald-600 text-white p-2 rounded-xl">
                    <Settings size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900">ثانياً: تفاصيل ومحتوى صفحة الهبوط والمنتج 📝</h4>
                    <p className="text-[10px] text-slate-500">هذه التفاصيل خاصة بالمنتج وصفحة الهبوط المستقلة.</p>
                  </div>
                </div>

                {/* AI-Powered Smart Generator Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-2xl border border-emerald-200/60 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-sm mt-0.5">
                      <Wand2 size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm text-slate-900">توليد المحتوى بـالذكاء الاصطناعي (Gemini AI) ✨</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        اكتب وصفاً بسيطاً أو تفاصيل سريعة لمنتجك (مثال: ساعة ذكية رياضية مقاومة للماء مع شاشة Amoled وبطارية تدوم 10 أيام، سعرها 6500 دج والقديم 9800 دج)، وسيقوم الذكاء الاصطناعي بكتابة وتعبئة العناوين والوصف التسويقي، والمميزات الـ 4، وحتى مراجعات واقعية لزبائن جزائريين بالدارجة الجزائرية تلقائياً!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      placeholder="أدخل اسماً أو وصفاً بسيطاً للمنتج هنا..."
                      rows={3}
                      value={aiDescriptionPrompt}
                      onChange={(e) => setAiDescriptionPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-sm"
                      disabled={generatingWithAI}
                    />
                    
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <button
                        type="button"
                        onClick={handleGenerateProductWithAI}
                        disabled={generatingWithAI || !aiDescriptionPrompt.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-2"
                      >
                        {generatingWithAI ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>جاري توليد محتوى صفحة الهبوط بالذكاء الاصطناعي...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 size={14} />
                            <span>توليد وتعبئة الصفحة تلقائياً ✨</span>
                          </>
                        )}
                      </button>

                      {aiSuccess && (
                        <span className="text-emerald-700 font-bold text-xs bg-emerald-100/60 px-3 py-1.5 rounded-lg border border-emerald-200/50">
                          🎉 تم توليد المحتوى وتعبئة الحقول بنجاح! راجعها وقم بحفظ التغييرات في الأسفل.
                        </span>
                      )}

                      {aiError && (
                        <span className="text-red-600 font-bold text-xs bg-red-100/60 px-3 py-1.5 rounded-lg border border-red-200/50">
                          ⚠️ خطأ: {aiError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                 {/* Product Logo Editor */}
                 <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-right" dir="rtl">
                   <label className="text-xs font-black text-slate-900 block">شعار المتجر الخاص بهذا المنتج (Logo) 🖼️</label>
                   <p className="text-[10px] text-slate-500">كل صفحة هبوط يمكنها أن تحتفظ بشعار (Logo) خاص بها ومستقل عن باقي المنتجات.</p>
                   
                   {prodLogoUrl && (
                     <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center border border-slate-200 flex-shrink-0">
                       <img src={prodLogoUrl} alt="Product Logo Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                   )}

                   <div className="flex gap-2 items-center">
                     <input 
                       type="text"
                       value={prodLogoUrl}
                       onChange={(e) => setProdLogoUrl(e.target.value)}
                       placeholder="رابط صورة الشعار المباشر (أو ارفع صورة من حاسوبك)"
                       className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-left"
                       dir="ltr"
                     />
                     <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 shrink-0">
                       <Upload size={14} />
                       <span>رفع من الحاسوب 💻</span>
                       <input 
                         type="file" 
                         accept="image/*" 
                         onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (!file) return;
                           if (file.size > 5 * 1024 * 1024) {
                             alert('حجم الصورة كبير جداً (أقل من 5 ميغابايت).');
                             return;
                           }
                           const reader = new FileReader();
                           reader.onloadend = async () => {
                             const base64 = reader.result as string;
                             const res = await fetch('/api/upload', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
                               body: JSON.stringify({ imageBase64: base64, fileName: file.name })
                             });
                             if (res.ok) {
                               const data = await res.json();
                               setProdLogoUrl(data.url);
                             } else {
                               alert('فشل رفع الصورة.');
                             }
                           };
                           reader.readAsDataURL(file);
                         }}
                         className="hidden" 
                       />
                     </label>
                     {prodLogoUrl && (
                       <button
                         type="button"
                         onClick={() => setProdLogoUrl('')}
                         className="text-red-600 hover:text-red-700 font-bold text-xs px-2"
                       >
                         مسح
                       </button>
                     )}
                   </div>
                 </div>

                 {/* Product Cover Banner Editor */}
                 <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-right" dir="rtl">
                   <label className="text-xs font-black text-slate-900 block">صورة غلاف صفحة الهبوط الخاصة بهذا المنتج (Cover Banner) 🖼️</label>
                   <p className="text-[10px] text-slate-500">كل صفحة هبوط يمكنها أن تحتفظ بغلاف (Cover) خاص بها ومستقل عن باقي المنتجات.</p>
                   
                   {prodCoverUrl && (
                     <div className="w-full h-28 rounded-xl bg-slate-50 overflow-hidden border border-slate-200 relative">
                       <img src={prodCoverUrl} alt="Product Cover Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                   )}

                   <div className="flex gap-2 items-center">
                     <input 
                       type="text"
                       value={prodCoverUrl}
                       onChange={(e) => setProdCoverUrl(e.target.value)}
                       placeholder="رابط صورة الغلاف المباشر (أو ارفع صورة من حاسوبك)"
                       className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-left"
                       dir="ltr"
                     />
                     <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 shrink-0">
                       <Upload size={14} />
                       <span>رفع من الحاسوب 💻</span>
                       <input 
                         type="file" 
                         accept="image/*" 
                         onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (!file) return;
                           if (file.size > 5 * 1024 * 1024) {
                             alert('حجم الصورة كبير جداً (أقل من 5 ميغابايت).');
                             return;
                           }
                           const reader = new FileReader();
                           reader.onloadend = async () => {
                             const base64 = reader.result as string;
                             const res = await fetch('/api/upload', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
                               body: JSON.stringify({ imageBase64: base64, fileName: file.name })
                             });
                             if (res.ok) {
                               const data = await res.json();
                               setProdCoverUrl(data.url);
                             } else {
                               alert('فشل رفع الصورة.');
                             }
                           };
                           reader.readAsDataURL(file);
                         }}
                         className="hidden" 
                       />
                     </label>
                     {prodCoverUrl && (
                       <button
                         type="button"
                         onClick={() => setProdCoverUrl('')}
                         className="text-red-600 hover:text-red-700 font-bold text-xs px-2"
                       >
                         مسح
                       </button>
                     )}
                   </div>
                 </div>

                  {/* Title & subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-slate-700 block">عنوان المنتج الرئيسي</label>
                    <input
                      type="text"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-right"
                    />
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-slate-700 block">العنوان الفرعي (الترويجي)</label>
                    <input
                      type="text"
                      value={prodSubtitle}
                      onChange={(e) => setProdSubtitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-right"
                    />
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-slate-700 block">الرابط المخصص (اختياري)</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-emerald-500">
                      <span className="bg-slate-200 text-slate-600 px-3 py-3 text-xs select-none font-bold" dir="ltr">/</span>
                      <input
                        type="text"
                        value={prodSlug}
                        onChange={(e) => setProdSlug(e.target.value)}
                        placeholder="يتم التوليد تلقائياً إذا تُرك فارغاً"
                        className="w-full px-3 py-3 bg-transparent text-xs focus:outline-none font-bold text-emerald-700 text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-slate-700 block">رقم Meta Pixel ID خاص بهذا المنتج (اختياري)</label>
                  <input
                    type="text"
                    value={prodPixelId}
                    onChange={(e) => setProdPixelId(e.target.value)}
                    placeholder="اتركه فارغاً لاستخدام بيكسل المتجر العام الافتراضي"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-left"
                    dir="ltr"
                  />
                </div>

                {/* Description content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">وصف وتفاصيل المنتج (ادعم الأسطر والخصائص)</label>
                  <textarea
                    rows={6}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold whitespace-pre-line"
                  />
                </div>

                {/* Pricing, Stocks, Promo */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">سعر البيع الحالي (دج)</label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">السعر القديم المشطوب (دج)</label>
                    <input
                      type="number"
                      value={prodOldPrice}
                      onChange={(e) => setProdOldPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">العدد المتبقي في المخزون (تحذير)</label>
                    <input
                      type="number"
                      value={prodStockCount}
                      onChange={(e) => setProdStockCount(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">نص شريط العرض الإعلاني العلوي</label>
                    <input
                      type="text"
                      value={prodPromoText}
                      onChange={(e) => setProdPromoText(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                {/* Delivery Pricing Strategy (إستراتيجية سعر التوصيل للمنتج / الباك) */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <Truck size={18} className="text-emerald-600" />
                        <span>خيارات سعر التوصيل لهذا المنتج / الباك 🚚</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        اختر ما إذا كنت تريد تطبیق أسعار التوصيل المتغيرة حسب كل ولاية، أو تحديد سعر موحد وثابت لجميع الولايات (حيلة تسويقية ممتازة للباك والعروض الخاصة).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Variable per Wilaya */}
                    <button
                      type="button"
                      onClick={() => setProdUseFixedShipping(false)}
                      className={`p-4 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                        !prodUseFixedShipping
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        !prodUseFixedShipping ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {!prodUseFixedShipping && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-black text-xs block text-slate-900">1. أسعار متغيرة حسب جدول الولايات 🗺️</span>
                        <span className="text-[11px] text-slate-500 font-semibold block mt-1 leading-relaxed">
                          يتم احتساب سعر التوصيل تلقائياً بناءً على قائمة أسعار الولايات الـ 58 المحددة في النظام.
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Fixed uniform rate */}
                    <button
                      type="button"
                      onClick={() => setProdUseFixedShipping(true)}
                      className={`p-4 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer ${
                        prodUseFixedShipping
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        prodUseFixedShipping ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {prodUseFixedShipping && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-black text-xs block text-slate-900">2. سعر توصيل ثابت موحد لكل الولايات (للباك) 🏷️</span>
                        <span className="text-[11px] text-slate-500 font-semibold block mt-1 leading-relaxed">
                          تحديد سعر توصيل ثابت يطبق على كل الزبائن من جميع الولايات والبلديات بدون استثناء.
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Inputs for fixed rates */}
                  {prodUseFixedShipping && (
                    <div className="bg-emerald-100/70 p-4 rounded-xl border border-emerald-300/80 space-y-3">
                      <span className="font-extrabold text-xs text-emerald-950 block">تحديد أسعار التوصيل الثابتة لكل الولايات (دج):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 block">سعر التوصيل الثابت للمنزل (دج)</label>
                          <input
                            type="number"
                            value={prodFixedShippingHome}
                            onChange={(e) => setProdFixedShippingHome(Number(e.target.value))}
                            placeholder="مثلاً: 500"
                            className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 text-emerald-950"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-800 block">سعر التوصيل الثابت للمكتب (دج)</label>
                          <input
                            type="number"
                            value={prodFixedShippingDesk}
                            onChange={(e) => setProdFixedShippingDesk(Number(e.target.value))}
                            placeholder="مثلاً: 350"
                            className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 text-emerald-950"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features Management */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-extrabold text-sm text-slate-900">إدارة خصائص المنتج الفرعية الأربعة (4 Features)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prodFeatures.map((f, idx) => (
                      <div key={f.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <span className="font-bold text-xs text-emerald-700">الميزة رقم {idx + 1} ({f.icon})</span>
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="text"
                            placeholder="اسم الميزة"
                            value={f.title}
                            onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="تفاصيل الميزة"
                            value={f.description}
                            onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images Manager */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 font-black">معرض صور منتج صفحة الهبوط 🖼️</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">ارفع صوراً من حاسوبك أو أضف روابط خارجية مباشرة لتعرض في ألبوم المنتج</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Method 1: Computer Upload */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="font-bold text-xs text-emerald-800 flex items-center gap-1 font-black">
                          <Upload size={14} />
                          <span>الأسلوب الأول: رفع صورة من الكمبيوتر 💻</span>
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium">اختر صورة مباشرة من ملفات جهازك لحفظها وعرضها فوراً في المتجر.</p>
                      </div>

                      <div className="mt-2">
                        <label className="relative cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50 p-4 rounded-xl transition-all group">
                          <Upload size={24} className="text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-transform mb-2" />
                          <span className="text-xs font-bold text-slate-700">اضغط هنا لاختيار ملف صورة</span>
                          <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG, WEBP حتى 5 ميغا</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            disabled={uploadingImage}
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mt-2 animate-pulse justify-center">
                          <RefreshCw size={12} className="animate-spin" />
                          <span>جاري رفع وحفظ الصورة على الخادم...</span>
                        </div>
                      )}

                      {uploadError && (
                        <div className="text-red-600 text-[11px] font-bold mt-2 text-center">
                          ⚠️ {uploadError}
                        </div>
                      )}
                    </div>

                    {/* Method 2: Image URL */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="font-bold text-xs text-slate-800 font-black">الأسلوب الثاني: إضافة صورة عبر الرابط (URL) 🔗</span>
                        <p className="text-[10px] text-slate-500 font-medium">ضع رابطاً مباشراً لصورة من الإنترنت (مثل صور Unsplash ومواقع التصوير).</p>
                      </div>

                      <div className="space-y-2 mt-2">
                        <input
                          type="url"
                          placeholder="مثال: https://images.unsplash.com/photo-..."
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddImage}
                          className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm"
                        >
                          إضافة الرابط للمعرض
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* List of images */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {prodImages.map(img => (
                      <div key={img.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative group p-2">
                        <img 
                          src={img.url} 
                          alt="" 
                          className="w-full aspect-square object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                        
                        <div className="mt-2 flex gap-1 justify-between items-center">
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(img.id)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              img.isMain 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {img.isMain ? 'الأساسية ⭐' : 'تحديد كأساسية'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100"
                            title="حذف الصورة"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {prodColors.length > 0 && (
                          <div className="mt-1.5">
                            <select
                              value={img.colorName || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProdImages(prev => prev.map(i => i.id === img.id ? { ...i, colorName: val || undefined } : i));
                              }}
                              className="w-full text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="">كل الألوان</option>
                              {prodColors.map(c => (
                                <option key={c.id} value={c.name}>🎨 لون: {c.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors Manager */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 font-black flex items-center gap-2">
                        <span>🎨 إدارة ألوان المنتج والمتغيرات</span>
                        {prodColors.length > 0 && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                            {prodColors.length} ألوان مفعلة
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        حدد الألوان المتوفرة لهذا المنتج (مثل الحقائب والمحافض والأجهزة) لتظهر للزبون عند خيارات الشراء.
                      </p>
                    </div>
                  </div>

                  {/* Quick Preset Colors 1-click add */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-800 font-black">إضافة سريعة بنقرة واحدة (ألوان الجزائر الشائعة) ⚡</span>
                      <p className="text-[10px] text-slate-500">انقر على الألوان التي تود تفعيلها لهذا المنتج مباشرة:</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {PRESET_COLORS.map(pc => {
                        const isAdded = prodColors.some(c => c.name === pc.name);
                        return (
                          <button
                            key={pc.name}
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                setProdColors(prev => prev.filter(c => c.name !== pc.name));
                              } else {
                                handleAddColor(pc.name, pc.hex);
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              isAdded 
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner inline-block" style={{ backgroundColor: pc.hex }} />
                            <span>{pc.name}</span>
                            {isAdded ? <Check size={12} className="text-white" /> : <Plus size={12} className="text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Form */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-xs text-slate-800 font-black block">إضافة لون مخصص بحسب الطلب ✏️</span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">اسم اللون بالعربية:</label>
                        <input
                          type="text"
                          placeholder="مثال: أسود ملكي / بني هافان"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">رمز اللون (Color Code):</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 bg-white cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">صورة اللون (اختياري):</label>
                        <input
                          type="url"
                          placeholder="رابط صورة هذا اللون..."
                          value={newColorImageUrl}
                          onChange={(e) => setNewColorImageUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => handleAddColor()}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          إضافة ➕
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Colors List for this product */}
                  {prodColors.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">الألوان المفعلة حالياً لمنتج صفحة الهبوط:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {prodColors.map((col) => (
                          <div key={col.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full border border-black/20 shadow-sm shrink-0" style={{ backgroundColor: col.hex || '#000' }} />
                              <div>
                                <span className="font-extrabold text-xs text-slate-900 block">{col.name}</span>
                                {col.imageUrl && <span className="text-[9px] text-emerald-600 font-bold">🖼️ توجد صورة مربطة</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteColor(col.id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="حذف هذا اللون"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews Manager */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="font-extrabold text-sm text-slate-900">إدارة مراجعات وتقييمات العملاء</h4>
                  
                  {/* Create Review Block */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-xs text-emerald-700 block">إضافة مراجعة زبون جديدة</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      
                      {/* Reviewer Name */}
                      <input
                        type="text"
                        placeholder="اسم المقيّم (مثال: سعاد من ورقلة)"
                        value={newRevName}
                        onChange={(e) => setNewRevName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />

                      {/* Review rating stars */}
                      <select
                        value={newRevRating}
                        onChange={(e) => setNewRevRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 نجوم)</option>
                        <option value={3}>⭐⭐⭐ (3 نجوم)</option>
                        <option value={2}>⭐⭐ (نجمتان)</option>
                        <option value={1}>⭐ (نجمة واحدة)</option>
                      </select>

                      {/* Reviewer Wilaya */}
                      <select
                        value={newRevWilaya}
                        onChange={(e) => setNewRevWilaya(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      >
                        {ALGERIAN_WILAYAS.map(w => (
                          <option key={w.num} value={w.nameAr}>{w.nameAr}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleAddReview}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2 rounded-lg transition-all shadow-sm"
                      >
                        إضافة المراجعة لصفحة الهبوط
                      </button>

                    </div>

                    <textarea
                      placeholder="محتوى المراجعة الإيجابية للزبون..."
                      value={newRevComment}
                      onChange={(e) => setNewRevComment(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  {/* List of current reviews */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prodReviews.map(r => (
                      <div key={r.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex justify-between gap-4">
                        <div className="space-y-1.5 flex-grow">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-800">{r.name}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded">
                              {r.wilaya}
                            </span>
                            <div className="flex text-amber-400">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} size={10} className="fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                          <span className="text-[9px] text-slate-400 block">{r.date}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(r.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-100 self-center"
                          title="حذف المراجعة"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

              </div>
            )}

            {isEditingProductMode && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200" dir="rtl">
                <div>
                  {productSaveSuccess && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-bounce">
                      <span>🎉 تم حفظ جميع التغييرات ونشرها بنجاح!</span>
                    </span>
                  )}
                  {productSaveError && (
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-4 py-2 rounded-xl border border-red-200 flex items-center gap-1.5">
                      <span>⚠️ خطأ: {productSaveError}</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveProduct}
                  disabled={savingProduct}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-2 cursor-pointer"
                >
                  {savingProduct ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  <span>حفظ جميع التغييرات</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Shipping Prices & Wilayas */}
        {activeTab === 'shipping' && (
          <div className="space-y-6" dir="rtl">
            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Truck className="text-emerald-600" size={22} />
                    <span>تعديل أسعار شحن الولايات 🇩🇿</span>
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    يمكنك تعديل أسعار التوصيل لكل ولاية يدوياً، أو تفعيل وإيقاف التوصيل لولايات معينة. سيتم تحديث الأسعار تلقائياً للزبائن في صفحة الطلب بمجرد اختيارهم للولاية.
                  </p>
                </div>

                {/* Quick Bulk Actions */}
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row gap-3 items-end">
                  <div className="space-y-1.5 w-full sm:w-auto text-right">
                    <label className="text-[11px] font-bold text-slate-700 block">تعديل جماعي للشحن المنزلي (دج)</label>
                    <input 
                      type="number"
                      placeholder="مثال: 600"
                      id="bulkHomeVal"
                      className="w-full sm:w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = Number((document.getElementById('bulkHomeVal') as HTMLInputElement)?.value);
                      if (val >= 0) {
                        setWilayas(prev => prev.map(w => ({ ...w, shippingHome: val })));
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] px-3 py-2 rounded-lg transition-all w-full sm:w-auto"
                  >
                    تطبيق على الكل
                  </button>

                  <div className="h-px sm:h-8 w-full sm:w-px bg-slate-200 self-stretch my-1 sm:my-0"></div>

                  <div className="space-y-1.5 w-full sm:w-auto text-right">
                    <label className="text-[11px] font-bold text-slate-700 block">تعديل جماعي لشحن المكتب (دج)</label>
                    <input 
                      type="number"
                      placeholder="مثال: 400"
                      id="bulkDeskVal"
                      className="w-full sm:w-32 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = Number((document.getElementById('bulkDeskVal') as HTMLInputElement)?.value);
                      if (val >= 0) {
                        setWilayas(prev => prev.map(w => ({ ...w, shippingDesk: val })));
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] px-3 py-2 rounded-lg transition-all w-full sm:w-auto"
                  >
                    تطبيق على الكل
                  </button>
                </div>
              </div>

              {/* Search Filter for Wilayas */}
              <div className="mt-6 relative max-w-md text-right">
                <input
                  type="text"
                  placeholder="ابحث عن ولاية بالاسم أو الرقم..."
                  value={shippingSearch}
                  onChange={(e) => setShippingSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-right"
                />
                <Search size={16} className="absolute right-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            {wilayasLoading ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw size={36} className="text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-slate-500">جاري تحميل أسعار التوصيل الحالية...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Wilaya Editor Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wilayas
                    .filter(w => {
                      if (!shippingSearch) return true;
                      const searchLower = shippingSearch.toLowerCase();
                      return (
                        w.nameAr.includes(searchLower) ||
                        w.nameFr.toLowerCase().includes(searchLower) ||
                        String(w.num).includes(searchLower)
                      );
                    })
                    .map((w) => (
                      <div 
                        key={w.num} 
                        className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between gap-4 ${
                          w.available 
                            ? 'border-slate-200 hover:border-slate-300 shadow-sm' 
                            : 'border-slate-100 bg-slate-50/50 opacity-75'
                        }`}
                      >
                        {/* Header: Wilaya Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center">
                              {String(w.num).padStart(2, '0')}
                            </span>
                            <div className="text-right">
                              <h4 className="font-extrabold text-sm text-slate-900">{w.nameAr}</h4>
                              <span className="text-[10px] text-slate-400 block -mt-0.5">{w.nameFr}</span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={w.available}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setWilayas(prev => prev.map(item => item.num === w.num ? { ...item, available: checked } : item));
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className="mr-2 text-[10px] font-bold text-slate-600 select-none">
                              {w.available ? 'متاحة' : 'مغلقة'}
                            </span>
                          </label>
                        </div>

                        {/* Cost Inputs */}
                        <div className="grid grid-cols-2 gap-3 text-right">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 block flex items-center justify-end gap-1">
                              <span>🏠 شحن للبيت (دج)</span>
                            </label>
                            <input
                              type="number"
                              disabled={!w.available}
                              value={w.shippingHome}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setWilayas(prev => prev.map(item => item.num === w.num ? { ...item, shippingHome: val } : item));
                              }}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-800 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 block flex items-center justify-end gap-1">
                              <span>🏢 شحن للمكتب (دج)</span>
                            </label>
                            <input
                              type="number"
                              disabled={!w.available}
                              value={w.shippingDesk}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setWilayas(prev => prev.map(item => item.num === w.num ? { ...item, shippingDesk: val } : item));
                              }}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-800 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Notifications & Action Bar */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="text-right">
                    {shippingSaveSuccess && (
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <Check size={14} />
                        <span>✅ تم حفظ جميع أسعار التوصيل الجديدة بنجاح في الموقع!</span>
                      </div>
                    )}
                    {shippingSaveError && (
                      <div className="text-xs font-bold text-red-700 flex items-center gap-1.5 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                        <span>⚠️ {shippingSaveError}</span>
                      </div>
                    )}
                    {!shippingSaveSuccess && !shippingSaveError && (
                      <span className="text-xs text-slate-400 font-bold">يرجى الضغط على زر الحفظ لحفظ أي تغييرات تجريها.</span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetShippingPrices}
                      disabled={savingShipping}
                      className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={16} />
                      <span>إعادة ضبط أسعار الـ 58 ولاية 🔄</span>
                    </button>

                    <button
                      onClick={handleSaveShippingPrices}
                      disabled={savingShipping}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {savingShipping ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}
                      <span>حفظ أسعار التوصيل الجديدة 💾</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab 4: Telegram Integration */}
        {activeTab === 'telegram' && (
          <div className="space-y-6" dir="rtl">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <div className="space-y-1 text-right">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Send className="text-blue-500" size={22} />
                  <span>إعدادات ربط الإشعارات مع تيليغرام 🤖</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  اربط طلبيات متجرك مباشرة مع حسابك، مجموعتك أو قناتك على تيليغرام لتصلك معلومات المشترين والطلب في نفس الثانية!
                </p>
              </div>
            </div>

            {telegramLoading ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw size={36} className="text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-slate-500">جاري تحميل إعدادات تيليغرام الحالية...</span>
              </div>
            ) : telegramSettings && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form and Actions */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-right">
                    
                    {/* Active Switch */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">تفعيل إرسال الطلبيات لتيليغرام</h4>
                        <p className="text-[10px] text-slate-400">قم بإيقاف أو تفعيل الخدمة في أي وقت بنقرة واحدة.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={telegramSettings.enabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setTelegramSettings(prev => prev ? { ...prev, enabled: checked } : null);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="mr-3 text-xs font-bold text-slate-700 select-none">
                          {telegramSettings.enabled ? 'مفعلة' : 'معطلة'}
                        </span>
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">توكن البوت (Bot Token) 🔑</label>
                        <input 
                          type="text"
                          value={telegramSettings.botToken}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTelegramSettings(prev => prev ? { ...prev, botToken: val } : null);
                          }}
                          placeholder="مثال: 8961528392:AAFW0btuF..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                          <span>معرّف المحادثة أو المجموعة (Chat ID) 🆔</span>
                        </label>
                        <input 
                          type="text"
                          value={telegramSettings.chatId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTelegramSettings(prev => prev ? { ...prev, chatId: val } : null);
                          }}
                          placeholder="مثال: -1002485938210 أو معرّف شخصي"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Notifications & Submit */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        {telegramSaveSuccess && (
                          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                            <Check size={14} />
                            <span>تم حفظ الإعدادات بنجاح!</span>
                          </div>
                        )}
                        {telegramSaveError && (
                          <div className="text-xs font-bold text-red-700 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                            <span>⚠️ {telegramSaveError}</span>
                          </div>
                        )}
                        {!telegramSaveSuccess && !telegramSaveError && (
                          <span className="text-[10px] text-slate-400 font-bold">يرجى حفظ التعديلات لتطبيقها على الطلبيات الجديدة.</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveTelegramSettings}
                        disabled={savingTelegram}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {savingTelegram ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        <span>حفظ الإعدادات 💾</span>
                      </button>
                    </div>

                  </div>

                  {/* Diagnostic Test Box */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-right">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Wand2 size={16} className="text-indigo-500" />
                        <span>فحص وتجربة الاتصال الفوري 🧪</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1">
                        اضغط على الزر لإرسال رسالة ترحيب تجريبية إلى حسابك أو مجموعتك والتأكد من صحة التوكن والـ Chat ID.
                      </p>
                    </div>

                    {telegramTestSuccess && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                        <span className="text-xs font-bold text-emerald-800 block">✅ تم الاتصال وإرسال رسالة التجربة بنجاح!</span>
                        <p className="text-[10px] text-emerald-600 leading-relaxed">
                          تفقد قناتك أو مجموعتك على تيليغرام الآن للتأكد من وصول الرسالة الترحيبية من البوت.
                        </p>
                      </div>
                    )}

                    {telegramTestError && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-100 space-y-1">
                        <span className="text-xs font-bold text-red-800 block">⚠️ فشل إرسال رسالة الاختبار:</span>
                        <p className="text-[10px] text-red-600 leading-relaxed font-bold">
                          {telegramTestError}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-start">
                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        disabled={testingTelegram}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {testingTelegram ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        <span>إرسال رسالة اختبار لتيليغرام ⚡</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Helpful Guide Cards */}
                <div className="space-y-4 text-right">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-3xl border border-blue-100/50 space-y-4">
                    <h4 className="font-black text-xs text-blue-900 flex items-center gap-1.5">
                      <Info size={16} />
                      <span>دليل حل مشكلة "chat not found" 💡</span>
                    </h4>
                    
                    <ul className="space-y-3 text-[11px] text-slate-700 leading-relaxed font-semibold list-decimal list-inside pr-1">
                      <li>
                        <b>تأكد من إضافة البوت كمشرف:</b> افتح المجموعة أو القناة التي تريد الاستقبال فيها، اذهب لـ "إضافة أعضاء"، ابحث عن معرف البوت الخاص بك (مثال: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">@janna_orders_bot</code>) وأضفه.
                      </li>
                      <li>
                        <b>ترقية الصلاحيات:</b> يجب تعيين البوت بصفة <b>مسؤول (Admin)</b> مع منح كامل صلاحية "إرسال الرسائل".
                      </li>
                      <li>
                        <b>تأكد من صحة الـ Chat ID:</b> بالنسبة للمجموعات والقنوات العامة أو الخاصة، معرّف الـ ID يبدأ دائماً بـ <code className="bg-white px-1 py-0.5 rounded border border-blue-200">-100</code> يليه 10 أرقام (مثال: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">-1002485938210</code>).
                      </li>
                      <li>
                        <b>إرسال رسالة تفعيلية:</b> اكتب أي رسالة في المجموعة أو القناة بنفسك لتنشيطها، ثم جرب زر الفحص مجدداً هنا.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-800">كيف تنشئ بوتاً خاصاً بك؟</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      إذا أردت استخدام بوت منفصل تماماً باسم متجرك، اتبع الخطوات التالية:
                    </p>
                    <ol className="space-y-2 text-[10px] text-slate-600 leading-relaxed list-decimal list-inside pr-1 font-semibold">
                      <li>ابحث عن حساب <span className="text-blue-600">@BotFather</span> الرسمي في تيليغرام.</li>
                      <li>أرسل له الأمر <code className="bg-slate-50 px-1 py-0.5 rounded">/newbot</code>.</li>
                      <li>اختر اسماً لبلدك، ثم اسم مستخدم ينتهي بـ <code className="bg-slate-50 px-1 py-0.5 rounded">_bot</code>.</li>
                      <li>سينتج لك رمز التوكن (Token) المميز، انسخه وضعه في المربع المخصص على اليمين.</li>
                    </ol>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}




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

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-right">
              
              {/* Section 1: Basic Info & Logo & Cover Images */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span>🖼️ معلومات، اللوغو وصورة الغلاف (Cover) بالصفحة الرئيسية</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800">اسم المتجر الأساسي</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800">وصف المتجر (في الهيدر)</label>
                    <input
                      type="text"
                      value={storeSettings.storeSub}
                      onChange={(e) => setStoreSettings({...storeSettings, storeSub: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800">رمز العملة (Currency)</label>
                    <input
                      type="text"
                      value={storeSettings.currency || 'DZD'}
                      onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                      placeholder="DZD"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Logo & Cover Upload Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Logo Image */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <label className="text-xs font-black text-slate-800 block">شعار المتجر (Logo)</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {storeSettings.logoUrl ? (
                          <img src={storeSettings.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">لا يوجد</span>
                        )}
                      </div>
                      <div className="space-y-2 flex-grow">
                        <input
                          type="text"
                          placeholder="رابط الصورة (URL)..."
                          value={storeSettings.logoUrl || ''}
                          onChange={(e) => setStoreSettings({...storeSettings, logoUrl: e.target.value})}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                          dir="ltr"
                        />
                        <label className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all">
                          <span>{uploadingLogo ? 'جاري الرفع...' : '📁 اختيار لوغو من الجهاز'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <label className="text-xs font-black text-slate-800 block">صورة الغلاف (Hero Cover Image)</label>
                    <div className="flex gap-3 items-center">
                      <div className="w-20 h-14 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {storeSettings.coverUrl ? (
                          <img src={storeSettings.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">افتراضي</span>
                        )}
                      </div>
                      <div className="space-y-2 flex-grow">
                        <input
                          type="text"
                          placeholder="رابط صورة الغلاف (URL)..."
                          value={storeSettings.coverUrl || ''}
                          onChange={(e) => setStoreSettings({...storeSettings, coverUrl: e.target.value})}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                          dir="ltr"
                        />
                        <label className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all">
                          <span>{uploadingCover ? 'جاري الرفع...' : '🖼️ رفع صورة كفر جديدة'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 2: Hero Over-Cover Content */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span>✍️ النصوص المكتوبة فوق الغلاف (Hero Section)</span>
                </h4>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 block">الشارة الترحيبية (Hero Badge)</label>
                    <input
                      type="text"
                      value={storeSettings.heroBadge || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, heroBadge: e.target.value})}
                      placeholder="مثال: كتالوج المنتجات الحصرية والعروض المميزة"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 block">العنوان الرئيسي فوق الكفر (Hero Title)</label>
                    <input
                      type="text"
                      value={storeSettings.heroTitle || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, heroTitle: e.target.value})}
                      placeholder="مثال: تسوق أفضل المنتجات العصرية بأفضل الأسعار في الجزائر 🇩🇿"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 block">الوصف التفصيلي فوق الكفر (Hero Subtitle)</label>
                    <textarea
                      value={storeSettings.heroSub || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, heroSub: e.target.value})}
                      rows={2}
                      placeholder="مثال: اختر منتجك المفضل للوصول لصفحة العرض والطلب..."
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Moving Breaking News Ticker (شريط الأخبار المتحرك) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <span className="text-red-600">🚨</span>
                    <span>شريط الأخبار والعبارات التسويقية المتحركة (Ticker Bar)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPresetTickerItems}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚡ تعبئة الجمل التسويقية الجاهزة</span>
                  </button>
                </div>

                <div className="space-y-3 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTickerInput}
                      onChange={(e) => setNewTickerInput(e.target.value)}
                      placeholder="اكتب جملة تسويقية جديدة هنا (مثال: أفضل المنتجات بأسعار مليحة بزاف)..."
                      className="flex-grow px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTickerItem();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTickerItem}
                      className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      إضافة للشريط
                    </button>
                  </div>

                  {/* List of current ticker items */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-600 block">الجمل المتحركة الحالية في الشريط ({storeSettings.tickerItems?.length || 0}):</span>
                    {(!storeSettings.tickerItems || storeSettings.tickerItems.length === 0) ? (
                      <p className="text-xs text-slate-400 font-bold bg-white p-3 rounded-xl border text-center">لا توجد أي جملة في شريط الأخبار حالياً.</p>
                    ) : (
                      <div className="space-y-2 max-h-52 overflow-y-auto pl-1">
                        {storeSettings.tickerItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-2">
                              <span className="text-amber-500 font-black">#{idx + 1}</span>
                              <span>{item}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTickerItem(idx)}
                              className="text-red-500 hover:text-red-700 font-black text-xs bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 cursor-pointer transition-colors"
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Bottom Features (مميزات المتجر) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span>⭐ مميزات المتجر في أسفل الصفحة الرئيسية (Bottom Features)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Feature 1 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-emerald-700 block">الميزة الأولى (مثلا الشحن)</span>
                    <input
                      type="text"
                      placeholder="عنوان الميزة الأولى..."
                      value={storeSettings.feature1Title || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, feature1Title: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <textarea
                      placeholder="وصف الميزة الأولى..."
                      value={storeSettings.feature1Desc || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, feature1Desc: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  {/* Feature 2 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-amber-700 block">الميزة الثانية (مثلا معاينة وفحص)</span>
                    <input
                      type="text"
                      placeholder="عنوان الميزة الثانية..."
                      value={storeSettings.feature2Title || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, feature2Title: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <textarea
                      placeholder="وصف الميزة الثانية..."
                      value={storeSettings.feature2Desc || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, feature2Desc: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  {/* Feature 3 */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-sky-700 block">الميزة الثالثة (مثلا خدمة الزبائن)</span>
                    <input
                      type="text"
                      placeholder="عنوان الميزة الثالثة..."
                      value={storeSettings.feature3Title || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, feature3Title: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <textarea
                      placeholder="وصف الميزة الثالثة..."
                      value={storeSettings.feature3Desc || ''}
                      onChange={(e) => setStoreSettings({...storeSettings, feature3Desc: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Social Media Links */}
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

              {/* Marketing Integration Sub-Tabs */}
              <div className="pt-6 border-t border-slate-200" dir="rtl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
                    <span>⚡ Marketing Integrations</span>
                  </h4>
                </div>

                {/* Sub-Tabs Bar */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setMarketingSubTab('meta')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      marketingSubTab === 'meta'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>📘 Meta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketingSubTab('tiktok')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      marketingSubTab === 'tiktok'
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>🎵 TikTok</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketingSubTab('google_analytics')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      marketingSubTab === 'google_analytics'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>📈 Google Analytics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMarketingSubTab('google_ads')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                      marketingSubTab === 'google_ads'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>🎯 Google Ads</span>
                  </button>
                </div>

                {/* Tab Content: Meta */}
                {marketingSubTab === 'meta' && (
                  <div className="space-y-6">
                    {/* Status Overview Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${storeSettings.metaPixelId ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${storeSettings.metaPixelId ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                          <span className="font-extrabold text-xs">Browser Pixel</span>
                        </div>
                        <span className="text-xs font-black">
                          {storeSettings.metaPixelId ? '🟢 Connected' : '🔴 Not Connected'}
                        </span>
                      </div>

                      <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${storeSettings.metaAccessToken ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${storeSettings.metaAccessToken ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                          <span className="font-extrabold text-xs">Conversions API (CAPI)</span>
                        </div>
                        <span className="text-xs font-black">
                          {storeSettings.metaAccessToken ? '🟢 Connected' : '🔴 Not Connected'}
                        </span>
                      </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Pixel ID</label>
                          <input
                            type="text"
                            placeholder="مثال: 123456789012345"
                            value={storeSettings.metaPixelId || ''}
                            onChange={(e) => setStoreSettings({...storeSettings, metaPixelId: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">CAPI Token (Conversions API)</label>
                          <input
                            type="text"
                            placeholder="EAA..."
                            value={storeSettings.metaAccessToken || ''}
                            onChange={(e) => setStoreSettings({...storeSettings, metaAccessToken: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Test Event Code (اختياري)</label>
                          <input
                            type="text"
                            placeholder="مثال: TEST12345"
                            value={storeSettings.metaTestEventCode || ''}
                            onChange={(e) => setStoreSettings({...storeSettings, metaTestEventCode: e.target.value})}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleTestPixel}
                          disabled={testPixelLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          <span>{testPixelLoading ? 'جاري التحقق...' : '⚡ Test Connection'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleTestPurchase}
                          disabled={testPurchaseLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          <span>{testPurchaseLoading ? 'جاري الإرسال...' : '🛒 Send Test Purchase'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleProcessRetryQueue}
                          disabled={retryQueueLoading}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          <span>{retryQueueLoading ? 'جاري الإعادة...' : `🔄 معالجة قائمة الإعادة (${storeSettings.capiRetryQueue?.length || 0})`}</span>
                        </button>
                      </div>

                      {testPixelMessage && (
                        <div className={`mt-3 text-xs font-black px-4 py-3 rounded-xl border ${testPixelMessage.includes('🟢') || testPixelMessage.includes('بنجاح') || testPixelMessage.includes('🛒') || testPixelMessage.includes('🔄') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                          {testPixelMessage}
                        </div>
                      )}
                    </div>

                    {/* Meta Operational Diagnostics */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between font-extrabold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className="text-blue-600">🛠️</span>
                          <span>تشخيص النظام (Meta System Diagnostics)</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Queue Status: {storeSettings.capiRetryQueue?.length || 0} Pending Items
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">آخر نجاح لـ Browser Pixel</span>
                          <span className="font-extrabold text-slate-700 text-[11px]">
                            {storeSettings.lastPixelSuccess ? new Date(storeSettings.lastPixelSuccess).toLocaleString('ar-DZ') : 'غير مسجل'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">آخر نجاح لـ CAPI Server</span>
                          <span className="font-extrabold text-slate-700 text-[11px]">
                            {storeSettings.lastCapiSuccess ? new Date(storeSettings.lastCapiSuccess).toLocaleString('ar-DZ') : 'غير مسجل'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-bold">آخر خطأ مسجل</span>
                          <span className="font-extrabold text-red-600 text-[11px] truncate block" title={storeSettings.lastError}>
                            {storeSettings.lastError || 'لا يوجد أي خطأ'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Event Manager Table */}
                    <div className="mt-6">
                      <h5 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          📊 Event Manager (آخر الأحداث)
                        </span>
                        <span className="text-xs text-slate-500 font-normal">
                          تتبع حي مع الوقت والتفاصيل
                        </span>
                      </h5>
                      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 text-right">الحدث (Event)</th>
                              <th className="px-4 py-3 text-center">الحالة (Status)</th>
                              <th className="px-4 py-3 text-center">الوقت (Time)</th>
                              <th className="px-4 py-3 text-right">التفاصيل (Details)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-bold">
                            {(!storeSettings.pixelLogs || storeSettings.pixelLogs.length === 0) ? (
                              <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-medium">
                                  لا توجد أحداث مسجلة بعد. عند تصفح الموقع أو إتمام الطلب أو الضغط على أزرار التجربة ستظهر الأحداث هنا مباشرة.
                                </td>
                              </tr>
                            ) : (
                              storeSettings.pixelLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 text-slate-900 font-extrabold flex items-center gap-1.5">
                                    <span className="text-emerald-600">✅</span>
                                    <span>{log.eventName}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                      {log.status === 'success' ? 'Success' : 'Error'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center text-slate-500 dir-ltr text-[11px]" dir="ltr">
                                    {new Date(log.timestamp).toLocaleTimeString('ar-DZ')}
                                  </td>
                                  <td className="px-4 py-3 text-slate-600 text-[11px]">
                                    {log.details || 'تتبع تلقائي عبر المتصفح والخادم'}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Other Platforms */}
                {marketingSubTab !== 'meta' && (
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                    <span className="text-3xl">⏳</span>
                    <h5 className="font-extrabold text-sm text-slate-800">
                      تكامل {marketingSubTab === 'tiktok' ? 'TikTok Pixel' : marketingSubTab === 'google_analytics' ? 'Google Analytics 4' : 'Google Ads'} سيتم تفعيله قريباً
                    </h5>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      النظام مهيأ للتكامل مع باقي منصات الإعلانات، وحالياً Meta Pixel & CAPI يعمل بشكل كامل ومتوافق مع المتاجر الجزائرية (DZD).
                    </p>
                  </div>
                )}
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
      </main>

    </div>
  );
}
