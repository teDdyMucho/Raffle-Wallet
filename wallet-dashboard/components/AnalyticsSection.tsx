import { FC, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays, parseISO, isValid } from 'date-fns';
import { WalletTransaction } from '../utils/supabase';

interface AnalyticsSectionProps {
  transactions: WalletTransaction[];
}

const AnalyticsSection: FC<AnalyticsSectionProps> = ({ transactions }) => {
  const dailyCashInData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return { date, dateString: format(date, 'MMM dd'), amount: 0 };
    });

    transactions
      .filter((t) => t.status === 'approved')
      .forEach((t) => {
        const d = parseISO(t.created_at);
        if (!isValid(d)) return;
        const idx = days.findIndex((x) => format(x.date, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'));
        if (idx !== -1) days[idx].amount += t.amount_cents / 100;
      });

    return days.map((d) => ({ date: d.dateString, amount: d.amount }));
  }, [transactions]);

  const topReferrersData = useMemo(() => {
    const m = new Map<string, number>();
    transactions
      .filter((t) => t.status === 'approved' && t.referral_code)
      .forEach((t) => m.set(t.referral_code as string, (m.get(t.referral_code as string) || 0) + t.amount_cents));
    return Array.from(m.entries())
      .map(([code, amount]) => ({ code, amount: amount / 100 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="modern-card p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-3xl font-black text-black dark:text-white mb-2 bg-gradient-to-r from-black via-red-600 to-black dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent">Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Trends and top performers</p>
          <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-gray-500 rounded-full mt-2"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border-2 border-gray-200/60 dark:border-gray-800/60 p-6 bg-white dark:bg-black shadow-2xl shadow-gray-200/20 dark:shadow-black/40 hover:shadow-2xl hover:shadow-gray-300/30 dark:hover:shadow-black/60 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h4 className="text-lg font-bold text-black dark:text-white mb-4 relative z-10">Daily Approved Cash-Ins</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCashInData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis tickFormatter={(v) => `₱${v}`} stroke="#64748b" />
                <Tooltip formatter={(v: any) => [`₱${v}`, 'Amount']} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="Cash-In Amount" stroke="#dc2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-gray-200/60 dark:border-gray-800/60 p-6 bg-white dark:bg-black shadow-2xl shadow-gray-200/20 dark:shadow-black/40 hover:shadow-3xl hover:shadow-gray-300/30 dark:hover:shadow-black/60 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h4 className="text-lg font-bold text-black dark:text-white mb-4 relative z-10">Top Referrers</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topReferrersData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="code" stroke="#64748b" />
                <YAxis tickFormatter={(v) => `₱${v}`} stroke="#64748b" />
                <Tooltip formatter={(v: any) => [`₱${v}`, 'Amount']} />
                <Legend />
                <Bar dataKey="amount" name="Referral Amount" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
