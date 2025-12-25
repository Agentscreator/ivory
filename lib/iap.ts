import { Capacitor, registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface IAPPlugin {
  getProducts(options: { productIds: string[] }): Promise<{
    products: IAPProduct[];
    invalidProductIds: string[];
  }>;
  purchase(options: { productId: string }): Promise<void>;
  restorePurchases(): Promise<void>;
  finishTransaction(options: { transactionId: string }): Promise<void>;
  addListener(
    eventName: 'purchaseCompleted',
    listenerFunc: (result: PurchaseResult) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'purchaseFailed',
    listenerFunc: (error: { productId: string; errorCode: number; errorMessage: string }) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'purchaseRestored',
    listenerFunc: (result: PurchaseResult) => void
  ): Promise<PluginListenerHandle>;
}

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: number;
  priceString: string;
  currency: string;
}

export interface PurchaseResult {
  transactionId: string;
  productId: string;
  receipt: string;
  transactionDate: number;
}

const IAP = registerPlugin<IAPPlugin>('IAPPlugin');

// Product IDs - these must match what you configure in App Store Connect
export const IAP_PRODUCT_IDS = {
  // Client Subscriptions
  PRO_MONTHLY: 'com.yourcompany.ivory.business2', // $20/month for clients
  
  // Tech Subscriptions
  BUSINESS_MONTHLY: 'com.yourcompany.ivory.pro', // $60/month for techs
  
  // Credit Packages (for clients only)
  CREDITS_5: 'com.yourcompany.ivory.credits.5',
  CREDITS_10: 'com.yourcompany.ivory.credits.10',
  CREDITS_25: 'com.yourcompany.ivory.credits.25',
  CREDITS_50: 'com.yourcompany.ivory.credits.50',
  CREDITS_100: 'com.yourcompany.ivory.credits.100',
  
  // Booking Payments (dynamic pricing tiers)
  BOOKING_TIER_1: 'com.yourcompany.ivory.booking.tier1', // $0-50
  BOOKING_TIER_2: 'com.yourcompany.ivory.booking.tier2', // $51-100
  BOOKING_TIER_3: 'com.yourcompany.ivory.booking.tier3', // $101-150
  BOOKING_TIER_4: 'com.yourcompany.ivory.booking.tier4', // $151-200
  BOOKING_TIER_5: 'com.yourcompany.ivory.booking.tier5', // $201+
};

// Map product IDs to credit amounts (for clients)
export const PRODUCT_CREDITS: Record<string, number> = {
  [IAP_PRODUCT_IDS.CREDITS_5]: 5,
  [IAP_PRODUCT_IDS.CREDITS_10]: 10,
  [IAP_PRODUCT_IDS.CREDITS_25]: 25,
  [IAP_PRODUCT_IDS.CREDITS_50]: 50,
  [IAP_PRODUCT_IDS.CREDITS_100]: 100,
};

// Map product IDs to subscription tiers and user types
export const PRODUCT_TIERS: Record<string, { tier: string; userType: string; credits?: number }> = {
  [IAP_PRODUCT_IDS.PRO_MONTHLY]: { tier: 'pro', userType: 'client', credits: 20 },
  [IAP_PRODUCT_IDS.BUSINESS_MONTHLY]: { tier: 'business', userType: 'tech', credits: 0 },
};

class IAPManager {
  private products: IAPProduct[] = [];
  private purchaseListeners: ((result: PurchaseResult) => void)[] = [];
  private errorListeners: ((error: { productId: string; errorMessage: string }) => void)[] = [];

  constructor() {
    if (Capacitor.isNativePlatform()) {
      this.setupListeners();
    }
  }

  private setupListeners() {
    // Listen for purchase completion
    IAP.addListener('purchaseCompleted', (result: PurchaseResult) => {
      this.purchaseListeners.forEach(listener => listener(result));
    });

    // Listen for purchase failures
    IAP.addListener('purchaseFailed', (error: any) => {
      this.errorListeners.forEach(listener => listener(error));
    });

    // Listen for restored purchases
    IAP.addListener('purchaseRestored', (result: PurchaseResult) => {
      this.purchaseListeners.forEach(listener => listener(result));
    });
  }

  async loadProducts(): Promise<IAPProduct[]> {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    try {
      const result = await IAP.getProducts({
        productIds: Object.values(IAP_PRODUCT_IDS),
      });

      this.products = result.products;
      return result.products;
    } catch (error) {
      console.error('Failed to load IAP products:', error);
      return [];
    }
  }

  async purchase(productId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('IAP only available on native platforms');
    }

    return IAP.purchase({ productId });
  }

  async restorePurchases(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('IAP only available on native platforms');
    }

    return IAP.restorePurchases();
  }

  async finishTransaction(transactionId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    return IAP.finishTransaction({ transactionId });
  }

  onPurchaseComplete(callback: (result: PurchaseResult) => void) {
    this.purchaseListeners.push(callback);
  }

  onPurchaseError(callback: (error: { productId: string; errorMessage: string }) => void) {
    this.errorListeners.push(callback);
  }

  getProduct(productId: string): IAPProduct | undefined {
    return this.products.find(p => p.productId === productId);
  }

  getAllProducts(): IAPProduct[] {
    return this.products;
  }

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Get appropriate booking product ID based on total price
  getBookingProductId(totalPrice: number): string {
    if (totalPrice <= 50) return IAP_PRODUCT_IDS.BOOKING_TIER_1;
    if (totalPrice <= 100) return IAP_PRODUCT_IDS.BOOKING_TIER_2;
    if (totalPrice <= 150) return IAP_PRODUCT_IDS.BOOKING_TIER_3;
    if (totalPrice <= 200) return IAP_PRODUCT_IDS.BOOKING_TIER_4;
    return IAP_PRODUCT_IDS.BOOKING_TIER_5;
  }
}

export const iapManager = new IAPManager();
