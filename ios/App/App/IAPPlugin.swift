import Foundation
import Capacitor
import StoreKit

@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin {
    private var products: [SKProduct] = []
    private var productsRequest: SKProductsRequest?
    
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self) else {
            call.reject("Must provide productIds")
            return
        }
        
        let request = SKProductsRequest(productIdentifiers: Set(productIds))
        request.delegate = self
        productsRequest = request
        request.start()
        
        // Store call for later response
        self.bridge?.saveCall(call)
    }
    
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Must provide productId")
            return
        }
        
        guard let product = products.first(where: { $0.productIdentifier == productId }) else {
            call.reject("Product not found")
            return
        }
        
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
        
        // Store call for later response
        self.bridge?.saveCall(call)
    }
    
    @objc func restorePurchases(_ call: CAPPluginCall) {
        SKPaymentQueue.default().restoreCompletedTransactions()
        call.resolve()
    }
    
    @objc func finishTransaction(_ call: CAPPluginCall) {
        guard let transactionId = call.getString("transactionId") else {
            call.reject("Must provide transactionId")
            return
        }
        
        // Find and finish the transaction
        for transaction in SKPaymentQueue.default().transactions {
            if transaction.transactionIdentifier == transactionId {
                SKPaymentQueue.default().finishTransaction(transaction)
                call.resolve()
                return
            }
        }
        
        call.reject("Transaction not found")
    }
}

// MARK: - SKProductsRequestDelegate
extension IAPPlugin: SKProductsRequestDelegate {
    public func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        self.products = response.products
        
        let productsData = response.products.map { product -> [String: Any] in
            let formatter = NumberFormatter()
            formatter.numberStyle = .currency
            formatter.locale = product.priceLocale
            
            return [
                "productId": product.productIdentifier,
                "title": product.localizedTitle,
                "description": product.localizedDescription,
                "price": product.price.doubleValue,
                "priceString": formatter.string(from: product.price) ?? "",
                "currency": product.priceLocale.currencyCode ?? "USD"
            ]
        }
        
        if let call = self.bridge?.savedCall(withID: "getProducts") {
            call.resolve([
                "products": productsData,
                "invalidProductIds": response.invalidProductIdentifiers
            ])
        }
    }
    
    public func request(_ request: SKRequest, didFailWithError error: Error) {
        if let call = self.bridge?.savedCall(withID: "getProducts") {
            call.reject("Failed to load products: \(error.localizedDescription)")
        }
    }
}

// MARK: - SKPaymentTransactionObserver
extension IAPPlugin: SKPaymentTransactionObserver {
    public func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                handlePurchased(transaction)
            case .failed:
                handleFailed(transaction)
            case .restored:
                handleRestored(transaction)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }
    
    private func handlePurchased(_ transaction: SKPaymentTransaction) {
        // Get receipt data
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            notifyListeners("purchaseCompleted", data: [
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString,
                "transactionDate": transaction.transactionDate?.timeIntervalSince1970 ?? 0
            ])
        }
        
        // Don't finish transaction here - let the app do it after server validation
    }
    
    private func handleFailed(_ transaction: SKPaymentTransaction) {
        let error = transaction.error as? SKError
        let errorCode = error?.code.rawValue ?? -1
        let errorMessage = error?.localizedDescription ?? "Unknown error"
        
        notifyListeners("purchaseFailed", data: [
            "productId": transaction.payment.productIdentifier,
            "errorCode": errorCode,
            "errorMessage": errorMessage
        ])
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    private func handleRestored(_ transaction: SKPaymentTransaction) {
        if let receiptURL = Bundle.main.appStoreReceiptURL,
           let receiptData = try? Data(contentsOf: receiptURL) {
            let receiptString = receiptData.base64EncodedString()
            
            notifyListeners("purchaseRestored", data: [
                "transactionId": transaction.transactionIdentifier ?? "",
                "productId": transaction.payment.productIdentifier,
                "receipt": receiptString
            ])
        }
        
        SKPaymentQueue.default().finishTransaction(transaction)
    }
    
    public override func load() {
        super.load()
        SKPaymentQueue.default().add(self)
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
}
