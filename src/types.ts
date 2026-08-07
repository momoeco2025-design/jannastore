export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  wilaya: string;
}

export interface ProductFeature {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide-react icon name
}

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

export interface ProductData {
  id?: string;
  slug?: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  oldPrice: number;
  promoText: string;
  stockCount: number;
  videoUrl?: string;
  coverUrl?: string;
  logoUrl?: string;
  pixelId?: string; // Meta Pixel ID for this specific product
  pageViews?: number;
  viewContentCount?: number;
  initiateCheckoutCount?: number;
  purchaseCount?: number;
  images: ProductImage[];
  features: ProductFeature[];
  reviews: Review[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  wilayaNum: number;
  wilayaName: string;
  commune: string;
  quantity: number;
  notes?: string;
  totalPrice: number;
  shippingPrice: number;
  status: OrderStatus;
  createdAt: string;
  productSlug?: string;
  productName?: string;
}

export interface Wilaya {
  num: number;
  nameAr: string;
  nameFr: string;
  shippingHome: number;
  shippingDesk: number;
  available: boolean;
}

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface PixelLogEntry {
  id: string;
  timestamp: string;
  eventName: string;
  status: 'success' | 'error';
  details?: string;
}

export interface CapiQueueItem {
  id: string;
  pixelId: string;
  accessToken: string;
  eventName: string;
  eventSourceUrl: string;
  clientIp: string;
  clientUserAgent: string;
  userData: any;
  customData: any;
  testEventCode?: string;
  eventId?: string;
  attempts: number;
  createdAt: string;
  lastError?: string;
}

export interface StoreSettings {
  storeName: string;
  storeSub: string;
  currency?: string;
  logoUrl?: string;
  coverUrl?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSub?: string;
  tickerItems: string[];
  feature1Title?: string;
  feature1Desc?: string;
  feature2Title?: string;
  feature2Desc?: string;
  feature3Title?: string;
  feature3Desc?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    telegram?: string;
  };
  metaPixelId?: string;
  metaAccessToken?: string;
  metaTestEventCode?: string;
  domain?: string;
  domainVerified?: boolean;
  pixelLogs?: PixelLogEntry[];
  capiRetryQueue?: CapiQueueItem[];
  lastPixelSuccess?: string;
  lastCapiSuccess?: string;
  lastError?: string;
}




