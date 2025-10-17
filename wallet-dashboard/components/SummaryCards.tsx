import { FC } from 'react';
import { motion, Variants, easeOut } from 'framer-motion';
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
}

const SummaryCards: FC<SummaryCardsProps> = ({
  totalBalance,
  approvedThisMonth,
  pendingRequests
}) => {
  // Format currency in Philippine Peso
  const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amountCents / 100);
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: easeOut
      }
    })
  };

  const cards = [
    {
      title: "Total Wallet Balance",
      value: formatCurrency(totalBalance),
      change: "+15.3%",
      changeType: "increase",
      icon: BanknotesIcon,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
      iconBg: "from-red-500 to-red-600",
      description: "From all approved transactions"
    },
    {
      title: "Approved This Month",
      value: formatCurrency(approvedThisMonth),
      change: "+8.2%",
      changeType: "increase",
      icon: ArrowTrendingUpIcon,
      gradient: "from-gray-700 to-black",
      bgGradient: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-black/20",
      iconBg: "from-gray-700 to-black",
      description: "Total approved this month"
    },
    {
      title: "Pending Requests",
      value: pendingRequests.toString(),
      change: "-2.1%",
      changeType: "decrease",
      icon: ClockIcon,
      gradient: "from-gray-500 to-gray-600",
      bgGradient: "from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20",
      iconBg: "from-gray-500 to-gray-600",
      description: "Awaiting approval"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ 
            y: -8,
            scale: 1.02,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
          whileTap={{ scale: 0.95 }}
          className={`modern-card relative overflow-hidden bg-gradient-to-br ${card.bgGradient} group cursor-pointer border-l-4 border-l-red-500`}
        >
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent dark:via-gray-800"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full blur-2xl"></div>
          </div>

          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 p-8">
            {/* Enhanced Icon and Title Row */}
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-3xl bg-gradient-to-br ${card.iconBg} shadow-2xl shadow-red-500/20 group-hover:shadow-red-500/30 transition-all duration-300 group-hover:scale-110`}>
                <card.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                  card.changeType === 'increase' 
                    ? 'bg-white text-green-600 dark:bg-gray-800 dark:text-green-400 shadow-green-500/20' 
                    : card.changeType === 'decrease'
                    ? 'bg-white text-red-600 dark:bg-gray-800 dark:text-red-400 shadow-red-500/20'
                    : 'bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-400 shadow-gray-500/20'
                }`}>
                  {card.changeType === 'increase' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
                  {card.changeType === 'decrease' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
                  {card.change}
                </div>
              </div>
            </div>

            {/* Enhanced Value */}
            <div className="mb-4">
              <h3 className="text-4xl font-black text-black dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                {card.value}
              </h3>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {card.title}
              </p>
            </div>

            {/* Enhanced Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {card.description}
            </p>

            {/* Progress bar decoration */}
            <div className="mt-4 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transform origin-left group-hover:scale-x-100 scale-x-75 transition-transform duration-500`}></div>
            </div>
          </div>

          {/* Hover Effect Line */}
          <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${card.gradient} group-hover:w-full transition-all duration-300`}></div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/10 dark:from-gray-700/10 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
