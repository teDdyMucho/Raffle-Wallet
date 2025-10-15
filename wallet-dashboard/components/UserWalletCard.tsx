import { FC, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { getTotalBalance, fetchTransactions } from '../utils/supabase';

interface UserWalletCardProps {
  userId: string;
  userName: string;
  onCashIn: () => void;
}

const UserWalletCard: FC<UserWalletCardProps> = ({ userId, userName, onCashIn }) => {
  const [balance, setBalance] = useState(0);
  const [lastTopUp, setLastTopUp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const userBalance = await getTotalBalance(userId);
        setBalance(userBalance);
        const transactions = await fetchTransactions();
        const userTransactions = transactions
          .filter((t) => t.user_id === userId && t.status === 'approved')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setLastTopUp(userTransactions[0]?.created_at ?? null);
      } catch (error) {
        console.error('Error loading user wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [userId]);

  const formatCurrency = (amountCents: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amountCents / 100);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try { return format(new Date(dateString), 'MMM dd, yyyy'); } catch { return dateString; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="modern-card p-6 relative overflow-hidden"
    >
      {/* Decorative gradients */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 w-44 h-44 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-3 mr-4 shadow-lg shadow-indigo-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{userName}</h3>
            <p className="text-slate-500 text-sm">ID: {userId}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-10 bg-slate-200 rounded w-full mt-6"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-slate-500 text-sm">Current Balance</p>
              <h4 className="text-3xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {formatCurrency(balance)}
              </h4>
            </div>

            <div className="mb-8">
              <p className="text-slate-500 text-sm">Last Top-Up</p>
              <p className="text-slate-800">{formatDate(lastTopUp)}</p>
            </div>

            <button onClick={onCashIn} className="btn-primary w-full flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 1h6v4H7V6zm6 6H7v2h6v-2z" clipRule="evenodd" />
                <path d="M7 9h6v2H7V9z" />
              </svg>
              Cash-In Again
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default UserWalletCard;
