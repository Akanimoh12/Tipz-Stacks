# Tipz Stacks - Smart Contracts

This directory contains the Clarity 4 smart contracts for the Tipz Stacks platform.

## 📁 Contract Structure

```
contract/
├── contracts/
│   ├── cheer-token.clar       # SIP-010 fungible token with daily claims
│   ├── tipz-core.clar         # Main platform logic
│   └── traits/
│       └── sip-010-trait.clar # Fungible token trait interface
├── tests/
│   ├── cheer-token.test.ts    # Token contract tests
│   └── tipz-core.test.ts      # Core logic tests
├── settings/
│   ├── Devnet.toml            # Development network config
│   ├── Testnet.toml           # Testnet config
│   └── Mainnet.toml           # Mainnet config
├── Clarinet.toml              # Project configuration
└── package.json               # Testing dependencies
```

## 🔗 Contract Overview

### 1. cheer-token.clar
**Purpose**: Platform token with daily claiming mechanism

**Key Features**:
- SIP-010 fungible token standard implementation
- Daily claim: 100 CHEER per user every 24 hours
- Block height-based timing (144 blocks ≈ 24 hours)
- Transfer functionality
- Balance tracking

**Main Functions** (To Be Implemented):
- `claim-daily-tokens()` - Mint 100 CHEER if 24h passed
- `transfer()` - Transfer tokens between users
- `get-balance()` - Query token balance
- `can-claim-now()` - Check claim eligibility
- `get-last-claim-time()` - Get last claim timestamp

### 2. tipz-core.clar
**Purpose**: Main platform logic for tipping and leaderboards

**Key Features**:
- Creator registration and management
- STX tipping mechanism
- CHEER token integration
- Dual leaderboard system (creators + tippers)
- Statistics tracking
- Social sharing event emission

**Main Functions** (To Be Implemented):

**Creator Management**:
- `register-creator(name, metadata-uri)` - Register with IPFS CID
- `update-creator-info(metadata-uri)` - Update profile
- `get-creator-info(principal)` - Retrieve creator data

**Tipping**:
- `tip-with-stx(creator, amount)` - Send STX tip
- `cheer-with-token(creator, amount)` - Send CHEER tokens

**Leaderboards**:
- `get-creator-leaderboard(limit)` - Top creators
- `get-tipper-leaderboard(limit)` - Top supporters
- `get-creator-rank(creator)` - Get creator's position
- `get-tipper-rank(tipper)` - Get tipper's position

### 3. traits/sip-010-trait.clar
**Purpose**: Standard trait definition for fungible tokens

**Description**: Interface that cheer-token.clar will implement to ensure SIP-010 compliance.

## 🛠️ Development Setup

### Prerequisites
- Clarinet installed (already done ✓)
- Node.js 18+ for running tests
- TypeScript for test development

### Install Dependencies
```bash
cd contract
npm install
```

### Development Commands

**Check Contract Syntax**:
```bash
clarinet check
```

**Run Tests**:
```bash
npm test
```

**Start Clarinet Console** (Interactive REPL):
```bash
clarinet console
```

**Generate Documentation**:
```bash
clarinet docs
```

## 🧪 Testing

Tests are written in TypeScript using the Clarinet SDK and Vitest framework.

### Test Files
- `tests/cheer-token.test.ts` - Tests for token functionality
- `tests/tipz-core.test.ts` - Tests for platform logic

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test cheer-token.test.ts

# Run tests in watch mode
npm test -- --watch
```

## 🚀 Deployment

### Devnet (Local Development)
```bash
clarinet integrate
```

### Testnet Deployment
1. Configure `settings/Testnet.toml`
2. Deploy using Clarinet or Hiro Platform

### Mainnet Deployment
1. Audit contracts thoroughly
2. Configure `settings/Mainnet.toml`
3. Deploy via Clarinet or Hiro Platform

## 📝 Contract Development Workflow

1. **Define Data Structures**: Set up constants, variables, and maps
2. **Implement Core Logic**: Write public and private functions
3. **Write Tests**: Create comprehensive test cases
4. **Run Tests**: Ensure all tests pass (`clarinet check` && `npm test`)
5. **Deploy to Devnet**: Test in local environment
6. **Deploy to Testnet**: Pre-production validation
7. **Audit**: Security review before mainnet
8. **Deploy to Mainnet**: Production deployment

## 🔐 Security Considerations

- **Input Validation**: All public functions validate inputs
- **Principal Verification**: Use `tx-sender` for authentication
- **Overflow Protection**: Clarity's uint type prevents overflows
- **Reentrancy**: Not applicable (Clarity is decidable)
- **Access Control**: Admin functions properly restricted
- **Block Height**: Used for timing (immutable, tamper-proof)

## 📚 Resources

- [Clarity Language Book](https://book.clarity-lang.org/)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [SIP-010 Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Stacks Documentation](https://docs.stacks.co/)

## 🎯 Current Status

✅ Contract structure initialized
✅ Clarinet project set up
✅ Trait interface defined
✅ Contract templates created
⏳ Contract implementation (next step)
⏳ Test implementation (next step)
⏳ Deployment (future)

---

**Ready for implementation!** The contract structure is now set up and ready for Clarity 4 code development.
