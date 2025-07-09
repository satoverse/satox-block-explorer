'use client';

import { useEffect, useState } from 'react';
import BlockCard from '@/components/BlockCard';
import StatsCard from '@/components/StatsCard';
import ConnectionStatus from '@/components/ConnectionStatus';
import { satoxClient, SatoxBlock, SatoxInfo } from '@/lib/satox-client';
import { CubeIcon, CurrencyDollarIcon, GlobeAltIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [info, setInfo] = useState<SatoxInfo | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<SatoxBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [isInitialBlockDownload, setIsInitialBlockDownload] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<string>('');
  const [blockchainInfo, setBlockchainInfo] = useState<any>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch blockchain info
        const blockchainInfo = await satoxClient.getInfo();
        setInfo(blockchainInfo);
        setIsConnected(true);

        // Check if node is still syncing
        if (blockchainInfo.blocks === 0 || blockchainInfo.connections === 0) {
          setIsSyncing(true);
          setLoading(false);
          return;
        }

        // Check node sync status
        try {
          const chainInfo = await satoxClient.getBlockchainInfo();
          setBlockchainInfo(chainInfo);
          
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
          console.warn('Could not fetch blockchain info for sync status check:', err);
        }

        // Fetch recent blocks
        const blocks: SatoxBlock[] = [];
        const latestHeight = blockchainInfo.blocks;
        
        // Get the 10 most recent blocks
        for (let i = 0; i < 10 && i < latestHeight; i++) {
          try {
            const block = await satoxClient.getBlockByHeight(latestHeight - i);
            // Only add blocks that have valid transaction data
            if (block && block.tx && block.tx.length > 0) {
              blocks.push(block);
            }
          } catch (err) {
            console.error(`Failed to fetch block ${latestHeight - i}:`, err);
            // Continue with other blocks even if one fails
          }
        }
        
        setRecentBlocks(blocks);
        setIsSyncing(false);
      } catch (err: any) {
        console.error('Failed to fetch blockchain data:', err);
        setIsConnected(false);
        
        // Check if it's a connection error vs syncing
        if (err.message.includes('Failed to fetch')) {
          setError('Cannot connect to Satoxcoin node. Please check your node configuration.');
        } else if (err.message.includes('-28')) {
          setIsSyncing(true);
          setError(null);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatVersion = (version: number) => {
    const major = Math.floor(version / 1000000);
    const minor = Math.floor((version % 1000000) / 10000);
    const patch = Math.floor((version % 10000) / 100);
    return `${major}.${minor}.${patch}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connecting to Satoxcoin node...</p>
        </div>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Node is Syncing</h2>
            <p className="text-gray-600 mb-6">
              Your Satoxcoin node is currently syncing with the network. This process can take some time depending on your internet connection and hardware.
            </p>
            
            {info && (
              <div className="bg-white rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Blocks:</span>
                    <p className="font-medium">{info.blocks.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Connections:</span>
                    <p className="font-medium">{info.connections}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              <p>✅ Node is running and connected</p>
              <p>⏳ Waiting for full synchronization...</p>
              <p className="mt-2">The block explorer will automatically load once syncing is complete.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ConnectionStatus onStatusChange={setIsConnected} />
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
                    <>
                      <p>Your Satoxcoin node is currently reindexing the blockchain. This process may take several hours depending on your hardware and network speed.</p>
                      <p className="mt-1">
                        <strong>Current status:</strong> Reindexing - 
                        {blockchainInfo?.blocks && blockchainInfo?.headers ? 
                          ` ${blockchainInfo.blocks.toLocaleString()} of ${blockchainInfo.headers.toLocaleString()} blocks processed` : 
                          ' Processing blocks...'
                        }
                      </p>
                      <p className="mt-1">The block explorer will show available data, but some information may be incomplete until reindexing is finished.</p>
                    </>
                  )}
                  {isInitialBlockDownload && (
                    <>
                      <p>Your Satoxcoin node is downloading the initial blockchain data. This is the first sync and may take several hours or days depending on your internet connection and hardware.</p>
                      <p className="mt-1">
                        <strong>Current status:</strong> Initial Block Download - 
                        {blockchainInfo?.blocks && blockchainInfo?.headers ? 
                          ` ${blockchainInfo.blocks.toLocaleString()} of ${blockchainInfo.headers.toLocaleString()} blocks downloaded` : 
                          ' Downloading blocks...'
                        }
                      </p>
                      <p className="mt-1">The block explorer will show available data, but many blocks may not be accessible until the download is complete.</p>
                    </>
                  )}
                  {isSyncing && (
                    <>
                      <p>Your Satoxcoin node is syncing with the network. It's downloading and verifying new blocks to catch up with the latest blockchain state.</p>
                      <p className="mt-1">
                        <strong>Current status:</strong> Syncing - 
                        {blockchainInfo?.blocks && blockchainInfo?.headers ? 
                          ` ${blockchainInfo.blocks.toLocaleString()} of ${blockchainInfo.headers.toLocaleString()} blocks synced` : 
                          ' Syncing blocks...'
                        }
                        {blockchainInfo?.verificationprogress && 
                          ` (${(blockchainInfo.verificationprogress * 100).toFixed(1)}% verified)`
                        }
                      </p>
                      <p className="mt-1">The block explorer will show available data, but newer blocks may not be accessible until syncing is complete.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fully Synced Success Message */}
        {nodeStatus === 'synced' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Node Fully Synced</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your Satoxcoin node is fully synchronized with the network. All blockchain data is available and up to date.</p>
                  {blockchainInfo?.blocks && (
                    <p className="mt-1">
                      <strong>Current height:</strong> {blockchainInfo.blocks.toLocaleString()} blocks
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Search Section */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
           <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Blockchain</h2>
           <form onSubmit={(e) => {
             e.preventDefault();
             const query = (e.target as any).search.value.trim();
             if (query) {
               // Check if it's a block height (number) or block hash
               if (/^\d+$/.test(query)) {
                 window.location.href = `/block/${query}`;
               } else {
                 // Assume it's a transaction hash
                 window.location.href = `/tx/${query}`;
               }
             }
           }}>
             <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex-1">
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                   </div>
                   <input
                     name="search"
                     type="text"
                     placeholder="Enter block height, block hash, or transaction ID..."
                     className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                   />
                 </div>
               </div>
               <div className="flex-shrink-0">
                 <button
                   type="submit"
                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                 >
                   Search
                 </button>
               </div>
             </div>
           </form>
         </div>

        {/* Stats Overview */}
        {info && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Blocks"
              value={info.blocks.toLocaleString()}
              icon={<CubeIcon className="h-6 w-6 text-blue-600" />}
            />
            <StatsCard
              title="Connections"
              value={info.connections}
              subtitle="Peers connected"
              icon={<GlobeAltIcon className="h-6 w-6 text-green-600" />}
            />
            <StatsCard
              title="Difficulty"
              value={info.difficulty.toFixed(2)}
              icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
            />
            <StatsCard
              title="Node Version"
              value={formatVersion(info.version)}
              subtitle={`Protocol ${info.protocolversion}`}
              icon={<CurrencyDollarIcon className="h-6 w-6 text-purple-600" />}
            />
          </div>
        )}

        {/* Recent Blocks */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Blocks</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentBlocks.map((block) => (
              <BlockCard key={block.hash} block={block} />
            ))}
          </div>
        </div>
      </div>
    );
  } 