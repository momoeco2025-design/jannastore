import React, { useState, useEffect } from 'react';
import { ProductData, Order, OrderStatus, Review, ProductFeature, ProductImage, Wilaya, TelegramSettings, StoreSettings } from '../types';
import { ALGERIAN_WILAYAS } from './WilayaData';
import { 
  Lock, LogOut, Settings, Plus, Minus, Star, Trash2, Edit2, Check,
  TrendingUp, Calendar, MapPin, Phone, User, Info, DollarSign,
  Search, Filter, Download, ShoppingCart, RefreshCw, Package, ArrowRight,
  Upload, Wand2, Truck, Send, Sparkles, ShoppingBag, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  onClose: () => void;
  adminToken: string;
  onLogout: () => void;
}

export default function AdminPanel({ onClose, adminToken, onLogout }: AdminPanelProps) {
  // Tabs: 'orders' or 'product' or 'shipping' or 'telegram'
  const [activeTab, setActiveTab] = useState<'orders' | 'product' | 'shipping' | 'telegram'>('orders');

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

  // Local state for editing product fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodOldPrice, setProdOldPrice] = useState(0);
  const [prodPromoText, setProdPromoText] = useState('');
  const [prodStockCount, setProdStockCount] = useState(0);

  // Images state inside editor
  const [prodImages, setProdImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

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
          tickerItems
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
          setProdImages(data.images || []);
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
    setProdTitle(p.title);
    setProdSubtitle(p.subtitle);
    setProdDescription(p.description);
    setProdPrice(p.price);
    setProdOldPrice(p.oldPrice);
    setProdPromoText(p.promoText);
    setProdStockCount(p.stockCount);
    setProdImages(p.images || []);
    setProdFeatures(p.features || []);
    setProdReviews(p.reviews || []);
    setIsEditingProductMode(true);
  };

  const handleStartAddProduct = () => {
    setEditingProductId(null);
    setProdSlug('');
    setProdCoverUrl('');
    setProdLogoUrl('');
    setProdTitle('');
    setProdSubtitle('');
    setProdDescription('');
    setProdPrice(0);
    setProdOldPrice(0);
    setProdPromoText('');
    setProdStockCount(10);
    setProdImages([]);
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
        alert('تم تعيين الصفحة كصفحة رئيسية بنجاح!');
        fetchProducts();
        fetchProduct();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل تعيين الصفحة كصفحة رئيسية.');
      }
    } catch (err) {
      alert('فشل الاتصال بالخادم.');
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
        alert(errData.error || 'حدث خطأ ما');
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
        alert(errData.error || 'حدث خطأ ما');
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
      alert('يرجى ملء اسم المقيّم والتعليق.');
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
      alert('يرجى كتابة وصف أولي أو تفاصيل عن المنتج للذكاء الاصطناعي أولاً.');
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
      coverUrl: prodCoverUrl,
      logoUrl: prodLogoUrl,
      images: prodImages,
      features: prodFeatures,
      reviews: prodReviews
    };

    try {
      // Save Store settings first in the background
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
        fetchStoreSettings();
      } else {
        const errData = await res.json();
        setProductSaveError(errData.error || 'حدث خطأ في الحفظ.');
      }
    } catch (err) {
      setProductSaveError('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً.');
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
                            <div className="flex items-center gap-1">
                              <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                                {order.quantity} علبة
                              </span>
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
                          <th scope="col" className="px-6 py-4 text-right">المنتج والصفحة</th>
                          <th scope="col" className="px-6 py-4 text-center">رابط صفحة الهبوط</th>
                          <th scope="col" className="px-6 py-4 text-center">الصفحة الرئيسية 🏠</th>
                          <th scope="col" className="px-6 py-4 text-center">السعر الحالي</th>
                          <th scope="col" className="px-6 py-4 text-center">ميزات/صور/آراء</th>
                          <th scope="col" className="px-6 py-4 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {products.map((p) => (
                          <tr key={p.id || p.slug} className="hover:bg-slate-50/50 transition-colors">
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
                      </div>
                    ))}
                  </div>
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
              <div className="flex justify-end pt-6 border-t border-slate-200">
                <button
                  onClick={handleSaveProduct}
                  disabled={savingProduct}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-2 cursor-pointer"
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
                        alert('تم تطبيق السعر على جميع الولايات، لا تنسى الضغط على حفظ في الأسفل.');
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
                        alert('تم تطبيق السعر على جميع الولايات، لا تنسى الضغط على حفظ في الأسفل.');
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



      </main>

    </div>
  );
}
