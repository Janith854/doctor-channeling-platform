import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentApi } from '../../api/paymentApi';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { CreditCard, DollarSign } from 'lucide-react';

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

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      render: (row) => <span className="font-mono text-xs text-navy-800">#{row.id?.slice(0, 10)}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-extrabold text-navy-900">
          ${Number(row.amount).toFixed(2)} {row.currency || 'USD'}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (row) => <span className="text-xs uppercase font-semibold text-navy-600">{row.paymentMethod || 'CARD'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => (
        <span className="text-xs text-navy-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Payment History</h1>
          <p className="text-sm text-navy-500 mt-1">Review your invoices, receipts, and payment transactions</p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border border-navy-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">Total Spent</span>
            <span className="text-lg font-extrabold text-navy-900">${totalSpent.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading payment transactions..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment history yet"
          description="Your transactions for appointment channelings will show up here."
        />
      ) : (
        <Table columns={columns} data={payments} />
      )}
    </div>
  );
}
