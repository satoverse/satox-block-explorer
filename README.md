# Satox Block Explorer

A modern, responsive block explorer for the Satox blockchain built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔍 **Block Explorer**: Browse and search blocks and transactions
- 📊 **Real-time Statistics**: View network statistics and blockchain metrics
- 🎨 **Modern UI**: Clean, responsive design with dark/light theme support
- ⚡ **Fast Performance**: Built with Next.js for optimal performance
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices
- 🔗 **RPC Integration**: Direct integration with Satox RPC endpoints
- 🔍 **Smart Search**: Search by block height, block hash, or transaction ID

## Screenshots

*Add screenshots here once the application is deployed*

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to Satox RPC endpoint

**Note**: This explorer provides block and transaction viewing capabilities. For address exploration (balances, transaction history), a database with indexed blockchain data would be required.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satoverse/satox-block-explorer.git
   cd satox-block-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_RPC_URL=https://your-satox-rpc-endpoint.com
   NEXT_PUBLIC_NETWORK_NAME=Satox
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
satox-block-explorer/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── rpc/          # RPC proxy endpoint
│   │   ├── block/            # Block detail pages
│   │   ├── tx/               # Transaction detail pages
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── BlockCard.tsx     # Block display component
│   │   ├── ConnectionStatus.tsx # Network status
│   │   ├── Footer.tsx        # Footer component
│   │   ├── Header.tsx        # Header component
│   │   ├── ReindexBanner.tsx # Reindexing notification
│   │   └── StatsCard.tsx     # Statistics display
│   └── lib/                  # Utility libraries
│       └── satox-client.ts   # RPC client
├── public/                   # Static assets
│   ├── favicon.ico
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── satox-logo.png
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Configuration

### RPC Endpoint

The application connects to Satox RPC endpoints for blockchain data. Configure your RPC URL in the environment variables:

```env
NEXT_PUBLIC_RPC_URL=https://your-satox-rpc-endpoint.com
```

### Network Configuration

You can customize the network name and other settings:

```env
NEXT_PUBLIC_NETWORK_NAME=Satox
```

## API Routes

### `/api/rpc`

Proxy endpoint for RPC calls to the Satox network. This route forwards requests to your configured RPC endpoint.

**Method**: POST  
**Body**: JSON-RPC request object

## Search Functionality

The explorer supports searching for:
- **Block Height**: Enter a number (e.g., "12345")
- **Block Hash**: Enter a block hash (e.g., "000000000000000000...")
- **Transaction ID**: Enter a transaction hash (e.g., "abc123...")

The search automatically detects the input type and navigates to the appropriate page.

## Components

### BlockCard
Displays block information in a card format with hash, height, timestamp, and transaction count.

### ConnectionStatus
Shows the current connection status to the Satox network with real-time updates.

### StatsCard
Displays network statistics including total blocks, transactions, and other metrics.

### Header/Footer
Navigation and branding components with responsive design.

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your application

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use the Next.js build command
- **Railway**: Direct deployment from GitHub
- **Docker**: Build and run in containers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Write meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Join the Satox community
- Check the documentation

## Limitations

- **No Address Support**: Address exploration (balances, transaction history) requires a database with indexed blockchain data
- **RPC Only**: Currently relies on direct RPC calls without caching or indexing
- **No UTXO Tracking**: Cannot track unspent transaction outputs without additional infrastructure

## Acknowledgments

- Built for the Satox blockchain community
- Inspired by modern block explorers
- Powered by Next.js and Tailwind CSS

---

**Satox Block Explorer** - Exploring the Satox blockchain, one block at a time. 