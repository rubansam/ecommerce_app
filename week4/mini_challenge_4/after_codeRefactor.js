/**
 * =======================================================
 * AFTER REFACTORING: Applying SOLID and Modern Patterns
 * =======================================================
 *
 * The original `processOrder` function has been broken down into a series
 * of smaller, single-responsibility classes and functions.
 *
 * Key Improvements:
 *
 * 1. Parameter Object (`OrderRequest`): The long parameter list has been
 *    replaced with a single object, making the function call cleaner and
 *    less error-prone.
 *
 * 2. Extract Method & Single Responsibility Principle (SRP):
 *    - `PricingCalculator`: Handles all price and weight calculations.
 *    - `DiscountService`: Manages all discount logic.
 *    - `ShippingService`: Calculates shipping costs based on destination and weight.
 *    - `NotificationService`: Manages all user notifications (email, invoice).
 *    - `OrderRepository`: Handles database interactions.
 *
 * 3. Replace Conditional with Polymorphism (Strategy Pattern):
 *    - The complex `if/else if` block for payments was replaced by a
 *      `PaymentStrategyFactory`. Now, adding a new payment method (e.g., 'Stripe')
 *      only requires creating a new strategy class, not modifying existing code.
 *      This follows the Open/Closed Principle.
 *
 * 4. SOLID Principles:
 *    - Single Responsibility: Each class now has one job.
 *    - Open/Closed: The system is open for extension (new payment methods,
 *      shipping rules) but closed for modification.
 *    - Liskov Substitution: Each payment strategy can be substituted for another.
 *    - Dependency Inversion: The main processor depends on abstractions (like
 *      the payment strategy interface), not concrete implementations.
 */

// --- (1) Parameter Object ---
// Consolidates all input into a single, structured object.
class OrderRequest {
    constructor(user, items, paymentDetails, promoCode, shippingAddress, options = {}) {
        this.user = user;
        this.items = items;
        this.paymentDetails = paymentDetails; // e.g., { type: 'CreditCard', token: '...' }
        this.promoCode = promoCode;
        this.shippingAddress = shippingAddress;
        this.currency = options.currency || 'USD';
        this.shouldSendEmail = options.shouldSendEmail !== false;
        this.shouldGenerateInvoice = options.shouldGenerateInvoice || false;
        this.customerNotes = options.customerNotes || '';

        this.validate();
    }

    validate() {
        if (!this.user || !this.items || !this.items.length) {
            throw new Error("Invalid order: User or items are missing.");
        }
        if (!this.paymentDetails || !this.shippingAddress) {
            throw new Error("Invalid order: Payment or shipping info is missing.");
        }
    }
}


// --- (2) Extracted Services (Single Responsibility Principle) ---

class PricingCalculator {
    static calculate(items) {
        let totalPrice = 0;
        let totalWeight = 0;
        let hasDigitalItems = false;
        let hasSubscription = false;

        for (const item of items) {
            if (item.price < 0 || !item.price) continue;
            totalPrice += item.price * item.quantity;
            totalWeight += item.weight * item.quantity;
            if (item.type === 'digital') hasDigitalItems = true;
            if (item.type === 'subscription') hasSubscription = true;
        }
        return { totalPrice, totalWeight, hasDigitalItems, hasSubscription };
    }
}

class DiscountService {
    static apply(totalPrice, user, promoCode) {
        let discountedPrice = totalPrice;
        // Promo code discounts
        if (promoCode === 'SAVE10') discountedPrice *= 0.90;

        // Loyalty discounts
        const loyaltyDiscounts = { gold: 0.95, silver: 0.98 };
        if (loyaltyDiscounts[user.loyaltyLevel]) {
            discountedPrice *= loyaltyDiscounts[user.loyaltyLevel];
        }

        // Bulk order discount
        if (discountedPrice > 500) discountedPrice -= 25;

        return discountedPrice;
    }
}

class ShippingService {
    static calculate(priceContext, address, promoCode) {
        const { totalWeight, hasDigitalItems, hasSubscription } = priceContext;
        if ((hasDigitalItems && totalWeight === 0) || hasSubscription) {
            return 0; // Free shipping for all-digital or subscription orders
        }
        if (promoCode === 'FREESHIP') return 0;

        // Strategy pattern could be used here too for different countries
        switch (address.country) {
            case 'USA':
                if (totalWeight <= 2) return 5;
                if (totalWeight <= 10) return 15;
                return 25;
            case 'Canada':
                return totalWeight * 5;
            default:
                return totalWeight * 10; // International
        }
    }
}

