/**
 * ===============================================
 * BEFORE REFACTORING: A Monolithic Function
 * ===============================================
 *
 * This function, `processOrder`, is a classic example of a monolithic function
 * that violates multiple software design principles.
 *
 * Issues:
 * - Over 200 lines long.
 * - Violates the Single Responsibility Principle (SRP): It handles pricing,
 *   discounts, payment, shipping, notifications, and logging.
 * - High Cyclomatic Complexity: Deeply nested if/else statements make it
 *   hard to read, test, and maintain.
 * - Long Parameter List: Difficult to call and prone to errors.
 * - Not Extensible: Adding a new payment method, discount rule, or
 *   product type requires modifying this entire function, violating the
 *   Open/Closed Principle.
 */
function processOrder(
    user,
    items,
    paymentType,
    promoCode,
    shippingAddress,
    customerNotes,
    shouldSendEmail,
    shouldGenerateInvoice,
    currency
) {
    // 1. Initial validation
    if (!user || !items || !items.length) {
        console.error("Invalid order: User or items are missing.");
        return { success: false, error: "Invalid order data." };
    }
    if (!paymentType || !shippingAddress) {
        console.error("Invalid order: Payment or shipping info is missing.");
        return { success: false, error: "Payment or shipping info required." };
    }

    let totalPrice = 0;
    let totalWeight = 0;
    let hasDigitalItems = false;
    let hasSubscription = false;

    // 2. Calculate initial total price and weight
    console.log("--- Starting Price Calculation ---");
    for (const item of items) {
        if (item.type === 'digital') {
            hasDigitalItems = true;
        }
        if (item.type === 'subscription') {
            hasSubscription = true;
        }
        if (item.price < 0 || !item.price) {
            console.error(`Invalid price for item: ${item.name}`);
            // Skip invalid items
            continue;
        }
        totalPrice += (item.price * item.quantity);
        totalWeight += (item.weight * item.quantity);
        console.log(`Item: ${item.name}, Qty: ${item.quantity}, Price: ${item.price}, Weight: ${item.weight}`);
    }
    console.log(`Subtotal: ${totalPrice}`);
    console.log(`Total Weight: ${totalWeight}kg`);

    // 3. Apply discounts
    console.log("--- Applying Discounts ---");
    if (promoCode) {
        if (promoCode === 'SAVE10') {
            totalPrice *= 0.90;
            console.log("Applied 10% promo code 'SAVE10'.");
        } else if (promoCode === 'FREESHIP') {
            // This will be handled in shipping section
            console.log("Promo 'FREESHIP' noted.");
        }
    }

    if (user.loyaltyLevel === 'gold') {
        totalPrice *= 0.95; // 5% discount for gold members
        console.log("Applied 5% Gold Member discount.");
    } else if (user.loyaltyLevel === 'silver') {
        totalPrice *= 0.98; // 2% discount for silver members
        console.log("Applied 2% Silver Member discount.");
    }

    if (totalPrice > 500) {
        totalPrice -= 25; // $25 off for orders over $500
        console.log("Applied $25 bulk order discount.");
    }

    console.log(`Price after discounts: ${totalPrice}`);

    // 4. Calculate Shipping Cost
    console.log("--- Calculating Shipping ---");
    let shippingCost = 0;
    if (!hasDigitalItems || totalWeight > 0) { // No shipping cost if all items are digital
        if (shippingAddress.country === 'USA') {
            if (totalWeight <= 2) {
                shippingCost = 5; // Standard rate
            } else if (totalWeight > 2 && totalWeight <= 10) {
                shippingCost = 15; // Heavy rate
            } else {
                shippingCost = 25; // Bulk rate
            }
            console.log("Shipping to USA.");
        } else if (shippingAddress.country === 'Canada') {
            shippingCost = totalWeight * 5; // $5 per kg
            console.log("Shipping to Canada.");
        } else {
            shippingCost = totalWeight * 10; // International rate
            console.log("International shipping.");
        }
    }

    if (promoCode === 'FREESHIP' && shippingCost > 0) {
        shippingCost = 0;
        console.log("Applied 'FREESHIP' promo, shipping cost is now 0.");
    }

    if (hasSubscription) {
        shippingCost = 0; // Subscriptions always have free shipping
        console.log("Subscription detected, free shipping applied.");
    }

    console.log(`Shipping Cost: ${shippingCost}`);
    const finalTotal = totalPrice + shippingCost;
    console.log(`--- FINAL TOTAL: ${finalTotal} ${currency} ---`);

    // 5. Process Payment
    console.log("--- Processing Payment ---");
    let paymentSuccess = false;
    if (paymentType === 'CreditCard') {
        // Complex logic to call a credit card gateway
        console.log(`Charging ${finalTotal} to credit card ending in ${user.cc_info.last4}...`);
        const gatewayResponse = creditCardGateway.charge(finalTotal, user.cc_info.token, currency);
        if (gatewayResponse.status === 'success') {
            paymentSuccess = true;
            console.log("Credit card payment successful.");
        } else {
            console.error("Credit card payment failed:", gatewayResponse.error);
        }
    } else if (paymentType === 'PayPal') {
        // Logic to redirect to PayPal or use PayPal API
        console.log(`Initiating PayPal payment for ${finalTotal}...`);
        const payPalResponse = payPalAPI.createPayment(finalTotal, user.paypal_token, currency);
        if (payPalResponse.id) {
            paymentSuccess = true;
            console.log("PayPal payment initiated.");
        } else {
            console.error("PayPal payment failed:", payPalResponse.error);
        }
    } else if (paymentType === 'GiftCard') {
        // Logic to check gift card balance and redeem
        const cardBalance = giftCardService.getBalance(user.gift_card.number);
        if (cardBalance >= finalTotal) {
            giftCardService.redeem(user.gift_card.number, finalTotal);
            paymentSuccess = true;
            console.log("Gift card payment successful.");
        } else {
            console.error("Gift card has insufficient funds.");
        }
    } else {
        console.error(`Unsupported payment type: ${paymentType}`);
    }

    if (!paymentSuccess) {
        return { success: false, error: "Payment failed." };
    }

    // 6. Post-payment actions
    console.log("--- Finalizing Order ---");
    const orderId = `ORD-${Date.now()}`;

    // 6a. Log to database
    console.log(`Logging order ${orderId} to database...`);
    Database.save('orders', {
        orderId,
        userId: user.id,
        total: finalTotal,
        items: items.map(i => i.id),
        shippingAddress,
        notes: customerNotes,
        paymentType,
        status: 'completed'
    });

    // 6b. Generate Invoice
    if (shouldGenerateInvoice) {
        console.log("Generating invoice...");
        const invoice = new Invoice({ orderId, user, items, finalTotal });
        invoice.generatePDF();
        console.log(`Invoice ${invoice.id} created.`);
    }

    // 6c. Send Confirmation Email
    if (shouldSendEmail) {
        console.log(`Sending confirmation email to ${user.email}...`);
        EmailService.send(
            user.email,
            'Your Order Confirmation',
            `Thank you for your order, #${orderId}. Your total was ${finalTotal} ${currency}.`
        );
        console.log("Email sent.");
    }

    console.log("--- Order Process Completed Successfully ---");
    return { success: true, orderId, total: finalTotal };
}


// --- Mock External Services (for demonstration purposes) ---
const creditCardGateway = { charge: (amount, token, currency) => ({ status: 'success' }) };
const payPalAPI = { createPayment: (amount, token, currency) => ({ id: 'PAY-123' }) };
const giftCardService = { getBalance: (num) => 500, redeem: (num, amount) => true };
const Database = { save: (table, data) => console.log(`Saved to ${table}`) };
class Invoice { constructor(data) { this.id = `INV-${data.orderId}` }; generatePDF() { console.log(`Generated PDF for ${this.id}`) } };
const EmailService = { send: (to, subject, body) => true }; 