;; Tipz Core - Main Platform Logic Contract
;; Handles tipping, creator management, and leaderboard functionality
;; Integrates with cheer-token for CHEER token operations

;; Title: tipz-core
;; Version: 1.0.0
;; Summary: Main platform logic for creator tipping and leaderboards
;; Description: Manages creators, tippers, STX tipping, CHEER cheering, and dual leaderboards

;; ============================================
;; Traits
;; ============================================
;; Reference to cheer-token contract for CHEER operations
;; Will be used for cheering functionality


;; ============================================
;; Constants
;; ============================================

;; Contract owner (deployer) - has admin privileges
(define-constant CONTRACT_OWNER tx-sender)

;; Minimum tip amount: 1 STX = 1,000,000 micro-STX
;; Prevents spam and ensures meaningful contributions
(define-constant MIN_TIP_AMOUNT u1000000)

;; Platform fee percentage (0% for now, future-proofing for sustainability)
;; Represented as basis points: u0 = 0%, u100 = 1%, u1000 = 10%
(define-constant PLATFORM_FEE_PERCENTAGE u0)

;; Maximum lengths for string inputs (gas optimization)
(define-constant MAX_NAME_LENGTH u50)          ;; Creator/tipper display names
(define-constant MAX_URI_LENGTH u256)          ;; IPFS metadata URIs (Pinata CIDs)
(define-constant MIN_NAME_LENGTH u3)           ;; Minimum name length for validation


;; ============================================
;; Error Codes
;; ============================================

;; Authorization errors (100-series)
(define-constant ERR-NOT-AUTHORIZED (err u100))

;; Creator-related errors (101-104)
(define-constant ERR-CREATOR-EXISTS (err u101))
(define-constant ERR-CREATOR-NOT-FOUND (err u102))

;; Transaction validation errors (103-106)
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant ERR-SELF-TIP (err u104))
(define-constant ERR-INSUFFICIENT-BALANCE (err u105))
(define-constant ERR-TRANSFER-FAILED (err u106))

;; Input validation errors (107-108)
(define-constant ERR-INVALID-NAME (err u107))
(define-constant ERR-INVALID-URI (err u108))


;; ============================================
;; Data Variables
;; ============================================

;; Platform-wide statistics counters
;; These track aggregate metrics for the entire platform

;; Total number of registered creators
(define-data-var total-creators uint u0)

;; Total number of unique tippers (users who have tipped at least once)
(define-data-var total-tippers uint u0)

;; Total amount of STX tipped across all creators (in micro-STX)
(define-data-var total-stx-tipped uint u0)

;; Total amount of CHEER tokens cheered across all creators
(define-data-var total-cheer-tipped uint u0)


;; ============================================
;; Data Maps
;; ============================================

;; Creator profiles map: principal -> creator data
;; Stores all registered creator information
(define-map creators
  principal
  {
    name: (string-ascii 50),              ;; Display name (3-50 chars)
    metadata-uri: (string-ascii 256),     ;; IPFS CID from Pinata (full profile JSON)
    total-stx-received: uint,             ;; Total STX tips received (micro-STX)
    total-cheer-received: uint,           ;; Total CHEER tokens received
    supporters-count: uint,               ;; Number of unique supporters
    created-at: uint                      ;; Block height of registration
  }
)

;; Tipper profiles map: principal -> tipper data
;; Tracks users who have tipped/cheered creators
(define-map tippers
  principal
  {
    display-name: (optional (string-ascii 50)),  ;; Optional display name
    total-stx-given: uint,                       ;; Total STX tips given (micro-STX)
    total-cheer-given: uint,                     ;; Total CHEER tokens cheered
    creators-supported: uint,                    ;; Number of unique creators supported
    first-tip-at: uint                           ;; Block height of first tip/cheer
  }
)

;; STX tip history map: {tipper, creator} -> total amount
;; Tracks total STX tipped from each tipper to each creator
;; Uses composite key for relational data (many-to-many relationship)
(define-map tip-history
  {tipper: principal, creator: principal}
  uint  ;; Total micro-STX tipped (cumulative)
)

;; CHEER cheer history map: {tipper, creator} -> total amount
;; Tracks total CHEER tokens cheered from each tipper to each creator
;; Uses composite key for relational data (many-to-many relationship)
(define-map cheer-history
  {tipper: principal, creator: principal}
  uint  ;; Total CHEER tokens cheered (cumulative)
)


;; ============================================
;; Private Functions
;; ============================================
;; (Private helper functions will be defined here)


;; ============================================
;; Public Functions - Creator Management
;; ============================================
;; (Creator registration and management functions will be implemented here)


;; ============================================
;; Public Functions - Tipping with STX
;; ============================================
;; (STX tipping functions will be implemented here)


;; ============================================
;; Public Functions - Cheering with CHEER
;; ============================================
;; (CHEER token cheering functions will be implemented here)


;; ============================================
;; Public Functions - Leaderboard Management
;; ============================================
;; (Leaderboard functions will be implemented here)


;; ============================================
;; Read-Only Functions - Creator Data
;; ============================================
;; (Read-only functions for creator data will be implemented here)


;; ============================================
;; Read-Only Functions - Tipper Data
;; ============================================
;; (Read-only functions for tipper data will be implemented here)


;; ============================================
;; Read-Only Functions - Leaderboards
;; ============================================
;; (Read-only functions for leaderboards will be implemented here)
