import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount: number;
  staffId: string;
  roomId: string;
  feedback?: string;
  rating?: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentForm({
  amount,
  staffId,
  roomId,
  feedback,
  rating,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });

    if (error) {
      onError(error.message);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100,
          staffId,
          roomId,
          feedback,
          rating,
          payment_method_id: paymentMethod.id,
        }),
      });

      const { clientSecret } = await response.json();

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

      if (confirmError) {
        onError(confirmError.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError('Payment failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-[#00B227] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#00B227]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Pay ${amount}
      </button>
    </form>
  );
}