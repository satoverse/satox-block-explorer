import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2025 Satoxcoin Core Developer. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Satox Block Explorer - A modern blockchain explorer for Satoxcoin
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="https://github.com/satoverse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              GitHub
            </Link>
            <Link 
              href="https://satoverse.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              Satoverse.io
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 