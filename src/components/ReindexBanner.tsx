import React from 'react';

interface ReindexBannerProps {
  isReindexing: boolean;
  progress?: number;
  currentBlock?: number;
  totalBlocks?: number;
}

export default function ReindexBanner({ isReindexing, progress, currentBlock, totalBlocks }: ReindexBannerProps) {
  if (!isReindexing) return null;

  return (
    <div className="w-full bg-orange-500 text-white text-center py-2 px-4 z-50">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2">
        <span className="font-semibold">Node is Reindexing:</span>
        <span>Your Satoxcoin node is currently reindexing. Some data may be incomplete until reindexing is finished.</span>
        {typeof progress === 'number' && totalBlocks && (
          <span className="ml-2 text-xs bg-orange-600 rounded px-2 py-1">
            Progress: {progress.toFixed(1)}%{currentBlock && totalBlocks ? ` (${currentBlock.toLocaleString()} / ${totalBlocks.toLocaleString()} blocks)` : ''}
          </span>
        )}
      </div>
    </div>
  );
} 