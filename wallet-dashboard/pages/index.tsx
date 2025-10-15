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
import UserWalletCard from '../components/UserWalletCard';

export default function Home() {
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

  // Mock user for demo purposes (replace with auth if needed)
  const currentUser = { id: 'user123', name: 'John Doe' };

  // Centralized loader we can call from Refresh button
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
      setFilteredTransactions(data);

      const total = await getTotalBalance();
      setTotalBalance(total);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const approvedThisMonthTotal = data
        .filter((t) => t.status === 'approved' && new Date(t.created_at) >= firstDayOfMonth)
        .reduce((sum, t) => sum + t.amount_cents, 0);
      setApprovedThisMonth(approvedThisMonthTotal);

      const pendingCount = data.filter((t) => t.status === 'pending').length;
      setPendingRequests(pendingCount);

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

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime:user_wallet')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (payload: any) => {
        const row = payload.new as WalletTransaction;
        setTransactions((prev) => [row, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, (payload: any) => {
        const row = payload.new as WalletTransaction;
        setTransactions((prev) => prev.map((t) => (t.id === row.id ? row : t)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: TABLE }, (payload: any) => {
        const row = payload.old as WalletTransaction;
        setTransactions((prev) => prev.filter((t) => t.id !== (row?.id as any)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filters
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
    try {
      const updated = await updateTransactionStatus(id, newStatus);
      if (updated) {
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Head>
        <title>Wallet Dashboard - Modern Finance Management</title>
        <meta name="description" content="Advanced wallet dashboard for managing user transactions in real-time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <main className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-indigo-600 dark:from-slate-200 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Manage your wallet transactions with powerful insights and real-time updates</p>
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
            topReferrer={topReferrer}
          />
        </motion.div>

        {/* Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Transaction Management</h2>
              <p className="text-slate-600 dark:text-slate-400">Monitor and approve user cash-in requests</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="btn-secondary flex items-center gap-2"
                title="Refresh data from Supabase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a7 7 0 1112.452 4.391l1.658 1.658a1 1 0 01-1.414 1.414l-3.182-3.182a1 1 0 01-.293-.707V9a1 1 0 112 0v2.586A5 5 0 1010 5a1 1 0 110-2 7 7 0 00-7 7z" clipRule="evenodd" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Cash-In Request
              </button>
            </div>
          </div>

          <TransactionTable 
            transactions={filteredTransactions}
            isLoading={isLoading}
            onStatusUpdate={handleStatusUpdate}
          />
        </motion.div>

        {/* Analytics and User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          <div className="xl:col-span-2">
            <AnalyticsSection transactions={transactions} />
          </div>
          <div>
            <UserWalletCard 
              userId={currentUser.id}
              userName={currentUser.name}
              onCashIn={() => setIsModalOpen(true)}
            />
          </div>
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
