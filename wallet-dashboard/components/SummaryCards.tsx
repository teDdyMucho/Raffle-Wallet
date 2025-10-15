import { FC } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ClockIcon, 
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface SummaryCardsProps {
  totalBalance: number;
  approvedThisMonth: number;
  pendingRequests: number;
  topReferrer: { referral_code: string; total_amount: number } | null;
}

const SummaryCards: FC<SummaryCardsProps> = ({
  totalBalance,
  approvedThisMonth,
  pendingRequests,
  topReferrer
}) => {
  // Format currency in Philippine Peso
  const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amountCents / 100);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const cards = [
    {
      title: "Total Wallet Balance",
      value: formatCurrency(totalBalance),
      change: "+12.5%",
      changeType: "increase",
      icon: BanknotesIcon,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      iconBg: "from-blue-500 to-cyan-600",
      description: "From all approved transactions"
    },
    {
      title: "Approved This Month",
      value: formatCurrency(approvedThisMonth),
      change: "+8.2%",
      changeType: "increase",
      icon: ArrowTrendingUpIcon,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
      iconBg: "from-emerald-500 to-green-600",
      description: "Total approved this month"
    },
    {
      title: "Pending Requests",
      value: pendingRequests.toString(),
      change: "-2.1%",
      changeType: "decrease",
      icon: ClockIcon,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      iconBg: "from-amber-500 to-orange-500",
      description: "Awaiting approval"
    },
    {
      title: "Top Referrer",
      value: topReferrer ? topReferrer.referral_code : 'N/A',
      change: topReferrer ? formatCurrency(topReferrer.total_amount) : '₱0.00',
      changeType: "neutral",
      icon: UserGroupIcon,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      iconBg: "from-purple-500 to-pink-600",
      description: topReferrer ? 'Total referral volume' : 'No referrals yet'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ 
            y: -5,
            transition: { duration: 0.2 }
          }}
          className={`relative overflow-hidden modern-card bg-gradient-to-br ${card.bgGradient} group cursor-pointer`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white dark:via-slate-700 to-transparent"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.iconBg} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              
              {/* Change Indicator */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                card.changeType === 'increase' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                  : card.changeType === 'decrease'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {card.changeType === 'increase' && <ArrowUpIcon className="h-3 w-3" />}
                {card.changeType === 'decrease' && <ArrowDownIcon className="h-3 w-3" />}
                <span>{card.change}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {card.title}
            </h3>

            {/* Value */}
            <div className="mb-3">
              <p className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {card.value}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {card.description}
            </p>

            {/* Hover Effect Line */}
            <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${card.gradient} group-hover:w-full transition-all duration-300`}></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/10 dark:from-slate-700/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-white/5 dark:from-slate-700/5 to-transparent rounded-full blur-lg group-hover:scale-110 transition-transform duration-500"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
