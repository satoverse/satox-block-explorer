export interface SatoxBlock {
  hash: string;
  confirmations: number;
  size: number;
  height: number;
  version: number;
  merkleroot: string;
  tx: string[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash?: string;
  nextblockhash?: string;
}

export interface SatoxTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: any[];
  vout: any[];
  hex: string;
  blockhash?: string;
  confirmations?: number;
  time?: number;
  blocktime?: number;
}

export interface SatoxInfo {
  version: number;
  protocolversion: number;
  walletversion: number;
  balance: number;
  blocks: number;
  timeoffset: number;
  connections: number;
  proxy: string;
  difficulty: number;
  testnet: boolean;
  keypoololdest: number;
  keypoolsize: number;
  paytxfee: number;
  relayfee: number;
  errors: string;
}

class SatoxClient {
  private rpcUrl: string;

  constructor(rpcUrl: string = 'http://localhost:7777') {
    this.rpcUrl = rpcUrl;
  }

  private async makeRpcCall(method: string, params: any[] = []): Promise<any> {
    try {
      console.log(`Making RPC call via API with method: ${method}`);
      
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          params,
        }),
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error! status: ${response.status}, response: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.result;
    } catch (error) {
      console.error(`RPC call failed for method ${method}:`, error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to Satoxcoin node. Please check:
1. Node is running and RPC is enabled
2. RPC port 7777 is correct
3. Node is not still reindexing
4. Firewall is not blocking the connection
5. RPC credentials are correct`);
      }
      
      throw error;
    }
  }

  async getBlockchainInfo(): Promise<any> {
    return this.makeRpcCall('getblockchaininfo');
  }

  async getBlockHash(height: number): Promise<string> {
    return this.makeRpcCall('getblockhash', [height]);
  }

  async getBlock(hash: string): Promise<SatoxBlock> {
    return this.makeRpcCall('getblock', [hash, 2]);
  }

  async getBlockByHeight(height: number): Promise<SatoxBlock> {
    const hash = await this.getBlockHash(height);
    return this.getBlock(hash);
  }

  async getTransaction(txid: string): Promise<SatoxTransaction> {
    // Validate transaction ID
    if (!txid || txid.trim() === '') {
      throw new Error('Transaction ID cannot be empty');
    }
    
    // Validate hex format
    if (!/^[a-fA-F0-9]+$/.test(txid)) {
      throw new Error('Transaction ID must be a valid hexadecimal string');
    }
    
    return this.makeRpcCall('getrawtransaction', [txid, true]);
  }

  async getInfo(): Promise<SatoxInfo> {
    return this.makeRpcCall('getinfo');
  }

  async getBlockchainInfo(): Promise<any> {
    return this.makeRpcCall('getblockchaininfo');
  }

  async getMempoolInfo(): Promise<any> {
    return this.makeRpcCall('getmempoolinfo');
  }

  async getPeerInfo(): Promise<any[]> {
    return this.makeRpcCall('getpeerinfo');
  }

  async getNetworkInfo(): Promise<any> {
    return this.makeRpcCall('getnetworkinfo');
  }
}

export const satoxClient = new SatoxClient(process.env.SATOX_RPC_URL || 'http://localhost:7777'); 