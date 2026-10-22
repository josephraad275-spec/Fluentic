import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PurchasePlan, PaymentMethod, UserProfile } from '../types';
import { audioSynth } from '../services/audioSynthesizer';

interface PaymentModalProps {
  isOpen: boolean;
  plan: PurchasePlan | null;
  user: UserProfile;
  onClose: () => void;
  onSuccess: (updatedUser: UserProfile) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  plan,
  user,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !plan) return null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState(user.name || '');
  const [paypalEmail, setPaypalEmail] = useState(user.email || '');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length >= 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    return clean;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod,
          cardLast4: paymentMethod === 'credit-card' ? cardNumber.replace(/\s/g, '').slice(-4) || '4242' : undefined,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment processing failed');
      }

      setTransactionId(data.transactionId);
      setIsCompleted(true);
      audioSynth.playSuccessChime();

      // Apply upgrades
      let updatedUser: UserProfile = { ...user };
      if (plan.type === 'gems' && plan.amount) {
        updatedUser.gems += plan.amount;
      } else if (plan.type === 'subscription') {
        updatedUser.isPro = true;
        const now = new Date();
        const durationMonths = plan.id === 'pro-1year' ? 12 : plan.id === 'pro-6month' ? 6 : 1;
        now.setMonth(now.getMonth() + durationMonths);
        updatedUser.proExpiryDate = now.toISOString();
      }

      setTimeout(() => {
        onSuccess(updatedUser);
      }, 1500);

    } catch (err: any) {
      setErrorMessage(err.message || 'Payment gateway connection error.');
      audioSynth.playErrorTone();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Secure Checkout</h3>
              <p className="text-xs text-slate-500">256-Bit Encrypted Payment Channel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleted ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Transaction Approved!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your order for <strong>{plan.name}</strong> was processed successfully. Your account balance and privileges are updated.
            </p>
            <div className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-mono text-xs">
              Tx: {transactionId || 'TXN-00000000'}
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleCheckout} className="p-6 space-y-5">
            {/* Order Summary Item */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wide">Selected Plan</span>
                <div className="text-base font-black text-slate-900">{plan.name}</div>
                <div className="text-xs text-slate-600">{plan.duration || `${plan.amount} Gems`}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-blue-900 font-mono">${plan.priceUsd.toFixed(2)}</div>
                <span className="text-[10px] text-slate-500">USD one-time</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'credit-card', label: 'Card' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'google-pay', label: 'Google Pay' },
                  { id: 'apple-pay', label: 'Apple Pay' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === m.id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details Input Fields */}
            {paymentMethod === 'credit-card' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-blue-500 pl-10"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="12/28"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="•••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : paymentMethod === 'paypal' ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <label className="block text-xs font-bold text-amber-900">PayPal Account Email</label>
                <input
                  type="email"
                  required
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs text-slate-900 bg-white outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-amber-700">You will be redirected securely to authenticate with PayPal.</p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="font-bold text-slate-800 text-xs">
                  {paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay'} Express Checkout
                </div>
                <p className="text-xs text-slate-500">
                  Touch ID, Face ID, or biometric wallet confirmation will be invoked automatically upon proceeding.
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Security Guarantee Banner */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>TLS 1.3 Certified • End-to-End Encrypted Gateway • Instant Activation</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Pay ${plan.priceUsd.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
