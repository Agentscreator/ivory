import { Capacitor, registerPlugin } from '@capacitor/core';

export interface IAPPlugin {
  getProducts(options: { productIds: string[] }): Promise<{
    products: IAPProduct[];
    invalidProductIds: string[];
  }>;
  purchase(options: { productId: string }): Promise<void>;
  restorePurchases(): Promise<void>;
  finishTransaction(options: { transactionId: string }): Promise<void>;
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
  // Subscriptions
  PRO_MONTHLY: 'com.ivory.pro.monthly',
  BUSINESS_MONTHLY: 'com.ivory.business.monthly',
  
  // Credit Packages
  CREDITS_5: 'com.ivory.credits.5',
  CREDITS_10: 'com.ivory.credits.10',
  CREDITS_25: 'com.ivory.credits.25',
  CREDITS_50: 'com.ivory.credits.50',
  CREDITS_100: 'com.ivory.credits.100',
};

// Map product IDs to credit amounts
export const PRODUCT_CREDITS: Record<string, number> = {
  [IAP_PRODUCT_IDS.CREDITS_5]: 5,
  [IAP_PRODUCT_IDS.CREDITS_10]: 10,
  [IAP_PRODUCT_IDS.CREDITS_25]: 25,
  [IAP_PRODUCT_IDS.CREDITS_50]: 50,
  [IAP_PRODUCT_IDS.CREDITS_100]: 100,
};

// Map product IDs to subscription tiers
export const PRODUCT_TIERS: Record<string, string> = {
  [IAP_PRODUCT_IDS.PRO_MONTHLY]: 'pro',
  [IAP_PRODUCT_IDS.BUSINESS_MONTHLY]: 'business',
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
}

export const iapManager = new IAPManager();
