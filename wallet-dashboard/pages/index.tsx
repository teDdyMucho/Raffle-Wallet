import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  fetchTransactions,
  WalletTransaction,
  updateTransactionStatus,
  getTotalBalance,
  getTopReferrer,
  supabase,
  TABLE,
} from '../utils/supabase';
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import TransactionTable from '../components/TransactionTable';
import NewCashInModal from '../components/NewCashInModal';
import AnalyticsSection from '../components/AnalyticsSection';
// Removed UserWalletCard

export default function Home() {
  const [baseTransactions, setBaseTransactions] = useState<WalletTransaction[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [approvedThisMonth, setApprovedThisMonth] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [topReferrer, setTopReferrer] = useState<{ referral_code: string; total_amount: number } | null>(null);
  const [overrides, setOverrides] = useState<Record<number, Partial<WalletTransaction>>>({});

  // Mock user for demo purposes (replace with auth if needed)
  const currentUser = { id: 'user123', name: 'John Doe' };

  // Apply overrides to rows
  const withOverrides = (rows: WalletTransaction[]) => rows.map((r) => (overrides[r.id] ? { ...r, ...overrides[r.id] } : r));

  // Compute dashboard metrics from current (possibly overridden) transactions
  const computeMetrics = (rows: WalletTransaction[]) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const approvedRows = rows.filter((t) => t.status === 'approved');
    const total = approvedRows.reduce((sum, t) => sum + t.amount_cents, 0);
    setTotalBalance(total);
    const approvedThisMonthTotal = approvedRows.filter((t) => new Date(t.created_at) >= firstDayOfMonth).reduce((sum, t) => sum + t.amount_cents, 0);
    setApprovedThisMonth(approvedThisMonthTotal);
    const pendingCount = rows.filter((t) => t.status === 'pending').length;
    setPendingRequests(pendingCount);
  };

  // Centralized loader we can call from Refresh button
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTransactions();
      setBaseTransactions(data);
      const merged = withOverrides(data);
      setTransactions(merged);
      setFilteredTransactions(merged);
      computeMetrics(merged);

      const topRef = await getTopReferrer();
      setTopReferrer(topRef);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-derive transactions and metrics when baseTransactions or overrides change
  useEffect(() => {
    const merged = withOverrides(baseTransactions);
    setTransactions(merged);
    computeMetrics(merged);
  }, [baseTransactions, overrides]);

  // Realtime subscription (maintain baseTransactions; overrides applied in separate effect)
  useEffect(() => {
    const channel = supabase
      .channel('realtime:user_wallet')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (payload: any) => {
        const row = payload.new as WalletTransaction;
        setBaseTransactions((prev) => [row, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, (payload: any) => {
        const row = payload.new as WalletTransaction;
        setBaseTransactions((prev) => prev.map((t) => (t.id === row.id ? row : t)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: TABLE }, (payload: any) => {
        const row = payload.old as WalletTransaction;
        setBaseTransactions((prev) => prev.filter((t) => t.id !== (row?.id as any)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filters (apply to already-merged transactions)
  useEffect(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.user_id.toLowerCase().includes(term) ||
          t.method.toLowerCase().includes(term) ||
          (t.referral_code && t.referral_code.toLowerCase().includes(term))
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter((t) => new Date(t.created_at) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter((t) => new Date(t.created_at) <= new Date(dateRange.end));
    }

    setFilteredTransactions(filtered);
  }, [searchTerm, dateRange, transactions]);

  // Approve / Reject / Pending
  const handleStatusUpdate = async (id: number, newStatus: 'approved' | 'pending' | 'rejected') => {
    const tx = baseTransactions.find((t) => t.id === id);
    const within24h = tx ? Date.now() - new Date(tx.created_at).getTime() <= 24 * 60 * 60 * 1000 : false;

    if (newStatus === 'rejected' && within24h) {
      setOverrides((prev) => ({ ...prev, [id]: { status: 'rejected', amount_cents: 0 } }));
      try {
        const updated = await updateTransactionStatus(id, newStatus);
        if (updated) {
          setBaseTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
          setOverrides((prev) => {
            const next = { ...prev } as Record<number, Partial<WalletTransaction>>;
            delete next[id];
            return next;
          });
        }
      } catch (error) {
        console.error('Error updating transaction status:', error);
      }
      return;
    }

    try {
      const updated = await updateTransactionStatus(id, newStatus);
      if (updated) {
        setBaseTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  // After modal submit
  const handleNewCashIn = (newTransaction: WalletTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
    setPendingRequests((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Head>
        <title>Raffle Wallet Dashboard </title>
        <meta name="description" content="Advanced wallet dashboard for managing user transactions in real-time" />
        <link rel="icon" type="image/png" href="/images/allen%20(1).png" />
      </Head>

      {/* Enhanced Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/15 to-red-600/15 dark:from-red-900/10 dark:to-red-800/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-400/15 to-gray-500/15 dark:from-gray-800/10 dark:to-gray-700/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-red-400/5 to-gray-400/5 dark:from-red-900/5 dark:to-gray-800/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-red-500/20 dark:bg-red-400/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 right-32 w-6 h-6 bg-gray-400/20 dark:bg-gray-600/20 rotate-45 animate-bounce" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 left-20 w-3 h-3 bg-red-400/30 dark:bg-red-500/30 rounded-full animate-bounce" style={{animationDelay: '5s'}}></div>
      </div>

      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <main className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-gray-500/5 dark:from-red-900/10 dark:via-transparent dark:to-gray-800/10 rounded-3xl blur-xl"></div>
          <div className="relative z-10 py-12 px-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-7xl font-black text-black dark:text-white mb-6 leading-tight bg-gradient-to-r from-black via-red-600 to-black dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent"
            >
              Welcome to Your Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto font-medium"
            >
              Manage your wallet transactions with powerful insights and real-time updates
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center"
            >
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-gray-500 rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SummaryCards
            totalBalance={totalBalance}
            approvedThisMonth={approvedThisMonth}
            pendingRequests={pendingRequests}
          />
        </motion.div>

        {/* Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-8 bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50 dark:from-gray-900/50 dark:via-black dark:to-gray-900/50 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-200/30 dark:shadow-black/50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-black dark:text-white mb-3 bg-gradient-to-r from-black via-red-600 to-black dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent">Transaction Management</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Monitor and approve user cash-in requests</p>
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-gray-500 rounded-full mt-3"></div>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <button
                onClick={loadData}
                className="btn-secondary flex items-center gap-3 text-sm group"
                title="Refresh data from Supabase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a7 7 0 1112.452 4.391l1.658 1.658a1 1 0 01-1.414 1.414l-3.182-3.182a1 1 0 01-.293-.707V9a1 1 0 112 0v2.586A5 5 0 1010 5a1 1 0 110-2 7 7 0 00-7 7z" clipRule="evenodd" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>

          <TransactionTable 
            transactions={filteredTransactions}
            isLoading={isLoading}
            onStatusUpdate={handleStatusUpdate}
          />
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <AnalyticsSection transactions={transactions} />
        </motion.div>
      </main>

      <NewCashInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewCashIn}
        userId={currentUser.id}
      />
    </div>
  );
}
