'use client';

import { useState, useEffect } from 'react';
import { satoxClient } from '@/lib/satox-client';

interface ConnectionStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

export default function ConnectionStatus({ onStatusChange }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string>('');
  const [nodeInfo, setNodeInfo] = useState<any>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('connecting');
        setError('');
        
        const info = await satoxClient.getInfo();
        setNodeInfo(info);
        setStatus('connected');
        onStatusChange?.(true);
      } catch (err: any) {
        setStatus('error');
        setError(err.message);
        onStatusChange?.(false);
      }
    };

    checkConnection();
    
    // Check connection every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [onStatusChange]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Unknown';
    }
  };

  const getTroubleshootingSteps = () => {
    return [
      '1. Ensure Satoxcoin node is running',
      '2. Check that RPC is enabled (server=1 in satoxcoin.conf)',
      '3. Verify RPC port 7777 is correct',
      '4. Make sure txindex=1 is set in satoxcoin.conf',
      '5. Wait for node to finish syncing/indexing',
      '6. Check firewall settings',
    ];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Node Connection Status</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
          <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
        </div>
      </div>

      {status === 'connected' && nodeInfo && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Version:</span>
              <p className="font-medium">{nodeInfo.version}</p>
            </div>
            <div>
              <span className="text-gray-500">Blocks:</span>
              <p className="font-medium">{nodeInfo.blocks.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Connections:</span>
              <p className="font-medium">{nodeInfo.connections}</p>
            </div>
            <div>
              <span className="text-gray-500">Difficulty:</span>
              <p className="font-medium">{nodeInfo.difficulty.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-xs text-green-600 bg-green-50 p-3 rounded">
            ✅ Successfully connected to Satoxcoin node at localhost:7777
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            <p className="font-medium">Connection failed:</p>
            <p className="mt-1">{error}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Troubleshooting Steps:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {getTroubleshootingSteps().map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-gray-500">
            <p>Current RPC URL: <code className="bg-gray-100 px-1 rounded">http://localhost:7777</code></p>
            <p>Check your satoxcoin.conf file for correct RPC settings.</p>
          </div>
        </div>
      )}

      {status === 'connecting' && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Attempting to connect to Satoxcoin node...</p>
        </div>
      )}
    </div>
  );
} 