/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SATOX_RPC_URL: process.env.SATOX_RPC_URL || 'http://localhost:7777',
    SATOX_P2P_PORT: process.env.SATOX_P2P_PORT || '60777',
    SATOX_RPC_USER: process.env.SATOX_RPC_USER || 'your_rpc_username',
    SATOX_RPC_PASSWORD: process.env.SATOX_RPC_PASSWORD || 'your_rpc_password',
  },
}

module.exports = nextConfig 