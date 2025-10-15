import { FC } from 'react';
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
    <header className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/20 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 dark:from-indigo-400/5 dark:via-purple-400/5 dark:to-pink-400/5"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Logo and Title */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                Wallet Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
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
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                className="input-modern pl-12 pr-4 py-3 w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-300 focus:ring-indigo-500/20"
                placeholder="Search by user ID, payment method, or referral code..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Date Range Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="date"
                  className="input-modern pl-10 pr-3 py-3 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-300 focus:ring-indigo-500/20"
                  value={dateRange.start}
                  onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="date"
                  className="input-modern pl-10 pr-3 py-3 text-sm bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-300 focus:ring-indigo-500/20"
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

            {/* Notifications */}
            <button className="relative p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group">
              <BellIcon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Profile */}
            <button className="flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group">
              <UserCircleIcon className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Administrator</p>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
