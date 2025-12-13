;; ============================================
;; Traits
;; ============================================
;; Reference to cheer-token contract for CHEER operations
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)


;; ============================================
;; Constants
;; ============================================
(define-constant CONTRACT_OWNER tx-sender)

(define-constant MIN_TIP_AMOUNT u1000000)

(define-constant PLATFORM_FEE_PERCENTAGE u0)

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
;; Total number of registered creators
(define-data-var total-creators uint u0)

(define-data-var total-tippers uint u0)

(define-data-var total-stx-tipped uint u0)

(define-data-var total-cheer-tipped uint u0)


;; ============================================
;; Data Maps
;; ============================================
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

(define-map tip-history
  {tipper: principal, creator: principal}
  uint  ;; Total micro-STX tipped (cumulative)
)

(define-map cheer-history
  {tipper: principal, creator: principal}
  uint  ;; Total CHEER tokens cheered (cumulative)
)


;; ============================================
;; Private Functions
;; ============================================
(define-private (is-valid-name (name (string-ascii 50)))
  (let ((name-length (len name)))
    (and (>= name-length MIN_NAME_LENGTH)
         (<= name-length MAX_NAME_LENGTH))))

;; Ensures URI is not empty
(define-private (is-valid-uri (uri (string-ascii 256)))
  (> (len uri) u0))

(define-private (update-or-create-tipper (tipper principal) (stx-amount uint) (cheer-amount uint) (is-new-creator bool))
  (let
    (
      (existing-tipper (map-get? tippers tipper))
      (current-block stacks-block-height)
    )
    (match existing-tipper
      tipper-data
      ;; Update existing tipper
      (map-set tippers tipper {
        display-name: (get display-name tipper-data),
        total-stx-given: (+ (get total-stx-given tipper-data) stx-amount),
        total-cheer-given: (+ (get total-cheer-given tipper-data) cheer-amount),
        creators-supported: (if is-new-creator 
                              (+ (get creators-supported tipper-data) u1)
                              (get creators-supported tipper-data)),
        first-tip-at: (get first-tip-at tipper-data)
      })
      ;; Create new tipper
      (begin
        (map-set tippers tipper {
          display-name: none,
          total-stx-given: stx-amount,
          total-cheer-given: cheer-amount,
          creators-supported: u1,
          first-tip-at: current-block
        })
        (var-set total-tippers (+ (var-get total-tippers) u1))
        true
      )
    )
  )
)

(define-private (is-new-supporter (tipper principal) (creator principal))
  (let
    (
      (stx-history (default-to u0 (map-get? tip-history {tipper: tipper, creator: creator})))
      (cheer-history-val (default-to u0 (map-get? cheer-history {tipper: tipper, creator: creator})))
    )
    (and (is-eq stx-history u0) (is-eq cheer-history-val u0))
  )
)


;; ============================================
;; Public Functions - Creator Management
;; ============================================
(define-public (register-creator (name (string-ascii 50)) (metadata-uri (string-ascii 256)))
  (let
    (
      (caller tx-sender)
      (current-block stacks-block-height)
    )
    (asserts! (is-valid-name name) ERR-INVALID-NAME)
    
    ;; Validate metadata URI is not empty
    (asserts! (is-valid-uri metadata-uri) ERR-INVALID-URI)
    
    (asserts! (is-none (map-get? creators caller)) ERR-CREATOR-EXISTS)
    
    (map-set creators caller {
      name: name,
      metadata-uri: metadata-uri,
      total-stx-received: u0,
      total-cheer-received: u0,
      supporters-count: u0,
      created-at: current-block
    })
    
    (var-set total-creators (+ (var-get total-creators) u1))
    
    (print {
      event: "creator-registered",
      creator: caller,
      name: name,
      metadata-uri: metadata-uri,
      block-height: current-block
    })
    
    (ok true)
  )
)

(define-public (update-creator-metadata (new-metadata-uri (string-ascii 256)))
  (let
    (
      (caller tx-sender)
      (current-block stacks-block-height)
      (creator-data (unwrap! (map-get? creators caller) ERR-CREATOR-NOT-FOUND))
    )
    (asserts! (is-valid-uri new-metadata-uri) ERR-INVALID-URI)
    
    (map-set creators caller (merge creator-data {
      metadata-uri: new-metadata-uri
    }))
    
    (print {
      event: "creator-updated",
      creator: caller,
      new-metadata-uri: new-metadata-uri,
      block-height: current-block
    })
    
    (ok true)
  )
)


