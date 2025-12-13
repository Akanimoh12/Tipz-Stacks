# Tipz Stacks 🎨✨

> A decentralized creator tipping platform built on Stacks blockchain with Clarity 4 smart contracts

## 🌟 Overview

**Tipz Stacks** empowers creators and their communities by enabling seamless tipping and engagement on the Stacks blockchain. Support your favorite creators with STX or free CHEER tokens, and watch them rise on our transparent leaderboard.

### Key Features

- 🎁 **Daily CHEER Claims**: Every user can claim 100 free CHEER tokens every 24 hours
- 💰 **Dual Tipping System**: Tip with STX (direct value) or CHEER tokens (engagement)
- 🏆 **Dual Leaderboards**: Rankings for both creators (most supported) AND tippers (most generous)
- 📱 **Social Sharing**: Share every tip, cheer, registration, and milestone on X, Facebook, LinkedIn
- 🎉 **Viral Growth**: Shareable achievement cards with Open Graph previews
- 🔒 **Wallet Authentication**: Passwordless login using Stacks principals
- 📦 **IPFS Integration**: Decentralized profile storage via Pinata
- 🏅 **Achievement Badges**: Unlock milestones and showcase your support
- 📱 **Mobile Responsive**: Perfect experience across all devices
- 🎨 **Clean Design**: White background with vibrant orange accents
- 👥 **Tipper Profiles**: Showcase your generosity (registered or anonymous)

## 🚀 Technology Stack

### Blockchain
- **Clarity 4**: Latest smart contract language for Stacks
- **SIP-010**: Fungible token standard for CHEER
- **Clarinet**: Development and testing framework

### Frontend
- **Vite + React 18**: Fast, modern build tool and UI library
- **Tailwind CSS**: Utility-first styling
- **Stacks.js**: Official Stacks blockchain SDK
- **@stacks/connect**: Wallet connection library

### Storage
- **Pinata**: IPFS gateway for decentralized data
- **IPFS**: Profile images and metadata storage

## 📁 Project Structure

```
tipz-stacks/
├── contract/              # Clarity 4 smart contracts
│   ├── contracts/
│   │   ├── cheer-token.clar      # SIP-010 token with daily claims
│   │   └── tipz-core.clar        # Tipping & leaderboard logic
│   └── tests/            # Contract unit tests
├── frontend/             # Vite + React application
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── hooks/        # Custom React hooks
│       └── services/     # API & blockchain services
└── docs/                 # Documentation
```

See [project_structure.md](./project_structure.md) for complete architecture details.

## 🎯 Core Functionality

### For Users
1. **Connect Wallet**: One-click connection with Hiro, Leather, or Xverse
2. **Claim Daily CHEER**: Get 100 free tokens every 24 hours (no cost)
3. **Discover Creators**: Browse profiles and portfolios
4. **Tip with STX**: Send Bitcoin-backed payments directly
5. **Cheer with CHEER**: Support creators with free tokens
6. **Track Impact**: Watch creators climb the leaderboard
7. **Climb Tipper Leaderboard**: See your rank among top supporters
8. **Share Achievements**: Post every tip, cheer, and milestone on social media
9. **Earn Badges**: Unlock achievements and showcase your generosity

### For Creators
1. **Register Profile**: Upload bio, images, and social links to IPFS
2. **Receive Tips**: Get STX directly to your wallet
3. **Collect Cheers**: Accumulate CHEER tokens from supporters
4. **Climb Creator Leaderboard**: Gain visibility through community support
5. **Share Your Profile**: Promote yourself on social media with shareable cards
6. **Track Supporters**: See who's supporting you on the tipper leaderboard
7. **Build Community**: Engage with your supporters on-chain and social media

## 🎨 Design Principles

