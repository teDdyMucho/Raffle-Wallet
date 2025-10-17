import { FC } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, CalendarDaysIcon, BellIcon, UserCircleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

const Header: FC<HeaderProps> = ({ 
  searchTerm, 
  onSearchChange, 
  dateRange, 
  onDateRangeChange 
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="relative bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-b-2 border-gray-200 dark:border-gray-800 shadow-2xl shadow-gray-200/30 dark:shadow-black/70">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-gray-400/5 to-red-500/5 dark:from-red-900/5 dark:via-gray-800/5 dark:to-red-900/5"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Logo and Title */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center justify-center p-2 rounded-3xl bg-gradient-to-br from-red-500/10 to-gray-500/10 dark:from-red-900/20 dark:to-gray-800/20 shadow-xl">
              <Image src="/images/allen%20(1).png" alt="Logo" width={64} height={64} className="object-contain hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-black dark:text-white bg-gradient-to-r from-black via-red-600 to-black dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent">
                Wallet Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
                Track, manage, and approve user cash-ins in real time
              </p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 lg:flex-1 lg:max-w-2xl lg:ml-8"
          >
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="input-modern pl-12 pr-4 py-3 w-full bg-white/70 dark:bg-black/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 focus:bg-white dark:focus:bg-black focus:border-red-300 focus:ring-red-500/20"
                placeholder="Search by user ID, payment method, or referral code..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Date Range Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="date"
                  className="input-modern pl-10 pr-3 py-3 text-sm bg-white/70 dark:bg-black/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 focus:bg-white dark:focus:bg-black focus:border-red-300 focus:ring-red-500/20"
                  value={dateRange.start}
                  onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="date"
                  className="input-modern pl-10 pr-3 py-3 text-sm bg-white/70 dark:bg-black/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 focus:bg-white dark:focus:bg-black focus:border-red-300 focus:ring-red-500/20"
                  value={dateRange.end}
                  onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </motion.div>

          {/* User Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
              ) : (
                <SunIcon className="h-5 w-5 text-slate-400 group-hover:text-yellow-500 transition-colors" />
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
