# Tipz Stacks - Creator Tipping Platform
## Project Structure & Flow Documentation

---

## 🎯 Project Overview

**Tipz Stacks** is a decentralized creator tipping platform built on the Stacks blockchain, utilizing Clarity 4 smart contracts, Pinata for IPFS storage, and Vite+React for the frontend. The platform enables users to support their favorite creators through STX (native Stacks tokens) or CHEER tokens (platform's custom fungible token), with a dynamic leaderboard showcasing top creators.

---

## 🎨 Design Philosophy

### Color Scheme
- **Primary Background**: Clean white (#FFFFFF)
- **Accent Color**: Vibrant orange (#FF6B35, #FF8C42) for CTAs, lines, highlights
- **Secondary Colors**: 
  - Soft grey (#F5F5F5) for subtle backgrounds
  - Dark grey (#333333) for text
  - Light orange tints for hover states

### Visual Identity
- Minimalist and creator-focused design
- Clean typography with generous white space
- Orange accents to draw attention to key actions (tipping, leaderboard positions)
- Smooth transitions and modern UI components

---

## 📁 Project Structure

```
tipz-stacks/
├── contract/                          # Clarity 4 Smart Contracts
│   ├── contracts/
│   │   ├── cheer-token.clar          # SIP-010 Fungible Token Contract
│   │   ├── tipz-core.clar            # Main tipping & leaderboard logic
│   │   └── traits/
│   │       └── sip-010-trait.clar    # Fungible token trait interface
│   ├── tests/
│   │   ├── cheer-token_test.ts       # Token contract tests
│   │   └── tipz-core_test.ts         # Core logic tests
│   ├── settings/
│   │   └── Devnet.toml               # Development network configuration
│   └── Clarinet.toml                  # Clarinet project configuration
│
├── frontend/                          # Vite + React Application
│   ├── public/
│   │   ├── logo.svg                  # Platform logo
│   │   └── assets/                   # Static images and icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   ├── Hero.jsx          # Landing page hero section
│   │   │   │   ├── Features.jsx      # Feature highlights
│   │   │   │   ├── HowItWorks.jsx    # Process explanation
│   │   │   │   └── CTA.jsx           # Call-to-action section
│   │   │   ├── dashboard/
│   │   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── CreatorProfile.jsx
│   │   │   │   ├── TipModal.jsx      # Tipping interface
│   │   │   │   └── TokenBalance.jsx  # User wallet balance display
│   │   │   ├── leaderboard/
│   │   │   │   ├── CreatorLeaderboard.jsx    # Top creators
│   │   │   │   ├── TipperLeaderboard.jsx     # Top tippers (supporters)
│   │   │   │   ├── LeaderboardTabs.jsx       # Switch between creator/tipper
│   │   │   │   ├── CreatorCard.jsx           # Individual creator display
│   │   │   │   ├── TipperCard.jsx            # Individual tipper display
│   │   │   │   └── LeaderboardFilters.jsx    # Time period & category filters
│   │   │   ├── social/
│   │   │   │   ├── ShareModal.jsx            # Universal share modal
│   │   │   │   ├── ShareButtons.jsx          # X (Twitter), FB, LinkedIn buttons
│   │   │   │   ├── ShareableCard.jsx         # Preview card for sharing
│   │   │   │   └── ShareTemplates.js         # Pre-built share messages
│   │   │   └── common/
│   │   │       ├── Header.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── ConnectWallet.jsx         # Stacks wallet integration
│   │   │       └── SuccessAnimation.jsx      # Confetti & celebrations
│   │   ├── pages/
│   │   │   ├── Landing.jsx           # Public landing page
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   ├── Leaderboards.jsx      # Dual leaderboards (creators + tippers)
│   │   │   ├── CreatorPage.jsx       # Individual creator profile
│   │   │   ├── TipperProfile.jsx     # Individual tipper profile
│   │   │   ├── MyProfile.jsx         # Current user profile
│   │   │   └── SharedAchievement.jsx # Public shareable achievement page
│   │   ├── hooks/
│   │   │   ├── useStacks.js          # Stacks blockchain interactions
│   │   │   ├── usePinata.js          # Pinata IPFS operations
│   │   │   ├── useContracts.js       # Smart contract calls
│   │   │   ├── useLeaderboard.js     # Creator leaderboard data
│   │   │   ├── useTipperLeaderboard.js   # Tipper leaderboard data
│   │   │   └── useSocialShare.js     # Social sharing functionality
│   │   ├── services/
│   │   │   ├── stacksService.js      # Stacks API wrapper
│   │   │   ├── pinataService.js      # Pinata API wrapper
│   │   │   └── contractService.js    # Contract interaction layer
│   │   ├── utils/
│   │   │   ├── constants.js          # App constants
│   │   │   ├── formatters.js         # Data formatting utilities
│   │   │   ├── validators.js         # Input validation
│   │   │   ├── shareUtils.js         # Social share helpers
│   │   │   └── achievementUtils.js   # Achievement/milestone logic
│   │   ├── styles/
│   │   │   ├── globals.css           # Global styles
│   │   │   └── theme.js              # Theme configuration
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # App entry point
│   ├── .env.example                   # Environment variables template
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js            # Tailwind CSS configuration
│
├── docs/                              # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
└── project_structure.md              # This file
```

---

## 🔗 Technology Stack

### Blockchain Layer (Clarity 4)
- **Clarity Language**: Decidable smart contract language for Stacks blockchain
- **Clarity 4 Features**: 
  - Latest version with enhanced performance and security
  - Improved cost analysis and optimization
  - Better trait support for token standards
  - Block height-based timing for daily claims
- **SIP-010**: Fungible token standard for CHEER tokens
- **Traits**: Interface definitions for contract interoperability
- **Clarinet**: Development environment and testing framework for Clarity 4
- **Block Height Tracking**: Used for 24-hour claim cooldown (144 blocks ≈ 24 hours)

### Storage Layer (Pinata)
- **IPFS**: Decentralized storage for creator profiles
- **Pinata API**: Gateway for uploading/retrieving creator metadata
- **Content Storage**: Profile images, bio data, portfolio links
- **CID Management**: Content-addressed data retrieval

### Frontend Layer (Vite + React)
- **Vite**: Fast build tool and development server
- **React 18**: Modern UI library with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first styling framework
- **Stacks.js**: Official Stacks blockchain SDK
- **@stacks/connect**: Wallet connection library

---

## 🔄 Application Flow

### 1. User Onboarding Flow (User-Initiated Actions)
```
Landing Page (Hero + Features + How It Works)
    ↓
User explores landing page content (NO auto-redirect)
    ↓
User clicks "Connect Wallet" button in header/hero
    ↓
Hiro/Leather/Xverse Wallet Popup appears
    ↓
User approves connection
    ↓
Wallet connected (shown in header with address)
    ↓
User REMAINS on landing page (no forced navigation)
    ↓
User clicks "Go to Dashboard" CTA button (explicit action)
    ↓
Dashboard loads with user data
    ↓
User can browse creators, claim daily CHEER tokens, or become a creator
```

### 2. Creator Registration Flow
```
Dashboard → "Become a Creator" Button
    ↓
Registration Form (Name, Bio, Social Links, Profile Image)
    ↓
Upload to Pinata IPFS (profile image + metadata)
    ↓
Get IPFS CID (Content Identifier)
    ↓
Call Smart Contract: register-creator(name, metadata-cid)
    ↓
Transaction confirmation via wallet
    ↓
Creator profile active on platform
    ↓
Creator appears in leaderboard with 0 tips
```

### 3. Tipping Flow (STX)
```
User browses creators on Leaderboard
    ↓
Clicks on creator card
    ↓
Creator profile page loads (data from IPFS + blockchain)
    ↓
User clicks "Tip with STX"
    ↓
Tip modal opens with amount input
    ↓
User enters STX amount
    ↓
Call Smart Contract: tip-with-stx(creator-principal, amount)
    ↓
Wallet popup for transaction approval
    ↓
User confirms transaction
### 4. Daily CHEER Token Claim Flow
```
User on Dashboard or any page
    ↓
Sees "Claim Daily CHEER" notification/button
    ↓
Checks eligibility (last claim was 24+ hours ago)
    ↓
User clicks "Claim 100 CHEER" button
    ↓
Call Smart Contract: claim-daily-tokens()
    ↓
Contract validates 24-hour cooldown passed
    ↓
Wallet popup for transaction approval (minimal gas fee)
    ↓
User confirms transaction
    ↓
100 CHEER tokens minted to user's wallet
### 6. Leaderboard Update Flow (Dual Leaderboards)
```
Smart Contract Event Emitted (on tip/cheer)
    ↓
Frontend listens to blockchain events
    ↓
Both leaderboards data re-fetched:
    - Creator leaderboard (tips/cheers received)
    - Tipper leaderboard (tips/cheers given)
    ↓
Sorting algorithm runs for both:
    - Creators by total value received
    - Tippers by total value given
    ↓
Top 50 displayed with rankings for each
    ↓
Rank changes highlighted with animations
    ↓
Real-time updates via polling or websockets
```

### 7. Social Sharing Flow (Viral Growth)
```
User completes action:
    - Registers as creator
    - Tips a creator with STX
    - Cheers with CHEER
    - Reaches milestone (e.g., 10th tip)
    ↓
Success modal appears with confetti animation
    ↓
"Share Your Achievement" section displayed
    ↓
Pre-filled share message with:
    - Action details ("Just tipped @CreatorName")
    - Platform link (tipz-stacks.com/creator/abc123)
    - Hashtags (#TipzStacks #StacksNFT #CreatorEconomy)
    - Profile/achievement link
    ↓
User clicks share button (X/Twitter, Facebook, LinkedIn)
    ↓
Social platform opens with pre-filled message
    ↓
User can edit and post
    ↓
Post includes:
    - Shareable achievement card (Open Graph image)
    - Direct link back to Tipz platform
    - Creator profile link (drives traffic)
    ↓
Other users see post → Click link → Visit platform
    ↓
Viral growth loop continues
``` ↓
System checks user's CHEER balance
    ↓
If balance is low, shows "Claim Daily CHEER" suggestion
    ↓
User enters CHEER amount
    ↓
Call Smart Contract: cheer-creator(creator-principal, amount)
    ↓
CHEER tokens transferred from user to creator
    ↓
Cheer count incremented on leaderboard
    ↓
Success animation with confetti effect
``` ↓
Call Smart Contract: cheer-creator(creator-principal, amount)
    ↓
CHEER tokens transferred from user to creator
    ↓
Cheer count incremented on leaderboard
    ↓
Success animation with confetti effect
```

### 5. Leaderboard Update Flow
```
Smart Contract Event Emitted (on tip/cheer)
    ↓
Frontend listens to blockchain events
    ↓
Leaderboard data re-fetched
    ↓
Sorting algorithm runs (by total tips + cheers value)
    ↓
Top creators displayed with rankings
    ↓
Real-time updates via polling or websockets
```

---

## 📜 Smart Contract Architecture

### Contract 1: `cheer-token.clar` (CHEER Token)

**Purpose**: Platform's native fungible token for "cheering" creators with daily claiming mechanism

**Key Features**:
- Implements SIP-010 fungible token standard
- Daily claim system: Each user can claim/mint 100 CHEER tokens every 24 hours
- Transfer functionality between users
- Balance tracking per principal
- Claim cooldown tracking to prevent abuse
- Token metadata (name, symbol, decimals, uri)

**Main Functions**:
- `transfer(amount, sender, recipient, memo)`: Transfer CHEER tokens between principals
- `get-balance(principal)`: Query token balance of an address
- `get-total-supply()`: Get total circulating supply
- `claim-daily-tokens()`: Allows any user to mint 100 CHEER tokens once per 24 hours
- `get-last-claim-time(principal)`: Check when user last claimed tokens
- `can-claim-now(principal)`: Check if user is eligible to claim (24 hours passed)
- `get-time-until-next-claim(principal)`: Returns remaining cooldown time in seconds

**Data Structures**:
- Token balances map: `{principal → uint}`
- Last claim timestamp map: `{principal → uint}` (tracks block height or timestamp)
- Total supply variable
- Token metadata constants
- Daily claim amount constant: `100 CHEER`
- Claim cooldown period constant: `144 blocks` (approximately 24 hours on Stacks)

**Daily Claim Logic**:
1. User calls `claim-daily-tokens()` function
2. Contract checks `last-claim-time` for the user's principal
3. If no previous claim exists OR 24 hours (144 blocks) have passed, proceed
4. Mint 100 CHEER tokens to user's balance
5. Update `last-claim-time` with current block height
6. Emit `tokens-claimed` event
7. If cooldown not passed, return error with time remaining

**Security Considerations**:
- Block height validation to prevent time manipulation
- Single claim per 24-hour period enforcement
- Overflow protection on minting
- No admin mint function (decentralized distribution)

---

### Contract 2: `tipz-core.clar` (Main Platform Logic)

**Purpose**: Core tipping, creator management, and dual leaderboard functionality

**Key Features**:
- Creator registration and profile management
- STX tipping mechanism
- CHEER token integration for cheering
- Dual leaderboard system:
  - **Creator Leaderboard**: Rankings based on tips/cheers received
  - **Tipper Leaderboard**: Rankings based on tips/cheers given
- Statistics tracking for both creators and tippers
- Social sharing integration (shareable achievements)
**Hero Section** (Full Landing Page Experience):
- **Primary Headline**: "Empower Your Favorite Creators" (large, bold, Inter/Poppins font)
- **Subheadline**: "Tip with STX or Cheer with CHEER tokens. Support creators on the Stacks blockchain."
- **Dual CTA Buttons**:
  - Primary: "Connect Wallet" (orange, large, prominent)
  - Secondary: "Go to Dashboard" (only shown when wallet connected, orange outline)
**Features Section** (Below Hero):
- **Section Headline**: "Why Creators Choose Tipz"
- **Three/Four Column Layout** (responsive):
  - **"Tip with STX"**: Direct Bitcoin-secured payments to creators
  - **"Cheer with CHEER"**: Free daily tokens for engagement
  - **"Claim 100 CHEER Daily"**: No cost to support your favorite creators
  - **"Fair Leaderboard"**: Transparent creator rankings based on support
- **Visual Design**:
**How It Works** (Detailed Process Section):
- **Section Headline**: "Get Started in Minutes"
- **Step-by-step Visual Guide** (horizontal timeline on desktop, vertical on mobile):
  1. **Connect Wallet**: "Connect your Hiro, Leather, or Xverse wallet in seconds"
  2. **Claim Daily CHEER**: "Get 100 free CHEER tokens every 24 hours"
  3. **Discover Creators**: "Browse profiles and find creators you love"
  4. **Tip or Cheer**: "Support with STX or CHEER tokens"
  5. **Track Impact**: "Watch creators rise on the leaderboard"
- **Visual Design**:
  - Orange numbered circles for steps
  - Connecting line/path between steps
  - Icon for each step
  - Short description under each
- **Mobile**: Vertical accordion or single-column flow

**CTA Section** (Final Push):
- **Primary CTA**: "Start Supporting Creators" (large orange button)
- **Secondary CTA**: "Become a Creator" (outline button)
- **Platform Statistics Dashboard**:
  - Total STX tipped
  - Total CHEER claimed
  - Active creators count
  - Community members
- **Visual Design**: 
  - Orange background section or gradient
  - White text for contrast
  - Stats in large, bold numbers
  - Call-to-action centered with ample padding
- **No Auto-Navigation**: User must click button to proceed
  - Connect Wallet button (right)
  - Wallet address displayed when connected (truncated: ST1A...X2Y)
- **Mobile Responsive**:
  - Single column layout on mobile
  - Larger touch-friendly buttons (min 44px height)
**Dashboard Layout**:
- Main content area with:
  - **Daily Claim Widget** (prominent card at top):
    - "Claim Your 100 CHEER" button (if eligible)
    - Countdown timer if already claimed (e.g., "Next claim in 18h 32m")
    - Total CHEER claimed lifetime stat
  - **Wallet Balance Card**: 
    - STX balance
    - CHEER balance
    - USD equivalent (optional)
  - **Quick Actions**:
    - "Discover Creators" button
    - "View Leaderboard" button
    - "Become a Creator" button (if not already creator)
  - **Recent Activity Feed**:
    - Tips sent/received
    - Cheers given/received
    - CHEER claims history
  - **Recommended Creators Carousel**:
    - Horizontal scrolling cards
    - Quick tip buttons on each card
**Tipping Functions**:
- `tip-with-stx(creator, amount)`: Send STX tip to creator
- `cheer-with-token(creator, amount)`: Send CHEER tokens to creator
- `get-tips-received(creator)`: Get total STX tips received
- `get-cheers-received(creator)`: Get total CHEER tokens received

**Creator Leaderboard Functions**:
- `get-creator-leaderboard(limit)`: Fetch top N creators by tips/cheers received
- `get-creator-rank(creator)`: Get specific creator's rank
- `calculate-creator-score(creator)`: Compute weighted score (STX + CHEER value)
- `get-creator-stats(creator)`: Get detailed stats (total received, supporters count, rank)

**Tipper Leaderboard Functions**:
- `get-tipper-leaderboard(limit)`: Fetch top N tippers by tips/cheers given
- `get-tipper-rank(tipper)`: Get specific tipper's rank
- `calculate-tipper-score(tipper)`: Compute weighted score (STX + CHEER given)
- `get-tipper-stats(tipper)`: Get detailed stats (total given, creators supported, rank)
- `get-tipper-display-name(tipper)`: Get registered name or wallet address

**Data Structures**:
- Creators map: `{principal → {name, metadata-uri, total-tips-received, total-cheers-received, supporters-count, joined-at}}`
- Tippers map: `{principal → {display-name (optional), total-stx-given, total-cheer-given, creators-supported, first-tip-at}}`
- Tips history map: `{tipper-principal → {creator-principal → amount}}`
- Creator leaderboard state: Sorted list by tips/cheers received
- Tipper leaderboard state: Sorted list by tips/cheers given
- Share events log: Track shareable achievements for social proof

**Events Emitted**:
- `creator-registered`: When new creator joins (shareable achievement)
- `tip-sent`: When STX tip is made (shareable achievement)
- `cheer-sent`: When CHEER tokens are transferred (shareable achievement)
- `profile-updated`: When creator updates metadata
- `tipper-milestone`: When tipper reaches achievement (10, 50, 100 tips, etc.)
- `leaderboard-position-change`: When creator/tipper moves up rankings

**Shareable Achievement Data** (included in events):
- Event type (registration, tip, cheer, milestone)
- User principal and display name
- Creator name (for tips/cheers)
- Amount (for tips/cheers)
- Rank/milestone details
- Timestamp and transaction ID
- Platform URL for social sharing

---

## 🎨 Frontend Components Breakdown

### Landing Page Components

**Hero Section**:
- Eye-catching headline: "Empower Your Favorite Creators"
- Subheadline explaining tipping with STX & CHEER
- Large "Connect Wallet" CTA button (orange)
- Background: Clean white with subtle orange gradients

**Features Section**:
- Three column layout:
  - "Tip with STX" - Direct Bitcoin-secured payments
### Connection Process (No Forced Routing)
1. User clicks "Connect Wallet" button (on landing page header or hero)
2. `@stacks/connect` library triggers wallet selection modal
3. User chooses preferred wallet (Hiro/Leather/Xverse)
4. Wallet extension/app prompts for authorization
5. User approves connection
6. App receives user's Stacks address (principal)
7. **User STAYS on current page** (no auto-redirect)
8. Header updates to show:
   - Connected wallet address (truncated)
   - "Go to Dashboard" button becomes active
   - Disconnect option in dropdown
9. User must **explicitly click "Go to Dashboard"** to navigate
10. Dashboard loads with personalized data:
    - Daily claim eligibility check
    - Wallet balances (STX + CHEER)
    - Creator status
    - Transaction history
  3. Tip or cheer to show support
  4. Watch creators rise on the leaderboard

**CTA Section**:
- Secondary CTA: "Join as Creator" button
- Statistics: Total tips sent, creators supported, etc.

---

### Dashboard Components

**Sidebar Navigation**:
- Fixed left sidebar
- Orange highlight for active route
- Menu items:
  - Dashboard (home icon)
  - Discover Creators (search icon)
  - Leaderboard (trophy icon)
  - My Profile (user icon)
  - Wallet (wallet icon)
  - Settings (gear icon)

**Dashboard Layout**:
- Main content area with:
  - Wallet balance card (STX + CHEER)
  - Recent tips/cheers activity feed
  - Recommended creators carousel
  - Quick tip buttons

**Creator Profile Component**:
- Profile banner with image from IPFS
- Creator name and bio
- Social media links
- Statistics (total tips, cheers, supporters)
- Large tip/cheer action buttons
### Journey 1: First-Time Visitor to Tipper (Intentional Navigation)
```
1. Lands on beautiful white/orange landing page
2. Scrolls through hero, features, and "How It Works" sections
3. Reads about platform (tips with STX, cheers with CHEER, daily claims)
4. Clicks "Connect Wallet" in header
5. Connects Hiro Wallet via popup
6. Wallet connected - STAYS ON LANDING PAGE (no auto-redirect)
7. Sees "Go to Dashboard" button now active in hero/header
8. User clicks "Go to Dashboard" (explicit action)
9. Dashboard loads - sees "Claim 100 CHEER" widget at top
10. Clicks "Claim Daily CHEER" button
11. Confirms transaction (minimal gas fee)
12. Receives 100 CHEER tokens - success notification shown
13. Sees timer: "Next claim available in 24 hours"
14. Clicks "Discover Creators" section
15. Browses creator profiles on new page
16. Finds interesting creator
17. Clicks "Cheer with CHEER" (using newly claimed tokens)
18. Enters 50 CHEER amount
19. Confirms transaction in wallet
20. Sees success message with confetti animation
21. Creator's cheer count and rank update on leaderboard
22. User's CHEER balance shows 50 remaining
```anked list of creators (1-50)
- Columns:
  - Rank (with medal icons for top 3)
  - Creator (avatar + name)
  - Total Tips (STX)
  - Total Cheers (CHEER)
  - Combined Score
  - Quick Tip button
- Orange highlights for top performers
- Smooth animations on rank changes

**Creator Card**:
- Compact card view option
- Avatar from IPFS, name, rank badge
- Tip/cheer counts with icons
- "View Profile" link
- "Quick Tip" button (orange)

**Tipper Leaderboard Table**:
- Ranked list of top supporters (1-50)
- Columns:
  - Rank (with trophy icons for top 3: 🥇🥈🥉)
  - Supporter (avatar or wallet icon + display name)
    - Shows registered name if set
    - Shows truncated wallet address if not registered (ST1A...X2Y)
  - Total Tips Given (STX)
  - Total Cheers Given (CHEER)
  - Creators Supported (count)
  - Combined Generosity Score
  - "View Profile" button
- Special badges for milestones:
  - "Generous Supporter" (100+ tips)
  - "Super Fan" (500+ tips)
  - "Platform Champion" (1000+ tips)
- Orange highlights for top performers
- User's own rank highlighted in different color if in list
- Smooth animations on rank changes

**Tipper Profile Card**:
- Wallet avatar or custom profile image
- Display name or "Anonymous Supporter" with wallet
- Rank badge and tier
- Statistics:
  - Total value given (STX + CHEER equivalent)
  - Number of creators supported
  - Favorite creator (most tipped)
  - Member since date
  - Tipping streak (consecutive days)
- Recent tips/cheers activity
- "Support More Creators" CTA button
- "Share My Profile" button (social sharing)

**Filters** (Apply to Both Leaderboards):
- Time period: All Time, This Month, This Week
- Category: All, Artists, Musicians, Writers, etc.
- Sort by: Tips, Cheers, Combined Score

---

## 🔐 Wallet Integration Flow

### Supported Wallets
- **Hiro Wallet**: Official Stacks wallet
- **Leather Wallet**: Privacy-focused option
- **Xverse**: Mobile-friendly wallet

### Core Features
1. **Wallet-Based Authentication**: Passwordless, using Stacks principals (Clarity 4)
2. **Daily CHEER Claims**: Every user can mint 100 CHEER tokens per 24 hours
3. **Dual Tipping System**: STX (direct value) + CHEER (free engagement)
4. **Dual Leaderboards**: 
   - Creator leaderboard (most supported)
   - Tipper leaderboard (most generous supporters)
5. **IPFS Integration**: Decentralized profile storage via Pinata
6. **Real-Time Rankings**: Dynamic leaderboards with live updates
7. **Social Sharing**: Share every achievement on X, Facebook, LinkedIn
8. **Viral Growth Loops**: Shareable cards, referral tracking, achievement badges
9. **Creator Profiles**: Rich profiles with multimedia content from IPFS
10. **Tipper Profiles**: Public supporter profiles (registered or anonymous)
11. **Transaction History**: Complete audit trail of all tips/cheers/claims
12. **Responsive Design**: Mobile-first white/orange theme with perfect typography
13. **Intentional Navigation**: No forced routing - users control their journey
14. **Claim Tracking**: Countdown timers and eligibility indicators
15. **Milestone System**: Badges and achievements for engagement
16. **Privacy Controls**: Users control sharing preferences and visibilityry)
8. Dashboard renders with personalized data

### Transaction Signing
- All state-changing operations require wallet signature
- Read-only calls don't need signatures
- Clear transaction details shown before signing
- Gas fee estimation displayed

---

## 📊 Data Flow & State Management

### Blockchain Data (Source of Truth)
- Creator registrations
- Tipping transactions
- CHEER token balances
- Leaderboard scores
- Contract state

### IPFS Data (Pinata)
- Creator profile images
- Detailed bio information
- Portfolio links
- Social media handles
- Any large metadata

### Frontend State
- React Context/Zustand for global state:
  - Connected wallet address
  - User's STX and CHEER balances
  - Current creator profile (if applicable)
  - Cached leaderboard data
  - UI state (modals, notifications)

### Data Synchronization
- Initial load: Fetch from blockchain + IPFS
- Real-time updates: Poll blockchain every 30 seconds
- Event listening: Subscribe to contract events
- Optimistic updates: Update UI before confirmation
- Error handling: Revert on transaction failure

---

## 🚀 Key User Journeys

### Journey 1: First-Time Visitor to Tipper
```
1. Lands on beautiful white/orange landing page
2. Reads about platform (tips with STX, cheers with CHEER)
3. Clicks "Connect Wallet"
4. Connects Hiro Wallet
5. Redirected to Dashboard
6. Sees "Discover Creators" section
7. Browses creator profiles
8. Finds interesting creator
9. Clicks "Tip 1 STX"
10. Confirms transaction in wallet
11. Sees success message with confetti
12. Creator's rank updates on leaderboard
```

### Journey 2: Creator Registration
```
1. User lands on platform with wallet connected
### Typography (Mobile-First, Clarity 4 Era)

**Font Families**:
- **Primary Headings**: Inter (700-800 weight) or Poppins (600-700 weight)
- **Body Text**: Inter (400-500 weight) or System UI stack
- **Monospace** (for wallet addresses, tokens): JetBrains Mono or Fira Code

**Font Sizes** (Responsive Scale):

**Mobile (320px - 767px)**:
- Hero Headline: 32px - 36px (2rem - 2.25rem)
- Section Headings (H2): 24px - 28px (1.5rem - 1.75rem)
- Subsections (H3): 20px - 22px (1.25rem - 1.375rem)
- Body Text: 16px (1rem) - MINIMUM for readability
- Small Text/Captions: 14px (0.875rem)
- Button Text: 16px - 18px (1rem - 1.125rem)

**Tablet (768px - 1023px)**:
- Hero Headline: 40px - 48px (2.5rem - 3rem)
- Section Headings (H2): 32px - 36px (2rem - 2.25rem)
- Subsections (H3): 24px (1.5rem)
- Body Text: 16px - 18px (1rem - 1.125rem)
- Button Text: 16px - 18px

**Desktop (1024px+)**:
- Hero Headline: 56px - 72px (3.5rem - 4.5rem)
- Section Headings (H2): 40px - 48px (2.5rem - 3rem)
- Subsections (H3): 28px - 32px (1.75rem - 2rem)
- Body Text: 18px - 20px (1.125rem - 1.25rem)
- Button Text: 18px

**Font Weight Scale**:
- Headlines: 700-800 (Bold/Extra Bold)
- Subheadings: 600 (Semi-Bold)
- Body: 400 (Regular)
- Emphasis: 500-600 (Medium/Semi-Bold)
- Light Text: 300 (use sparingly)

**Line Height**:
- Headlines: 1.2 (tight, impactful)
- Body Text: 1.6 - 1.8 (comfortable reading)
- Small Text: 1.5

**Letter Spacing**:
- Headlines: -0.02em to -0.01em (slightly tighter)
- Body: 0 (default)
- Uppercase Text: 0.05em (wider for readability)

**Accessibility**:
- Minimum body text: 16px on all devices
- Sufficient contrast ratios (WCAG AA: 4.5:1 for normal text)
- Orange text on white: Use darker shade (#E65100) for small text
- Touch targets: Minimum 44x44px for buttons/interactive elements
   - Profile image upload
   - Social links (Twitter, Instagram, YouTube)
4. Clicks "Upload to IPFS" (handled by Pinata)
5. IPFS returns CID for metadata
6. Smart contract call: register-creator(name, CID)
7. Confirms transaction (small fee)
8. Profile goes live immediately
9. Added to leaderboard at bottom
10. Shareable profile link generated
```

### Journey 3: Leaderboard Engagement (Dual Boards)
```
1. User navigates to Leaderboards page
2. Sees "Top Creators" tab active by default
3. Views top 10 creators with orange highlights
4. Clicks "Top Supporters" tab
5. Sees tipper leaderboard with their own rank highlighted (#23)
6. Goal: Move up to top 20
7. Returns to "Top Creators" tab
8. Filters by "This Month"
9. Discovers new creator at #7
10. Clicks on creator card
11. Views full profile (loaded from IPFS)
12. Decides to cheer with 100 CHEER tokens
13. Opens cheer modal
14. Enters amount and confirms
15. Transaction processed
16. Success modal appears with confetti
17. "Share Your Cheer" section displayed
18. User clicks "Share on X" button
19. Pre-filled tweet opens: "Just cheered @CreatorName with 100 CHEER! 🎉"
20. User edits message and posts
21. Share modal closes
22. Both leaderboards auto-refresh
23. Creator moves up to #6 (creator board)
24. User moves up to #22 (tipper board)
25. Rank change highlighted with animation
```

### Journey 4: Creator Registration with Social Sharing
```
1. User clicks "Become a Creator" on dashboard
2. Fills registration form (name, bio, image, socials)
3. Uploads profile image to Pinata IPFS
4. Receives IPFS CID
5. Smart contract call: register-creator(name, CID)
6. Confirms transaction in wallet
7. Transaction confirmed on blockchain
8. Success modal with celebration animation
9. "You're Now a Creator!" message
10. Profile link generated: tipz-stacks.com/creator/username
11. "Share Your Creator Profile" section appears
12. Pre-filled message: "🎨 Just joined Tipz Stacks as a creator!"
13. Shareable card preview shows profile image and bio
14. User clicks "Share on X"
15. Twitter/X opens with message and profile link
16. User posts tweet
17. Tweet includes Open Graph card with profile preview
18. Followers click link → visit creator profile
19. Some followers tip/cheer the new creator
20. Creator appears on leaderboard at bottom
21. Viral growth cycle begins
```

### Journey 5: Milestone Achievement & Social Proof
```
1. User tips their 10th creator
2. Transaction confirms
3. Success modal + confetti animation
4. "Milestone Unlocked!" banner appears
5. "You've supported 10 creators!" message
6. New badge earned: "Generous Supporter" 🌟
7. Badge displayed on user profile
8. "Share Your Achievement" section shown
9. Pre-filled message: "🎊 Just supported my 10th creator on @TipzStacks!"
10. Shareable card shows:
    - Milestone: "10 Creators Supported"
    - Total impact: X STX + Y CHEER
    - New badge graphic
    - User's tipper rank
11. User clicks "Share on LinkedIn" (professional audience)
12. Post goes live with achievement card
13. LinkedIn network sees post
14. Several connections visit platform
15. Some connect wallet and start tipping
16. Platform gains new users (viral growth)
17. User checks tipper leaderboard
18. Moved up 5 positions due to milestone
19. Motivated to reach next milestone (25 creators)
```

---

## 🎯 Platform Features Breakdown

### Core Features
### Advanced Features (Future Enhancements)
- Creator tiers/badges based on support received
- Subscription model for recurring tips
- Tipper milestone celebrations with special rewards
- Creator analytics dashboard with share metrics
- NFT rewards for top supporters and creators
- Community voting on featured creators
- Integration with creator content (videos, music, art)
- Social leaderboard (most shares, highest viral coefficient)
- Cross-platform sharing (Discord, Telegram, Instagram)
- Collaborative tipping (group tips from multiple users)
- Tipping campaigns for specific goals
- Creator story highlights (sharable moments)
- Live tipping during creator events/streams
### Advanced Features (Future Enhancements)
- Creator tiers/badges based on support received
- Subscription model for recurring tips
- Milestone celebrations (e.g., "1000th tipper")
- Creator analytics dashboard
- NFT rewards for top supporters
- Community voting on featured creators
- Integration with creator content (videos, music, art)

---

## 🛠️ Development Workflow

### Smart Contract Development
1. Initialize Clarinet project in `contract/` folder
2. Write Clarity contracts with Clarity 4 syntax
3. Write comprehensive unit tests in TypeScript
4. Run `clarinet test` for local testing
5. Deploy to devnet for integration testing
6. Deploy to testnet for pre-production validation
7. Audit and deploy to mainnet

### Frontend Development
1. Initialize Vite + React project in `frontend/` folder
2. Set up Tailwind CSS with white/orange theme
3. Create reusable component library
4. Implement Stacks.js for blockchain interaction
5. Integrate Pinata SDK for IPFS operations
6. Build responsive layouts (mobile → desktop)
7. Test wallet connections across providers
8. Optimize performance and bundle size

### Integration Testing
1. Deploy contracts to local devnet
2. Point frontend to devnet contracts
3. Test complete user flows end-to-end
4. Verify IPFS uploads and retrievals
5. Validate leaderboard calculations
6. Test edge cases and error states

---

## 🎨 Design System

### Typography
- **Headings**: Inter or Poppins (bold, modern)
- **Body**: Open Sans or System UI (readable)
- **Accents**: Orange-colored headings for emphasis

### Spacing
- Generous padding and margins
- Card-based layouts with subtle shadows
- 8px base unit for consistency

### Components
- **Buttons**: Rounded corners, orange primary, white secondary
- **Cards**: White background, light grey border, subtle hover lift
- **Inputs**: Clean borders, orange focus states
- **Modals**: Centered, blurred backdrop, smooth animations

### Animations
- Smooth page transitions (fade-in)
- Hover effects on interactive elements
- Success animations (confetti for tips)
- Loading states (skeleton screens)
- Micro-interactions on button clicks

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px (stack sidebar, single column)
- **Tablet**: 768px - 1023px (collapsible sidebar)
- **Desktop**: 1024px+ (fixed sidebar, multi-column layouts)

---

## 🔒 Security Considerations

### Smart Contract Security
- Input validation on all public functions
- Principal verification (tx-sender checks)
- Overflow/underflow protection (uint safety)
- Reentrancy guards where applicable
### Platform Metrics
- Number of registered creators
- Number of active tippers (all users who've tipped)
- Total STX tipped (volume)
- Total CHEER tokens circulated
- Total CHEER claimed (daily claim engagement)
- Daily active users (DAU)
- Monthly active users (MAU)
- Average tip size (STX and CHEER)
- Creator leaderboard engagement rate
- Tipper leaderboard engagement rate
- Social share conversion rate
- Viral coefficient (new users per shared link)
- Most shared creators
- Average shares per action
- Referral effectivenessders
- Rate limiting on API calls
### User Metrics
- Wallet connection rate
- Creator registration conversion
- Tipper activation rate (first tip)
- Tipping frequency per user
- Average creators supported per tipper
- Retention rate (7-day, 30-day)
- Daily claim streak averages
- Share rate per transaction
- Share-to-registration conversion
- Referral growth and attribution
- Leaderboard position changes
- Milestone achievement rate
- Social reach (impressions from shares)ics
- Number of registered creators
- Total STX tipped (volume)
- Total CHEER tokens circulated
- Daily active users (DAU)
- Monthly active users (MAU)
- Average tip size
- Leaderboard engagement rate

### User Metrics
- Wallet connection rate
- Creator registration conversion
- Tipping frequency per user
- Retention rate (7-day, 30-day)
- Referral growth

---

## 🎁 Daily CHEER Token Claiming System (Detailed)

### Overview
The daily claiming mechanism is a core feature that democratizes participation on the platform. Every user, regardless of financial status, can claim 100 CHEER tokens every 24 hours to support their favorite creators.

### Technical Implementation (Clarity 4)

**Smart Contract Logic**:
```
Daily Claim Function Flow:
1. User calls: (claim-daily-tokens)
2. Contract reads: (get block-height) for current block
3. Contract checks: (map-get? last-claims tx-sender)
4. If first claim: Allow and record block height
5. If previous claim exists: Calculate blocks-passed
6. Required blocks: 144 blocks (≈24 hours at ~10 min/block)
7. If blocks-passed >= 144: Allow claim
8. If blocks-passed < 144: Return error with remaining blocks
9. On success: Mint 100 CHEER to tx-sender
10. Update: (map-set last-claims tx-sender current-block-height)
11. Emit event: (print {event: "tokens-claimed", user: tx-sender, amount: u100})
```

**Block Height vs Timestamp**:
- Clarity 4 uses block height for timing (more reliable than timestamps)
- Stacks block time: ~10 minutes average
- 144 blocks = 1,440 minutes = 24 hours
- Immutable and tamper-proof timing mechanism

**Data Storage**:
```
Maps in Contract:
- balances: {principal → uint} (token balances)
- last-claims: {principal → uint} (last claim block height)

Constants:
- DAILY_CLAIM_AMOUNT: u100 (100 CHEER)
- CLAIM_COOLDOWN_BLOCKS: u144 (24 hours)
- TOKEN_NAME: "Cheer Token"
- TOKEN_SYMBOL: "CHEER"
- TOKEN_DECIMALS: u0 (whole tokens only)
```

### Frontend Integration

**Claim Widget UI States**:

1. **Ready to Claim** (Eligible):
   - Large green checkmark icon
   - "Claim Your 100 CHEER" heading
   - Orange "Claim Now" button (prominent, animated pulse)
   - Subtext: "Free tokens to support creators"

2. **Claimed Recently** (Cooldown Active):
   - Clock icon with countdown
   - "Next Claim Available In" heading
   - Live countdown timer: "18h 32m 15s"
   - Disabled claim button (grey)
   - Progress bar showing cooldown elapsed

3. **First-Time User** (Never Claimed):
   - Gift box icon
   - "Welcome! Claim Your First 100 CHEER" heading
   - Orange "Claim Free Tokens" button
   - Explainer text about daily claims

4. **Transaction Pending**:
   - Loading spinner
   - "Processing Your Claim..." text
   - Transaction hash link to explorer

5. **Claim Success**:
   - Confetti animation
   - "100 CHEER Claimed!" success message
   - Updated balance display
   - "Next claim in 24 hours" countdown starts

**Countdown Timer Logic**:
```
Frontend Calculation:
1. Fetch last-claim block height from contract
2. Get current block height from Stacks API
3. Calculate blocks-passed = current - last-claim
4. Calculate blocks-remaining = 144 - blocks-passed
5. Estimate time-remaining = blocks-remaining × 10 minutes
6. Display as: "Xh Ym Zs"
7. Update every minute (or on new block)
8. When countdown reaches 0: Enable claim button
```

**User Experience Flow**:
```
Dashboard Load
    ↓
Check user's last claim time
    ↓
Calculate eligibility
    ↓
Show appropriate widget state
    ↓
User clicks "Claim Now"
    ↓
Validate eligibility again (prevent race conditions)
    ↓
Call contract function via @stacks/connect
    ↓
Show transaction confirmation modal
    ↓
User approves in wallet
    ↓
Show loading state
    ↓
Listen for transaction confirmation
    ↓
On success: Show confetti, update balance
    ↓
Start 24-hour countdown timer
    ↓
Cache claim time locally (optimistic UI)
```

### Notification System

**Claim Reminders**:
- Browser notification when 24 hours elapsed (if enabled)
- Dashboard badge: "CHEER Ready to Claim!"
- Email reminder (optional, if user opts in)
- In-app notification bell icon with orange dot

**Claiming Streak Tracking** (Future Enhancement):
- Track consecutive days of claiming
- Display streak count: "🔥 7 Day Streak!"
- Badges for milestones: 7, 30, 100, 365 days
- Leaderboard for longest streaks

### Economic Model

**Token Distribution**:
- No pre-mine or admin allocation
- 100% distributed through daily claims
- Decentralized and fair distribution
- No purchase required to participate

**Supply Dynamics**:
- Circulating supply grows by 100 CHEER per active user per day
- If 1,000 daily active users: +100,000 CHEER/day
- Organic growth tied to user engagement
- Deflationary mechanisms (future): Burn on certain actions

**Incentive Alignment**:
- Users claim to support creators (free engagement)
- Creators receive value through cheers
- Platform grows through user retention (daily claims)
- No financial barrier to entry

### Security & Anti-Abuse

**Sybil Attack Prevention**:
- Small gas fee required (prevents spam accounts)
- Rate limiting at application layer
- Wallet reputation scoring (future)
- Activity requirements for new accounts (future)

**Smart Contract Security**:
- No re-entrancy vulnerabilities (Clarity is decidable)
- Overflow protection on minting
- Read-only functions for balance checks
- Principal validation on all claims

**Frontend Validation**:
- Client-side eligibility check before transaction
- Cache last claim time to reduce RPC calls
- Graceful error handling for network issues
- Clear error messages for users

### Analytics & Metrics

**Tracking**:
- Total CHEER claimed (platform-wide)
- Daily active claimers
- Claim success rate
- Average time between claims
- Most popular claim times (time-of-day distribution)

**Display on Platform**:
- Landing page stats: "X Million CHEER Claimed"
- User profile: "Total Claimed: X,XXX CHEER"
- Global stats page: Charts and graphs

---

## 🎬 Conclusion

This project structure provides a comprehensive blueprint for building **Tipz Stacks**, a modern creator economy platform on the Stacks blockchain. By leveraging Clarity 4's security and decidability, Pinata's decentralized storage, and Vite+React's performance, we create a seamless, user-friendly experience for both creators and supporters.

The white and orange design aesthetic ensures the platform feels clean, professional, and action-oriented, while the dual-token system (STX + CHEER) provides flexibility in how users support creators. The leaderboard gamification encourages engagement and creates a transparent, merit-based ecosystem.

**Next Steps**: Begin with smart contract development, followed by frontend scaffolding, and iterate based on user feedback throughout the development process.

---

*Built with ❤️ for the creator economy on Stacks*
