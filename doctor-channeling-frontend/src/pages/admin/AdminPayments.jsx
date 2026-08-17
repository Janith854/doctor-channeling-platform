import { useState, useEffect } from 'react';
import { userApi } from '../../api/authApi';
import { paymentApi } from '../../api/paymentApi';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { DollarSign, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundId, setRefundId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const userRes = await userApi.getAllUsers().catch(() => ({ data: { data: [] } }));
      const userList = userRes.data?.data || [];

      // Query payments across patients
      const payPromises = userList.map((u) =>
        paymentApi.getByPatient(u.id).catch(() => ({ data: { data: [] } }))
      );
      const payResults = await Promise.all(payPromises);
      const allPayments = payResults.flatMap((r) => r.data?.data || []);
      setPayments(allPayments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async () => {
    if (!refundId) return;
    try {
      setProcessing(true);
      await paymentApi.refund(refundId, { reason: 'Admin requested full refund' });
      toast.success('Payment refunded successfully');
      setRefundId(null);
      fetchPayments();
    } catch (err) {
      toast.error('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      render: (row) => <span className="font-mono text-xs text-navy-800">#{row.id?.slice(0, 10)}</span>,
    },
    {
      key: 'appointmentId',
      label: 'Appointment ID',
      render: (row) => <span className="font-mono text-xs text-navy-500">#{row.appointmentId?.slice(0, 8)}</span>,
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
      key: 'method',
      label: 'Method',
      render: (row) => <span className="text-xs uppercase font-semibold text-navy-600">{row.paymentMethod || 'CARD'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end">
          {row.status === 'PAID' && (
            <button
              onClick={() => setRefundId(row.id)}
              className="text-xs text-danger-600 hover:text-danger-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Payment & Revenue Audit</h1>
          <p className="text-sm text-navy-500 mt-1">Cross-platform financial settlements and payment transactions</p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border border-navy-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">Processed Revenue</span>
            <span className="text-lg font-extrabold text-navy-900">${totalRevenue.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader text="Auditing transactions..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No payment records found"
          description="Patient payments and channeling transaction receipts will show up here."
        />
      ) : (
        <Table columns={columns} data={payments} />
      )}

      <ConfirmDialog
        isOpen={!!refundId}
        onClose={() => setRefundId(null)}
        onConfirm={handleRefund}
        loading={processing}
        title="Refund Payment"
        message="Are you sure you want to refund this transaction back to the patient?"
        confirmText="Confirm Refund"
      />
    </div>
  );
}