;; ============================================
;; Public Functions - Tipping with STX
;; ============================================
(define-public (tip-with-stx (creator principal) (amount uint))
  (let
    (
      (tipper tx-sender)
      (current-block stacks-block-height)
      (creator-data (unwrap! (map-get? creators creator) ERR-CREATOR-NOT-FOUND))
      (new-supporter (is-new-supporter tipper creator))
      (current-tip-history (default-to u0 (map-get? tip-history {tipper: tipper, creator: creator})))
    )
    (asserts! (>= amount MIN_TIP_AMOUNT) ERR-INVALID-AMOUNT)
    
    ;; Prevent self-tipping
    (asserts! (not (is-eq tipper creator)) ERR-SELF-TIP)
    
    ;; Transfer STX from tipper to creator
    (try! (stx-transfer? amount tipper creator))
    
    ;; Update creator stats
    (map-set creators creator (merge creator-data {
      total-stx-received: (+ (get total-stx-received creator-data) amount),
      supporters-count: (if new-supporter
                          (+ (get supporters-count creator-data) u1)
                          (get supporters-count creator-data))
    }))
    
    ;; Update or create tipper record
    (update-or-create-tipper tipper amount u0 new-supporter)
    
    (map-set tip-history {tipper: tipper, creator: creator} (+ current-tip-history amount))
    
    ;; Increment platform total STX tipped
    (var-set total-stx-tipped (+ (var-get total-stx-tipped) amount))
    
    (print {
      event: "tip-sent",
      tipper: tipper,
      creator: creator,
      amount: amount,
      type: "STX",
      block-height: current-block
    })
    
    (ok true)
  )
)


;; ============================================
;; Public Functions - Cheering with CHEER
;; ============================================
(define-public (cheer-with-token (creator principal) (amount uint))
  (let
    (
      (tipper tx-sender)
      (current-block stacks-block-height)
      (creator-data (unwrap! (map-get? creators creator) ERR-CREATOR-NOT-FOUND))
      (new-supporter (is-new-supporter tipper creator))
      (current-cheer-history (default-to u0 (map-get? cheer-history {tipper: tipper, creator: creator})))
    )
    ;; Validate amount is greater than zero
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Prevent self-cheering
    (asserts! (not (is-eq tipper creator)) ERR-SELF-TIP)
    
    (try! (contract-call? .cheer-token transfer amount tipper creator none))
    
    ;; Update creator stats
    (map-set creators creator (merge creator-data {
      total-cheer-received: (+ (get total-cheer-received creator-data) amount),
      supporters-count: (if new-supporter
                          (+ (get supporters-count creator-data) u1)
                          (get supporters-count creator-data))
    }))
    
    ;; Update or create tipper record
    (update-or-create-tipper tipper u0 amount new-supporter)
    
    (map-set cheer-history {tipper: tipper, creator: creator} (+ current-cheer-history amount))
    
    (var-set total-cheer-tipped (+ (var-get total-cheer-tipped) amount))
    
    (print {
      event: "cheer-sent",
      tipper: tipper,
      creator: creator,
      amount: amount,
      type: "CHEER",
      block-height: current-block
    })
    
    (ok true)
  )
)


;; ============================================
;; Public Functions - Leaderboard Management
;; ============================================

;; ============================================
;; Read-Only Functions - Creator Data
;; ============================================
(define-read-only (get-creator-info (creator principal))
  (map-get? creators creator)
)

(define-read-only (is-creator (user principal))
  (is-some (map-get? creators user))
)

;; Used for landing page statistics
(define-read-only (get-creator-count)
  (ok (var-get total-creators))
)


;; ============================================
;; Read-Only Functions - Tipper Data
;; ============================================
;; Returns u0 if no tips have been made
(define-read-only (get-tip-amount (tipper principal) (creator principal))
  (default-to u0 (map-get? tip-history {tipper: tipper, creator: creator}))
)

(define-read-only (get-cheer-amount (tipper principal) (creator principal))
  (default-to u0 (map-get? cheer-history {tipper: tipper, creator: creator}))
)

(define-read-only (get-tipper-stats (tipper principal))
  (map-get? tippers tipper)
)


;; ============================================
;; Read-Only Functions - Leaderboards
;; ============================================
;; Returns u0 if creator not found
(define-read-only (calculate-creator-score (creator principal))
  (match (map-get? creators creator)
    creator-data
    (+ (get total-stx-received creator-data) (get total-cheer-received creator-data))
    u0
  )
)

;; Returns u0 if tipper not found
(define-read-only (calculate-tipper-score (tipper principal))
  (match (map-get? tippers tipper)
    tipper-data
    (+ (get total-stx-given tipper-data) (get total-cheer-given tipper-data))
    u0
  )
)

(define-read-only (get-creator-rank (creator principal))
  (match (map-get? creators creator)
    creator-data
    (ok (+ (get total-stx-received creator-data) (get total-cheer-received creator-data)))
    ERR-CREATOR-NOT-FOUND
  )
)

(define-read-only (get-tipper-rank (tipper principal))
  (ok (match (map-get? tippers tipper)
    tipper-data
    (+ (get total-stx-given tipper-data) (get total-cheer-given tipper-data))
    u0
  ))
)

(define-read-only (get-platform-stats)
  (ok {
    total-creators: (var-get total-creators),
    total-tippers: (var-get total-tippers),
    total-stx-tipped: (var-get total-stx-tipped),
    total-cheer-tipped: (var-get total-cheer-tipped)
  })
)

;; Returns u0 if creator not found
(define-read-only (get-creator-supporters-count (creator principal))
  (match (map-get? creators creator)
    creator-data
    (ok (get supporters-count creator-data))
    ERR-CREATOR-NOT-FOUND
  )
)

(define-read-only (get-creators-supported (tipper principal))
  (ok (match (map-get? tippers tipper)
    tipper-data
    (get creators-supported tipper-data)
    u0
  ))
)
