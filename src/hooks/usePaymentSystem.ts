import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface PaymentMethod {
  id: string;
  type: "card" | "digital_wallet" | "ev_charging_card" | "subscription";
  provider: "visa" | "mastercard" | "amex" | "apple_pay" | "google_pay" | "shell" | "bp" | "chargepe_plus";
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  isDefault: boolean;
  nickname?: string;
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  created_at: string;
  is_verified: boolean;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  payment_method_id: string;
  payment_method_type: string;
  gateway_transaction_id?: string;
  gateway_response?: any;
  created_at: string;
  processed_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  refund_reason?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  features: string[];
  discount_percentage: number;
  max_monthly_kwh?: number;
  popular?: boolean;
}

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  payment_intent_id: string;
  client_secret: string;
  payment_methods: PaymentMethod[];
  status: "requires_payment_method" | "requires_confirmation" | "requires_action" | "processing" | "succeeded" | "canceled";
  created_at: string;
  expires_at: string;
}

export const usePaymentSystem = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);

  // Mock subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "ChargePe Basic",
      description: "Perfect for occasional EV drivers",
      price: 0,
      billing_cycle: "monthly",
      features: ["Basic station access", "Standard charging rates", "Mobile app access"],
      discount_percentage: 0,
    },
    {
      id: "plus",
      name: "ChargePe Plus",
      description: "Great for daily commuters",
      price: 9.99,
      billing_cycle: "monthly",
      features: ["10% discount on charging", "Priority booking", "Advanced analytics", "Route planning"],
      discount_percentage: 10,
      max_monthly_kwh: 500,
      popular: true,
    },
    {
      id: "premium",
      name: "ChargePe Premium",
      description: "Ultimate experience for power users",
      price: 19.99,
      billing_cycle: "monthly",
      features: ["20% discount on charging", "Exclusive station access", "Concierge service", "Free roaming", "Family sharing"],
      discount_percentage: 20,
      max_monthly_kwh: 1000,
    },
  ];

  // Add payment method
  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, "id" | "created_at" | "is_verified">): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Date.now()}`,
        created_at: new Date().toISOString(),
        is_verified: Math.random() > 0.1, // 90% verification success rate
      };

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to add payment method" };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove payment method
  const removePaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to remove payment method" };
    } finally {
      setIsLoading(false);
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      })));
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to set default payment method" };
    } finally {
      setIsLoading(false);
    }
  };

  // Create payment session
  const createPaymentSession = async (
    amount: number,
    bookingId: string,
    currency: string = "USD"
  ): Promise<{ success: boolean; session?: PaymentSession; error?: string }> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const session: PaymentSession = {
        id: `ps_${Date.now()}`,
        amount,
        currency,
        payment_intent_id: `pi_${Date.now()}`,
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        payment_methods: paymentMethods.filter(pm => pm.is_verified),
        status: "requires_payment_method",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      };

      return { success: true, session };
    } catch (error) {
      return { success: false, error: "Failed to create payment session" };
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment
  const processPayment = async (
    sessionId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; transaction?: PaymentTransaction; error?: string }> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transaction: PaymentTransaction = {
        id: `txn_${Date.now()}`,
        booking_id: sessionId,
        user_id: user?.id || "",
        amount: Math.floor(Math.random() * 100) + 10, // Random amount between 10-110
        currency: "USD",
        status: "completed",
        payment_method_id: paymentMethodId,
        payment_method_type: "card",
        gateway_transaction_id: `gw_${Date.now()}`,
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      };

      setTransactions(prev => [transaction, ...prev]);
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: "Payment processing failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to plan
  const subscribeToPlan = async (planId: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (plan) {
        setSubscription(plan);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to subscribe to plan" };
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscription(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to cancel subscription" };
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment methods by type
  const getPaymentMethodsByType = useCallback((type: PaymentMethod['type']) => {
    return paymentMethods.filter(pm => pm.type === type);
  }, [paymentMethods]);

  // Get default payment method
  const getDefaultPaymentMethod = useCallback(() => {
    return paymentMethods.find(pm => pm.isDefault);
  }, [paymentMethods]);

  // Calculate savings with subscription
  const calculateSavings = useCallback((monthlyKwh: number, averagePricePerKwh: number) => {
    if (!subscription) return 0;
    
    const monthlyCost = monthlyKwh * averagePricePerKwh;
    const discount = monthlyCost * (subscription.discount_percentage / 100);
    const savings = discount - subscription.price;
    
    return Math.max(0, savings);
  }, [subscription]);

  // Initialize with some mock data
  useState(() => {
    if (paymentMethods.length === 0) {
      setPaymentMethods([
        {
          id: "pm_card_1",
          type: "card",
          provider: "visa",
          last4: "4242",
          brand: "Visa",
          expiry_month: 12,
          expiry_year: 2025,
          isDefault: true,
          nickname: "Personal Card",
          created_at: new Date().toISOString(),
          is_verified: true,
        },
        {
          id: "pm_wallet_1",
          type: "digital_wallet",
          provider: "apple_pay",
          isDefault: false,
          nickname: "Apple Pay",
          created_at: new Date().toISOString(),
          is_verified: true,
        },
      ]);
    }
  });

  return {
    paymentMethods,
    transactions,
    subscription,
    subscriptionPlans,
    isLoading,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    createPaymentSession,
    processPayment,
    subscribeToPlan,
    cancelSubscription,
    getPaymentMethodsByType,
    getDefaultPaymentMethod,
    calculateSavings,
  };
};
