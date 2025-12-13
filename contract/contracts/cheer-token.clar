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

;; Mint Tokens
;; Internal function to create new tokens and assign them to a recipient
;; Used by: claim-daily-tokens function
;; @param recipient: principal - The address receiving the minted tokens
;; @param amount: uint - Number of tokens to mint
;; @returns: (response bool uint) - (ok true) on success, error code on failure
(define-private (mint-tokens (recipient principal) (amount uint))
  (let
    (
      ;; Get current balance of recipient (default to u0 if not found)
      (current-balance (default-to u0 (map-get? token-balances recipient)))
      ;; Get current total supply
      (current-supply (var-get total-supply))
      ;; Calculate new balance after minting
      (new-balance (+ current-balance amount))
      ;; Calculate new total supply after minting
      (new-supply (+ current-supply amount))
    )
    ;; Validate amount is greater than zero
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Update recipient's balance in the map
    (map-set token-balances recipient new-balance)
    
    ;; Update total supply variable
    (var-set total-supply new-supply)
    
    ;; Return success
    (ok true)
  )
)

;; Burn Tokens
;; Internal function to destroy tokens from a sender's balance
;; Used for: future deflationary mechanisms or token removal
;; @param sender: principal - The address whose tokens will be burned
;; @param amount: uint - Number of tokens to burn
;; @returns: (response bool uint) - (ok true) on success, error code on failure
(define-private (burn-tokens (sender principal) (amount uint))
  (let
    (
      ;; Get current balance of sender (default to u0 if not found)
      (current-balance (default-to u0 (map-get? token-balances sender)))
      ;; Get current total supply
      (current-supply (var-get total-supply))
      ;; Calculate new balance after burning
      (new-balance (- current-balance amount))
      ;; Calculate new total supply after burning
      (new-supply (- current-supply amount))
    )
    ;; Validate amount is greater than zero
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Validate sender has sufficient balance to burn
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)
    
    ;; Update sender's balance in the map
    (map-set token-balances sender new-balance)
    
    ;; Update total supply variable
    (var-set total-supply new-supply)
    
    ;; Return success
    (ok true)
  )
)

;; Can Claim Tokens
;; Validates if a user is eligible to claim daily tokens
;; Checks: 144 blocks (24 hours) have passed since last claim
;; @param user: principal - The address attempting to claim
;; @returns: (response bool uint) - (ok true) if eligible, error with descriptive message if not
(define-private (can-claim-tokens (user principal))
  (let
    (
      ;; Get the block height of user's last claim (u0 if never claimed)
      (last-claim (default-to u0 (map-get? last-claim-block-heights user)))
      ;; Get current block height from Stacks blockchain
      (current-block stacks-block-height)
      ;; Calculate blocks elapsed since last claim
      (blocks-passed (- current-block last-claim))
    )
    ;; Check if user has never claimed (last-claim = u0) OR 144+ blocks have passed
    ;; If last-claim is u0, this is their first claim (always eligible)
    ;; If blocks-passed >= CLAIM_COOLDOWN_BLOCKS (144), cooldown period has expired
    (if (or (is-eq last-claim u0) (>= blocks-passed CLAIM_COOLDOWN_BLOCKS))
      ;; User is eligible to claim
      (ok true)
      ;; User is not eligible - cooldown still active
      ERR-CLAIM-COOLDOWN-ACTIVE
    )
  )
)

;; Blocks Until Next Claim
;; Calculates how many blocks remain until user can claim again
;; Used for: frontend countdown timers and user information
;; @param user: principal - The address to check
;; @returns: uint - Number of blocks remaining (0 if can claim now)
(define-private (blocks-until-next-claim (user principal))
  (let
    (
      ;; Get the block height of user's last claim (u0 if never claimed)
      (last-claim (default-to u0 (map-get? last-claim-block-heights user)))
      ;; Get current block height
      (current-block stacks-block-height)
      ;; Calculate blocks elapsed since last claim
      (blocks-passed (- current-block last-claim))
    )
    ;; If never claimed or cooldown expired, return 0 (can claim now)
    (if (or (is-eq last-claim u0) (>= blocks-passed CLAIM_COOLDOWN_BLOCKS))
      u0
      ;; Otherwise, calculate remaining blocks in cooldown period
      ;; Formula: 144 (cooldown) - blocks_passed = blocks_remaining
      (- CLAIM_COOLDOWN_BLOCKS blocks-passed)
    )
  )
)


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
