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
    <div className="modern-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Analytics</h3>
          <p className="text-slate-500 text-sm">Trends and top performers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-slate-200/60 p-4 bg-white">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Daily Approved Cash-Ins</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCashInData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis tickFormatter={(v) => `₱${v}`} stroke="#64748b" />
                <Tooltip formatter={(v: any) => [`₱${v}`, 'Amount']} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="Cash-In Amount" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 p-4 bg-white">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Top Referrers</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topReferrersData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="code" stroke="#64748b" />
                <YAxis tickFormatter={(v) => `₱${v}`} stroke="#64748b" />
                <Tooltip formatter={(v: any) => [`₱${v}`, 'Amount']} />
                <Legend />
                <Bar dataKey="amount" name="Referral Amount" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
