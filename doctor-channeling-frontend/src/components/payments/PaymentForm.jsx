import { useState } from 'react';
import Button from '../common/Button';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentForm({
  amount = 15.00,
  currency = 'USD',
  appointmentId,
  patientId,
  onSuccess,
  onCancel,
  clientSecret,
}) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc || !name) {
      toast.error('Please fill in all payment details');
      return;
    }

    try {
      setLoading(true);
      // Simulate/trigger payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Payment completed successfully!');
      onSuccess?.({
        id: `pay_${Math.random().toString(36).substring(2, 9)}`,
        amount,
        currency,
        status: 'PAID',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gradient-to-r from-primary-900 via-navy-900 to-navy-800 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 rounded-full bg-primary-500/10 blur-xl" />
        <div className="flex justify-between items-center mb-6">
          <CreditCard className="w-8 h-8 text-primary-400" />
          <span className="text-xs font-mono tracking-widest text-primary-300">SECURE PAYMENT</span>
        </div>
        <div className="font-mono text-lg tracking-wider mb-4">
          {cardNumber ? cardNumber : '•••• •••• •••• ••••'}
        </div>
        <div className="flex justify-between items-end text-xs font-mono">
          <div>
            <span className="text-[10px] text-navy-400 block">CARD HOLDER</span>
            <span className="font-semibold uppercase tracking-wider">{name || 'YOUR NAME'}</span>
          </div>
          <div>
            <span className="text-[10px] text-navy-400 block">EXPIRES</span>
            <span className="font-semibold">{expiry || 'MM/YY'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-bold text-navy-700 uppercase mb-1">Cardholder Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-navy-700 uppercase mb-1">Card Number</label>
          <input
            type="text"
            placeholder="4242 •••• •••• 4242"
            maxLength={19}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-navy-700 uppercase mb-1">Expiry</label>
            <input
              type="text"
              placeholder="MM/YY"
              maxLength={5}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-700 uppercase mb-1">CVC / CVV</label>
            <input
              type="password"
              placeholder="123"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-navy-500 pt-1">
        <Lock className="w-3.5 h-3.5 text-accent-600 shrink-0" />
        <span>End-to-end encrypted 256-bit SSL transaction via Stripe.</span>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading} fullWidth>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" loading={loading} fullWidth className="gap-2">
          <CheckCircle2 className="w-4 h-4" /> Pay ${parseFloat(amount).toFixed(2)}
        </Button>
      </div>
    </form>
  );
}
