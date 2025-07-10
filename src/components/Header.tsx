'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { satoxClient } from '@/lib/satox-client';

function getInitialTheme() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
}

export default function Header() {
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const [blockHeight, setBlockHeight] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Fetch block height
  useEffect(() => {
    let isMounted = true;
    async function fetchBlockHeight() {
      try {
        const info = await satoxClient.getInfo();
        if (isMounted) setBlockHeight(info.blocks);
      } catch (err) {
        if (isMounted) setBlockHeight(null);
      }
    }
    fetchBlockHeight();
    const interval = setInterval(fetchBlockHeight, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [mounted]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = search.trim();
    if (!value) return;
    if (/^[a-fA-F0-9]{64}$/.test(value)) {
      router.push(`/block/${value}`);
    } else {
      alert('Please enter a valid block hash or transaction ID.');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <img src="/satox-logo.png" alt="Satox Logo" className="h-10 w-10 mr-2" />
            </Link>
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Satox Block Explorer
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search block or txid..."
                className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:bg-gray-900 dark:placeholder-gray-400 bg-white"
              />
            </form>
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-green-500 rounded-full animate-pulse`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Connected</span>
            </div>
            {/* Sync Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 bg-green-500 rounded-full`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Synced</span>
            </div>
            {/* Block Height */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Block: {blockHeight !== null ? blockHeight.toLocaleString() : '...'}
            </div>
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
                aria-label="Toggle dark mode"
                type="button"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M6.34 6.34l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 