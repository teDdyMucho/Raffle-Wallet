import { FC } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletTransaction } from '../utils/supabase';
import { exportTransactionsToCSV } from '../utils/exportCsv';

interface TransactionTableProps {
  transactions: WalletTransaction[];
  isLoading: boolean;
  onStatusUpdate: (id: number, status: 'approved' | 'pending' | 'rejected') => void;
}

const TransactionTable: FC<TransactionTableProps> = ({ transactions, isLoading, onStatusUpdate }) => {
  const formatCurrency = (amountCents: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format((amountCents || 0) / 100);

  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'MMM dd, yyyy h:mm a'); } catch { return dateString; }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'approved': return 'badge-approved';
      case 'pending': return 'badge-pending';
      case 'rejected': return 'badge-rejected';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600';
    }
  };

  const handleExportCSV = () => exportTransactionsToCSV(transactions);

  if (isLoading) {
    return (
      <div className="modern-card p-6">
        <div className="flex items-center gap-3"><div className="spinner"></div><p className="text-slate-600 dark:text-slate-400">Loading transactions…</p></div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="modern-card p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">No transactions found.</p>
      </div>
    );
  }

  // Segmented control button classes
  const baseSeg = 'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 focus:outline-none';
  const activeApproved = 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/25';
  const activePending = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25';
  const activeRejected = 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25';
  const inactive = 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow';

  const renderSegmented = (t: WalletTransaction) => {
    const isApproved = t.status === 'approved';
    const isPending = t.status === 'pending';
    const isRejected = t.status === 'rejected';
    const createdAt = new Date(t.created_at);
    const isOlderThan24h = Date.now() - createdAt.getTime() > 24 * 60 * 60 * 1000;
    const canReject = !isRejected && !isOlderThan24h; // allow reject for approved or pending within 24h

    return (
      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
        <button
          className={`${baseSeg} ${isApproved ? activeApproved : inactive}`}
          onClick={() => !isApproved && onStatusUpdate(t.id, 'approved')}
          aria-pressed={isApproved}
          title="Set status to Approved"
        >
          Approved
        </button>
        <button
          className={`${baseSeg} ${isPending ? activePending : inactive}`}
          onClick={() => !isPending && onStatusUpdate(t.id, 'pending')}
          aria-pressed={isPending}
          title="Set status to Pending"
        >
          Pending
        </button>
        <button
          className={`${baseSeg} ${isRejected ? activeRejected : inactive} ${!canReject && !isRejected ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !isRejected && canReject && onStatusUpdate(t.id, 'rejected')}
          aria-pressed={isRejected}
          disabled={!canReject && !isRejected}
          title={
            isRejected
              ? 'Already rejected'
              : isOlderThan24h
              ? 'Reject is only allowed within 24 hours of the request time'
              : 'Set status to Rejected'
          }
        >
          Reject
        </button>
      </div>
    );
  };

  return (
    <div className="table-modern">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">Showing {transactions.length} transactions</p>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="table-header">
            <tr>
              {['User ID','Amount (₱)','Method','Status','Referral Code','Date','Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {transactions.map((t) => {
                const statusText = t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Unknown';
                return (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="table-row"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">{t.user_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(t.amount_cents)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{t.method || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`badge ${getStatusBadgeClass(t.status)}`}>{statusText}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{t.referral_code || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{formatDate(t.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {renderSegmented(t)}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
