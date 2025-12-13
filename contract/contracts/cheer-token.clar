;; Cheer Token - SIP-010 Fungible Token Contract
;; Platform token for cheering creators on Tipz Stacks
;; Implements daily claiming mechanism (100 CHEER per 24 hours)

;; Title: cheer-token
;; Version: 1.0.0
;; Summary: Platform token with daily claim mechanism
;; Description: SIP-010 compliant token allowing users to claim 100 CHEER every 24 hours

;; ============================================
;; Traits
;; ============================================
;; Import the SIP-010 fungible token trait
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)
;; This contract implements the SIP-010 standard


;; ============================================
;; Constants
;; ============================================

;; Token Metadata
;; Token name following SIP-010 standard
(define-constant TOKEN_NAME "Cheer Token")

;; Token symbol (ticker) for the token
(define-constant TOKEN_SYMBOL "CHEER")

;; Number of decimal places (0 = whole tokens only)
(define-constant TOKEN_DECIMALS u0)

;; Optional URI for token metadata (can be updated to IPFS link)
(define-constant TOKEN_URI u"https://tipz-stacks.com/cheer-token-metadata.json")

;; Daily Claim Mechanism
;; Amount of CHEER tokens users can claim daily
(define-constant DAILY_CLAIM_AMOUNT u100)

;; Cooldown period in blocks (~24 hours at 10 min/block)
;; 144 blocks = 1,440 minutes = 24 hours
(define-constant CLAIM_COOLDOWN_BLOCKS u144)

;; Contract Owner
;; The principal that deployed the contract
(define-constant CONTRACT_OWNER tx-sender)


;; ============================================
;; Data Variables
;; ============================================

;; Total Supply
;; Tracks the total number of CHEER tokens in circulation
;; Starts at u0 and increases with each daily claim
;; Maximum value: unlimited (grows with platform adoption)
(define-data-var total-supply uint u0)

;; Token URI
;; Optional metadata URI pointing to token information (JSON)
;; Can be updated to IPFS link for decentralized metadata
;; Example: ipfs://QmXx.../cheer-token-metadata.json
(define-data-var token-uri (optional (string-utf8 256)) (some TOKEN_URI))


;; ============================================
;; Data Maps
;; ============================================

;; Token Balances
;; Maps each principal (user address) to their CHEER token balance
;; Key: principal (user's Stacks address)
;; Value: uint (token balance, default u0 if not set)
;; Updated on: transfers, mints (claims), burns (future)
(define-map token-balances principal uint)

;; Last Claim Block Heights
;; Tracks the block height when each user last claimed tokens
;; Key: principal (user's Stacks address)
;; Value: uint (Stacks block height, 0 if never claimed)
;; Used to enforce 144-block (24-hour) cooldown period
;; Block height is more reliable than timestamps on blockchain
(define-map last-claim-block-heights principal uint)

;; Total Claimed Per User
;; Tracks lifetime CHEER tokens claimed by each user
;; Key: principal (user's Stacks address)
;; Value: uint (total tokens claimed across all claims)
;; Used for: analytics, user statistics, engagement tracking
;; Increments by DAILY_CLAIM_AMOUNT (100) on each successful claim
(define-map total-claimed-by-user principal uint)


;; ============================================
;; Error Codes
;; ============================================

;; Authorization Errors
;; Returned when caller is not authorized for the operation
(define-constant ERR-NOT-AUTHORIZED (err u100))

;; Returned when only contract owner can perform action
(define-constant ERR-OWNER-ONLY (err u101))

;; Transfer Errors
;; Returned when sender has insufficient balance for transfer
(define-constant ERR-INSUFFICIENT-BALANCE (err u200))

;; Returned when transfer amount is zero or invalid
(define-constant ERR-INVALID-AMOUNT (err u201))

;; Daily Claim Errors
;; Returned when user tries to claim before 24-hour cooldown expires
(define-constant ERR-CLAIM-COOLDOWN-ACTIVE (err u300))

;; Returned when claim has already been processed in current period
(define-constant ERR-ALREADY-CLAIMED (err u301))

;; Returned when claim amount would cause overflow
(define-constant ERR-CLAIM-OVERFLOW (err u302))

;; General Errors
;; Returned when an arithmetic operation would overflow
(define-constant ERR-OVERFLOW (err u400))

;; Returned when an arithmetic operation would underflow
(define-constant ERR-UNDERFLOW (err u401))


;; ============================================
;; Private Functions
;; ============================================
;; (Private helper functions will be defined here)


;; ============================================
;; Public Functions - SIP-010 Implementation
;; ============================================
;; (SIP-010 standard functions will be implemented here)


;; ============================================
;; Public Functions - Daily Claim Mechanism
;; ============================================
;; (Daily claim functions will be implemented here)


;; ============================================
;; Read-Only Functions
;; ============================================
;; (Read-only functions will be implemented here)
