import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentApi } from '../../api/paymentApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/common/StatCard';
import { CreditCard, DollarSign, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  PAID: {
    label: 'Paid',
    className: 'bg-accent-50 text-accent-700 border-accent-200/60',
    icon: CheckCircle2,
    iconClass: 'text-accent-500',
  },
  PENDING: {
    label: 'Pending',
    className: 'bg-warning-50 text-warning-700 border-warning-200/60',
    icon: Clock,
    iconClass: 'text-warning-500',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-danger-50 text-danger-700 border-danger-100',
    icon: XCircle,
    iconClass: 'text-danger-500',
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-navy-50 text-navy-600 border-navy-200/60',
    icon: AlertCircle,
    iconClass: 'text-navy-400',
  },
};

function PaymentCard({ payment }) {
  const cfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;

  return (
    <div className="bg-white border border-navy-100 rounded-2xl p-4 sm:p-5 hover:border-navy-200 transition-all shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 border border-primary-100/60 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-bold text-navy-900">
              ${Number(payment.amount).toFixed(2)}{' '}
              <span className="text-xs font-semibold text-navy-400">{payment.currency || 'USD'}</span>
            </p>
            <p className="text-xs text-navy-500 mt-0.5 font-medium uppercase">
              {payment.paymentMethod || 'Card'}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.className}`}
        >
          <StatusIcon className={`w-3.5 h-3.5 ${cfg.iconClass}`} />
          {cfg.label}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-navy-100 flex flex-wrap items-center gap-3 text-xs text-navy-500">
        {payment.id && (
          <span className="font-mono font-semibold text-navy-700">
            #{payment.id.slice(0, 12)}
          </span>
        )}
        {payment.appointmentId && (
          <span className="text-navy-400">
            Appt #{payment.appointmentId.slice(0, 8)}
          </span>
        )}
        {payment.createdAt && (
          <span className="ml-auto">
            {new Date(payment.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PatientPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await paymentApi.getByPatient(user.id);
        setPayments(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, [user?.id]);

  const totalSpent = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const paidCount = payments.filter((p) => p.status === 'PAID').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Payment History</h1>
        <p className="text-sm text-navy-500 mt-1">
          Review your invoices, receipts, and payment transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={`$${totalSpent.toFixed(2)}`}
          description="Settled channeling fees"
          iconClassName="bg-accent-50 text-accent-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Successful Payments"
          value={paidCount}
          description="Confirmed transactions"
          iconClassName="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          description="Awaiting confirmation"
          iconClassName="bg-warning-50 text-warning-600"
        />
      </div>

      {/* Payment list */}
      {loading ? (
        <Loader text="Loading payment transactions..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment history yet"
          description="Your payments for appointment channelings will appear here after booking."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
            {payments.length} {payments.length === 1 ? 'transaction' : 'transactions'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {payments.map((p) => (
              <PaymentCard key={p.id} payment={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
