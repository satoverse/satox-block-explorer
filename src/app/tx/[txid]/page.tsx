'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { satoxClient, SatoxTransaction } from '@/lib/satox-client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TransactionPage() {
  const params = useParams();
  const txid = params.txid as string;
  
  const [transaction, setTransaction] = useState<SatoxTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError(null);

        const txData = await satoxClient.getTransaction(txid);
        setTransaction(txData);
      } catch (err) {
        console.error('Failed to fetch transaction:', err);
        setError('Failed to fetch transaction data. Please check the transaction ID.');
      } finally {
        setLoading(false);
      }
    };

    if (txid) {
      fetchTransaction();
    }
  }, [txid]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const formatValue = (value: number) => {
    return (value / 100000000).toFixed(8); // Assuming 8 decimal places
  };

  const calculateTotalOutput = () => {
    if (!transaction) return 0;
    return transaction.vout.reduce((total, output) => total + output.value, 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transaction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Transaction Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Transaction
              </h1>
              <p className="text-gray-500 mt-1 font-mono text-sm">
                {transaction.txid}
              </p>
            </div>
            {transaction.confirmations !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {transaction.confirmations} confirmations
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Transaction ID:</span>
                <p className="text-sm text-gray-900 font-mono break-all">
                  {transaction.txid}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Hash:</span>
                <p className="text-sm text-gray-900 font-mono break-all">
                  {transaction.hash}
                </p>
              </div>
              {transaction.blockhash && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Block:</span>
                  <Link
                    href={`/block/${transaction.blockhash}`}
                    className="text-sm text-blue-600 hover:text-blue-800 font-mono break-all block"
                  >
                    {transaction.blockhash}
                  </Link>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Size:</span>
                <p className="text-sm text-gray-900">{transaction.size} bytes</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Virtual Size:</span>
                <p className="text-sm text-gray-900">{transaction.vsize} bytes</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Weight:</span>
                <p className="text-sm text-gray-900">{transaction.weight} WU</p>
              </div>
              {transaction.time && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Time:</span>
                  <p className="text-sm text-gray-900">{formatTime(transaction.time)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Inputs ({transaction.vin.length})
            </h2>
            
            <div className="space-y-4">
              {transaction.vin.map((input, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Input #{index + 1}
                      </h3>
                      {input.txid && (
                        <p className="text-sm text-gray-500 font-mono">
                          {formatHash(input.txid)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Vout</p>
                      <p className="text-sm font-medium">{input.vout}</p>
                    </div>
                  </div>
                  
                  {input.scriptSig && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Script:</span>
                      <p className="text-sm text-gray-900 font-mono break-all">
                        {input.scriptSig.asm}
                      </p>
                    </div>
                  )}
                  
                  {input.txid && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link
                        href={`/tx/${input.txid}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Previous Transaction →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Outputs */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Outputs ({transaction.vout.length})
            </h2>
            
            <div className="space-y-4">
              {transaction.vout.map((output, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Output #{index + 1}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatValue(output.value)} SATOX
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Index</p>
                      <p className="text-sm font-medium">{output.n}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Script:</span>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {output.scriptPubKey.asm}
                    </p>
                  </div>
                  
                  {output.scriptPubKey.addresses && output.scriptPubKey.addresses.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-500">Addresses:</span>
                      <div className="mt-1 space-y-1">
                        {output.scriptPubKey.addresses.map((address, addrIndex) => (
                          <p key={addrIndex} className="text-sm text-gray-900 font-mono">
                            {address}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm font-medium text-gray-500">Total Inputs:</span>
              <p className="text-2xl font-semibold text-gray-900">{transaction.vin.length}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Total Outputs:</span>
              <p className="text-2xl font-semibold text-gray-900">{transaction.vout.length}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Total Value:</span>
              <p className="text-2xl font-semibold text-gray-900">
                {formatValue(calculateTotalOutput())} SATOX
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 