### Color Scheme
- **Primary**: White background (#FFFFFF) - Clean and professional
- **Accent**: Vibrant orange (#FF6B35) - Energy and action
- **Text**: Dark grey (#333333) - Readable and modern
- **Subtle**: Light grey (#F5F5F5) - Backgrounds and dividers

### Typography
- **Headings**: Inter or Poppins (700-800 weight)
- **Body**: Inter (400-500 weight)
- **Minimum**: 16px body text for mobile readability
- **Responsive**: Scales from 32px (mobile) to 72px (desktop) for hero

### Mobile-First Approach
- Touch-friendly buttons (44px minimum)
- Single column layouts on mobile
- Collapsible navigation
- Optimized images and assets

## 🔐 Smart Contract Architecture

### cheer-token.clar (CHEER Token)
- **Standard**: SIP-010 fungible token
- **Daily Claims**: 100 CHEER per user per 24 hours
- **Timing**: Block height-based (144 blocks ≈ 24 hours)
- **Distribution**: 100% through user claims (no pre-mine)

Key Functions:
- `claim-daily-tokens()`: Mint 100 CHEER if 24h passed
- `transfer()`: Transfer CHEER between users
- `get-balance()`: Query token balance
- `can-claim-now()`: Check claim eligibility
- `get-last-claim-time()`: Get user's last claim timestamp

### tipz-core.clar (Platform Logic)
- **Creator Management**: Registration, profiles, metadata
- **Tipping**: STX transfers to creators
- **Cheering**: CHEER token transfers to creators
- **Leaderboard**: Score calculation and rankings
Key Functions:
- `register-creator()`: Register with IPFS CID
- `tip-with-stx()`: Send STX tip
- `cheer-with-token()`: Send CHEER tokens
- `get-creator-leaderboard()`: Fetch top creators
- `get-tipper-leaderboard()`: Fetch top supporters
- `get-creator-info()`: Retrieve creator profile data
- `get-tipper-stats()`: Retrieve tipper statistics
- `get-creator-rank()`: Get creator's position
- `get-tipper-rank()`: Get tipper's position
- `get-creator-info()`: Retrieve profile data

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Clarinet (for contract development)
- Stacks wallet (Hiro, Leather, or Xverse)
- Pinata API key (for IPFS)

### Smart Contract Development

```bash
cd contract
clarinet integrate  # Install Clarinet if needed
clarinet test       # Run contract tests
clarinet console    # Interactive REPL
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev         # Start development server
npm run build       # Production build
```

### Environment Variables

```bash
# frontend/.env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET=your_pinata_secret
VITE_STACKS_NETWORK=devnet  # or testnet, mainnet
VITE_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

## 🎮 User Flow

### Landing Page (No Auto-Routing)
1. User lands on hero section with clear value proposition
2. Explores features, how it works, and statistics
3. Clicks "Connect Wallet" (explicit action)
4. Wallet connects - user STAYS on landing page
5. "Go to Dashboard" button becomes active
6. User clicks button to navigate (intentional)

### Dashboard Experience
1. Prominent "Claim 100 CHEER" widget if eligible
2. Countdown timer if already claimed
3. Wallet balance display (STX + CHEER)
### Tipping Flow (With Social Sharing)
1. Browse creators on leaderboard or discover page
2. Click creator card to view full profile
3. Choose "Tip with STX" or "Cheer with CHEER"
4. Enter amount in modal
5. Confirm transaction in wallet
6. Success animation with confetti
7. **Share modal appears** with pre-filled message
8. Choose to share on X, Facebook, or LinkedIn
9. Social post includes creator link and shareable card
10. Both leaderboards update (creator + your tipper rank)
11. Check your new position on tipper leaderboard
## 📊 Platform Metrics

Track success through:
- Total STX tipped (volume)
- Total CHEER claimed and circulated
- Number of registered creators
- Number of active tippers
- Daily/monthly active users
- Average tip size and frequency
- Creator leaderboard engagement rate
- Tipper leaderboard engagement rate
- Social share conversion rate
- Viral coefficient (new users from shares)
- Claim streak statistics
- Most shared creators
- Achievement unlock rate circulated
- Number of registered creators
- Daily/monthly active users
- Average tip size and frequency
- Leaderboard engagement rate
- Claim streak statistics

## 🔒 Security

### Smart Contracts
- Input validation on all public functions
- Principal verification (tx-sender checks)
- Overflow protection (Clarity's uint safety)
- Block height-based timing (immutable)
- No admin keys or backdoors

### Frontend
- No private key storage
- Input sanitization and validation
- HTTPS only in production
- Content Security Policy headers
### Phase 2: Enhancement
- Creator and tipper tiers/badges
- Advanced leaderboard filters (time periods, categories)
- Activity notifications and alerts
- Claim streak tracking with rewards
- Social share analytics dashboard
- Achievement system with visual badges
- Mobile app (React Native)ocumentation
- ⏳ Smart contract development (Clarity 4)
- ⏳ Frontend implementation (Vite + React)
- ⏳ Pinata integration for IPFS
- ⏳ Wallet connection and basic UI

### Phase 2: Enhancement
- Creator tiers and badges
- Advanced leaderboard filters
- Activity notifications
- Claim streak tracking
- Mobile app (React Native)

### Phase 3: Expansion
- NFT rewards for top supporters
- Subscription tipping (recurring)
- Creator analytics dashboard
- Multi-language support
- Integration with creator content platforms

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

Areas for contribution:
- Smart contract optimization
- UI/UX improvements
- Documentation enhancements
- Testing and bug reports
- Feature suggestions

## 📄 License

This project is open source. See LICENSE file for details.

## 🔗 Links

- **Documentation**: [project_structure.md](./project_structure.md)
- **Stacks Blockchain**: [docs.stacks.co](https://docs.stacks.co)
- **Clarity Language**: [clarity-lang.org](https://clarity-lang.org)
- **Pinata IPFS**: [pinata.cloud](https://pinata.cloud)

## 💬 Community

- **Twitter**: [@TipzStacks](#)
- **Discord**: [Join our server](#)
- **GitHub Issues**: [Report bugs](https://github.com/your-repo/issues)

---

**Built with ❤️ for the creator economy on Stacks**

*Powered by Clarity 4 | Secured by Bitcoin | Stored on IPFS*
