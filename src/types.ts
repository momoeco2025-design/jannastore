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

export interface StoreSettings {
  storeName: string;
  storeSub: string;
  tickerItems: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    telegram?: string;
  };
}



