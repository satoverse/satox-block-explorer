import { SatoxBlock } from '@/lib/satox-client';
import Link from 'next/link';

interface BlockCardProps {
  block: SatoxBlock;
}

export default function BlockCard({ block }: BlockCardProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Block #{block.height}</h2>
        {block.confirmations !== undefined && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            {block.confirmations} confirmation{block.confirmations !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{formatTime(block.time)}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Hash:</span>
          <p className="font-mono break-all text-gray-900 dark:text-gray-100">{formatHash(block.hash)}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Size:</span>
          <p className="text-gray-900 dark:text-gray-100">{block.size.toLocaleString()} bytes</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
          <p className="text-gray-900 dark:text-gray-100">{block.difficulty.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Transactions:</span>
          <p className="text-gray-900 dark:text-gray-100">{block.tx.length}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Nonce:</span>
          <p className="text-gray-900 dark:text-gray-100">{block.nonce}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Previous Block:</span>
          <p className="font-mono break-all text-blue-600 dark:text-blue-400">
            {block.previousblockhash}
          </p>
        </div>
      </div>
      <Link href={`/block/${block.hash}`} className="text-blue-600 dark:text-blue-400 text-sm mt-4 inline-block hover:underline">
        View Details →
      </Link>
    </div>
  );
} 