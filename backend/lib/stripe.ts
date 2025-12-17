
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
    if (!stripeInstance) {
        const apiKey = process.env.STRIPE_SECRET_KEY;
        if (!apiKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        stripeInstance = new Stripe(apiKey, {
            apiVersion: '2025-11-17.clover',
            typescript: true,
        });
    }
    return stripeInstance;
};

// For backward compatibility
export const stripe = new Proxy({} as Stripe, {
    get: (target, prop) => {
        return getStripe()[prop as keyof Stripe];
    }
});
