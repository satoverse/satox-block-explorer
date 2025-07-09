import { NextRequest, NextResponse } from 'next/server';

const SATOX_RPC_URL = process.env.SATOX_RPC_URL || 'http://localhost:7777';
const SATOX_RPC_USER = process.env.SATOX_RPC_USER || 'your_rpc_username';
const SATOX_RPC_PASSWORD = process.env.SATOX_RPC_PASSWORD || 'your_rpc_password';

export async function POST(request: NextRequest) {
  try {
    const { method, params = [] } = await request.json();

    // Create basic auth header
    const authHeader = 'Basic ' + Buffer.from(`${SATOX_RPC_USER}:${SATOX_RPC_PASSWORD}`).toString('base64');

    const response = await fetch(SATOX_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}, response: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json(
        { error: `RPC error: ${data.error.message} (code: ${data.error.code})` },
        { status: 400 }
      );
    }

    return NextResponse.json({ result: data.result });
  } catch (error: any) {
    console.error('RPC API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 