class NotificationService {
    static sendConfirmation(request, orderResult) {
        if (request.shouldSendEmail) {
            EmailService.send(
                request.user.email,
                'Your Order Confirmation',
                `Thank you for your order, #${orderResult.orderId}. Your total was ${orderResult.total} ${request.currency}.`
            );
        }
        if (request.shouldGenerateInvoice) {
            const invoice = new Invoice({ ...orderResult, user: request.user });
            invoice.generatePDF();
        }
    }
}

class OrderRepository {
    static save(request, orderResult) {
        const orderData = {
            orderId: orderResult.orderId,
            userId: request.user.id,
            total: orderResult.total,
            items: request.items.map(i => i.id),
            shippingAddress: request.shippingAddress,
            notes: request.customerNotes,
            paymentType: request.paymentDetails.type,
            status: 'completed'
        };
        Database.save('orders', orderData);
        return orderData;
    }
}


// --- (3) Replace Conditional with Polymorphism (Strategy Pattern) ---

// Interface for all payment strategies
class PaymentStrategy {
    pay(amount, details) { throw new Error("Not implemented"); }
}

class CreditCardStrategy extends PaymentStrategy {
    pay(amount, details) {
        console.log(`Charging ${amount} to credit card...`);
        const response = creditCardGateway.charge(amount, details.token, details.currency);
        if (response.status !== 'success') throw new Error("Credit card payment failed.");
        return true;
    }
}

class PayPalStrategy extends PaymentStrategy {
    pay(amount, details) {
        console.log(`Initiating PayPal payment for ${amount}...`);
        const response = payPalAPI.createPayment(amount, details.token, details.currency);
        if (!response.id) throw new Error("PayPal payment failed.");
        return true;
    }
}

class GiftCardStrategy extends PaymentStrategy {
    pay(amount, details) {
        console.log(`Redeeming gift card for ${amount}...`);
        if (giftCardService.getBalance(details.number) < amount) {
            throw new Error("Gift card has insufficient funds.");
        }
        return giftCardService.redeem(details.number, amount);
    }
}

class PaymentStrategyFactory {
    static getStrategy(type) {
        switch (type) {
            case 'CreditCard': return new CreditCardStrategy();
            case 'PayPal': return new PayPalStrategy();
            case 'GiftCard': return new GiftCardStrategy();
            default: throw new Error(`Unsupported payment type: ${type}`);
        }
    }
}


// --- The Main Orchestrator (Processor) ---

class OrderProcessor {
    constructor(request) {
        this.request = new OrderRequest(...Object.values(request)); // Simplified for example
    }

    process() {
        try {
            // Price calculation pipeline
            const priceContext = PricingCalculator.calculate(this.request.items);
            const discountedPrice = DiscountService.apply(priceContext.totalPrice, this.request.user, this.request.promoCode);
            const shippingCost = ShippingService.calculate(priceContext, this.request.shippingAddress, this.request.promoCode);
            const finalTotal = discountedPrice + shippingCost;

            // Payment processing
            const paymentStrategy = PaymentStrategyFactory.getStrategy(this.request.paymentDetails.type);
            paymentStrategy.pay(finalTotal, { ...this.request.paymentDetails, currency: this.request.currency });

            // Finalization
            const orderId = `ORD-${Date.now()}`;
            const orderResult = { success: true, orderId, total: finalTotal };

            OrderRepository.save(this.request, orderResult);
            NotificationService.sendConfirmation(this.request, orderResult);

            return orderResult;

        } catch (error) {
            console.error("Order processing failed:", error.message);
            return { success: false, error: error.message };
        }
    }
}


// --- Mock External Services (Unchanged) ---
const creditCardGateway = { charge: (amount, token, currency) => ({ status: 'success' }) };
const payPalAPI = { createPayment: (amount, token, currency) => ({ id: 'PAY-123' }) };
const giftCardService = { getBalance: (num) => 500, redeem: (num, amount) => true };
const Database = { save: (table, data) => console.log(`Saved to ${table}`) };
class Invoice { constructor(data) { this.id = `INV-${data.orderId}` }; generatePDF() { console.log(`Generated PDF for ${this.id}`) } };
const EmailService = { send: (to, subject, body) => true }; 