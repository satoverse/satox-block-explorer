'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { satoxClient, SatoxBlock, SatoxTransaction } from '@/lib/satox-client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BlockPage() {
  const params = useParams();
  const hash = params.hash as string;
  
  const [block, setBlock] = useState<SatoxBlock | null>(null);
  const [transactions, setTransactions] = useState<SatoxTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isInitialBlockDownload, setIsInitialBlockDownload] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<string>('');

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        setLoading(true);
        setError(null);

        const blockData = await satoxClient.getBlock(hash);
        setBlock(blockData);

        // Check node sync status
        try {
          const chainInfo = await satoxClient.getBlockchainInfo();
          
          let status = '';
          
          // Check for reindexing
          if (chainInfo.reindex) {
            setIsReindexing(true);
            setIsInitialBlockDownload(false);
            setIsSyncing(false);
            status = 'reindexing';
          }
          // Check for initial block download
          else if (chainInfo.initialblockdownload) {
            setIsInitialBlockDownload(true);
            setIsReindexing(false);
            setIsSyncing(false);
            status = 'initial_block_download';
          }
          // Check if there's a significant difference between blocks and headers (syncing)
          else if (chainInfo.blocks && chainInfo.headers && 
                   (chainInfo.headers - chainInfo.blocks) > 1000) {
            setIsSyncing(true);
            setIsReindexing(false);
            setIsInitialBlockDownload(false);
            status = 'syncing';
          }
          // Check if verification progress is not complete
          else if (chainInfo.verificationprogress && chainInfo.verificationprogress < 0.999) {
            setIsSyncing(true);
            setIsReindexing(false);
            setIsInitialBlockDownload(false);
            status = 'verifying';
          }
          // Node is fully synced
          else {
            setIsSyncing(false);
            setIsReindexing(false);
            setIsInitialBlockDownload(false);
            status = 'synced';
          }
          
          setNodeStatus(status);
        } catch (err) {
          console.warn('Could not check sync status:', err);
        }

        // Fetch transaction details
        const txPromises = blockData.tx.slice(0, 20).map(async (txid) => {
          try {
            // Ensure txid is a string and not empty
            if (typeof txid !== 'string' || txid.trim() === '') {
              console.warn('Skipping invalid transaction ID', txid);
              return null;
            }
            return await satoxClient.getTransaction(txid);
          } catch (err) {
            console.error(`Failed to fetch transaction ${txid}:`, err);
            return null;
          }
        });

        const txResults = await Promise.all(txPromises);
        const validTransactions = txResults.filter(tx => tx !== null) as SatoxTransaction[];
        setTransactions(validTransactions);
        
        // If no transactions were fetched successfully, still show the block
        if (validTransactions.length === 0 && blockData.tx.length > 0) {
          console.warn('No transaction details could be fetched, but block has transactions');
        }
      } catch (err) {
        console.error('Failed to fetch block:', err);
        setError('Failed to fetch block data. Please check the block hash.');
      } finally {
        setLoading(false);
      }
    };

    if (hash) {
      fetchBlock();
    }
  }, [hash]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const formatValue = (value: number) => {
    return (value / 100000000).toFixed(8); // Assuming 8 decimal places
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading block...</p>
        </div>
      </div>
    );
  }

  if (error || !block) {
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Node Status Warning */}
        {(isReindexing || isInitialBlockDownload || isSyncing) && (
          <div className={`border rounded-lg p-4 mb-6 ${
            isReindexing ? 'bg-orange-50 border-orange-200' :
            isInitialBlockDownload ? 'bg-blue-50 border-blue-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${
                  isReindexing ? 'text-orange-400' :
                  isInitialBlockDownload ? 'text-blue-400' :
                  'text-yellow-400'
                }`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  isReindexing ? 'text-orange-800' :
                  isInitialBlockDownload ? 'text-blue-800' :
                  'text-yellow-800'
                }`}>
                  {isReindexing && 'Node is Reindexing'}
                  {isInitialBlockDownload && 'Initial Block Download'}
                  {isSyncing && 'Node is Syncing'}
                </h3>
                <div className={`mt-2 text-sm ${
                  isReindexing ? 'text-orange-700' :
                  isInitialBlockDownload ? 'text-blue-700' :
                  'text-yellow-700'
                }`}>
                  {isReindexing && (
                    <p>Your Satoxcoin node is currently reindexing. Some transaction details may be incomplete or unavailable until reindexing is finished.</p>
                  )}
                  {isInitialBlockDownload && (
                    <p>Your Satoxcoin node is downloading the initial blockchain data. Some transaction details may be incomplete or unavailable until the download is complete.</p>
                  )}
                  {isSyncing && (
                    <p>Your Satoxcoin node is syncing with the network. Some transaction details may be incomplete or unavailable until syncing is complete.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Block Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Block #{block.height}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(block.time)}
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              {block.confirmations} confirmations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Hash:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                  {block.hash}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Merkle Root:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                  {block.merkleroot}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Previous Block:</span>
                {block.previousblockhash ? (
                  <Link
                    href={`/block/${block.previousblockhash}`}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-mono break-all block"
                  >
                    {block.previousblockhash}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">Genesis Block</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Size:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{block.size.toLocaleString()} bytes</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{block.difficulty.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nonce:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{block.nonce}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bits:</span>
                <p className="text-sm text-gray-900 dark:text-gray-100">{block.bits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Transactions ({block.tx.length})
          </h2>
          
          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <div key={tx.txid} className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Transaction #{index + 1}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {formatHash(tx.txid)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{tx.size} bytes</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Inputs:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{tx.vin.length}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Outputs:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{tx.vout.length}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/tx/${tx.txid}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View Transaction Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {block.tx.length > 20 && (
            <div className="mt-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Showing first 20 transactions of {block.tx.length} total
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } 