import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QFZt8GMXInbuTdwO7A384TlV2KK4bCX4CrEjO6iEjNfC6BolYR3E23L3txmgMl5OouOvxcx691j22hUdffIAJcd00QlXj7feI');

interface PaymentData {
  amount: number;
  staffId: string;
  roomId: string;
  feedback?: string;
  rating?: string;
}

export const createPaymentIntent = async (data: PaymentData) => {
  try {
    // In production, this would call your backend API
    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount * 100, // Convert to cents
        staffId: data.staffId,
        roomId: data.roomId,
        feedback: data.feedback,
        rating: data.rating
      }),
    });

    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const processPayment = async (data: PaymentData) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to initialize');

    const clientSecret = await createPaymentIntent(data);

    return stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          token: 'tok_visa' // For testing only
        },
      },
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
};