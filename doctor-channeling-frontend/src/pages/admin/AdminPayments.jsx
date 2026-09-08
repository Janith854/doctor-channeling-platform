import { useState, useEffect } from 'react';
import { userApi } from '../../api/authApi';
import { paymentApi } from '../../api/paymentApi';
import Table from '../../components/common/Table';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/appointments/StatusBadge';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import {
  DollarSign,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundId, setRefundId] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      toast.error('Failed to load payments ledger');
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
      toast.success('Payment successfully refunded to patient');
      setRefundId(null);
      fetchPayments();
    } catch (err) {
      toast.error('Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  // Financial statistics
  const paidPayments = payments.filter((p) => p.status === 'PAID');
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const failedOrRefunded = payments.filter(
    (p) => p.status === 'FAILED' || p.status === 'REFUNDED'
  );
  const totalRevenue = paidPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const idMatch = p.id?.toLowerCase().includes(q);
      const apptMatch = p.appointmentId?.toLowerCase().includes(q);
      const transRefMatch = p.transactionReference?.toLowerCase().includes(q);
      if (!idMatch && !apptMatch && !transRefMatch) return false;
    }
    return true;
  });

  const columns = [
    {
      key: 'id',
      label: 'Transaction Reference',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-navy-800 block">
            #{row.transactionReference || row.id?.slice(0, 10)}
          </span>
          <span className="text-[10px] text-navy-400">ID: {row.id?.slice(0, 8)}</span>
        </div>
      ),
    },
    {
      key: 'appointmentId',
      label: 'Appt Ref',
      render: (row) => (
        <span className="font-mono text-xs text-primary-700 font-medium">
          #{row.appointmentId?.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount Paid',
      render: (row) => (
        <span className="font-bold text-navy-900 text-xs">
          ${Number(row.amount).toFixed(2)}{' '}
          <span className="text-[10px] text-navy-400">{row.currency || 'USD'}</span>
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (row) => (
        <span className="text-xs uppercase font-semibold text-navy-600 bg-navy-50 px-2 py-0.5 rounded border border-navy-200/60">
          {row.paymentMethod || 'CARD'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Payment Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end">
          {row.status === 'PAID' ? (
            <button
              onClick={() => setRefundId(row.id)}
              className="text-xs text-danger-600 hover:text-danger-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refund
            </button>
          ) : (
            <span className="text-xs text-navy-400 italic">None</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue & Payments Audit"
        subtitle="Platform transaction auditing, patient channeling fees, and settlement ledgers"
      />

      {/* 4 Financial Stat Cards per Spec */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description="Settled consultation fees"
          iconClassName="bg-accent-50 text-accent-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Successful Payments"
          value={paidPayments.length}
          description="Paid transactions"
          iconClassName="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Payments"
          value={pendingPayments.length}
          description="Awaiting gateway clearance"
          iconClassName="bg-warning-50 text-warning-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Refunds & Failed"
          value={failedOrRefunded.length}
          description="Disputed or returned"
          iconClassName="bg-danger-50 text-danger-600"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-navy-100 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search transaction or appt ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-navy-50/50 border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-navy-900 placeholder:text-navy-400"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-navy-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-navy-50/50 border border-navy-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-navy-700"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid / Settled</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-navy-500 hover:text-navy-800"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Loader text="Auditing transaction records..." />
      ) : (
        <Table
          columns={columns}
          data={filteredPayments}
          emptyTitle="No payment records found"
          emptyMessage="Transactions processed by patients will appear in this audit ledger."
        />
      )}

      <ConfirmDialog
        isOpen={!!refundId}
        onClose={() => setRefundId(null)}
        onConfirm={handleRefund}
        loading={processing}
        title="Process Full Refund"
        message="Are you sure you want to refund this consultation payment back to the patient?"
        confirmText="Confirm Refund"
      />
    </div>
  );
}
