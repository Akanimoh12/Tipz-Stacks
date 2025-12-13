;; ============================================
;; Traits
;; ============================================
;; Import the SIP-010 fungible token trait
(use-trait sip-010-trait .sip-010-trait.sip-010-trait)

;; ============================================
;; Constants
;; ============================================
(define-constant TOKEN_NAME "Cheer Token")

;; Token symbol (ticker) for the token
(define-constant TOKEN_SYMBOL "CHEER")

(define-constant TOKEN_DECIMALS u0)

(define-constant TOKEN_URI u"https://tipz-stacks.com/cheer-token-metadata.json")

(define-constant DAILY_CLAIM_AMOUNT u100)

(define-constant CLAIM_COOLDOWN_BLOCKS u144)

(define-constant CONTRACT_OWNER tx-sender)


;; ============================================
;; Data Variables
;; ============================================
(define-data-var total-supply uint u0)

(define-data-var token-uri (optional (string-utf8 256)) (some TOKEN_URI))


;; ============================================
;; Data Maps
;; ============================================
(define-map token-balances principal uint)

(define-map last-claim-block-heights principal uint)

(define-map total-claimed-by-user principal uint)


;; ============================================
;; Error Codes
;; ============================================
(define-constant ERR-NOT-AUTHORIZED (err u100))

(define-constant ERR-OWNER-ONLY (err u101))

(define-constant ERR-INSUFFICIENT-BALANCE (err u200))

(define-constant ERR-INVALID-AMOUNT (err u201))

(define-constant ERR-CLAIM-COOLDOWN-ACTIVE (err u300))

(define-constant ERR-ALREADY-CLAIMED (err u301))

(define-constant ERR-CLAIM-OVERFLOW (err u302))

(define-constant ERR-OVERFLOW (err u400))

(define-constant ERR-UNDERFLOW (err u401))


;; ============================================
;; Private Functions
;; ============================================
(define-private (mint-tokens (recipient principal) (amount uint))
  (let
    (
      (current-balance (default-to u0 (map-get? token-balances recipient)))
      ;; Get current total supply
      (current-supply (var-get total-supply))
      ;; Calculate new balance after minting
      (new-balance (+ current-balance amount))
      (new-supply (+ current-supply amount))
    )
    ;; Validate amount is greater than zero
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    (map-set token-balances recipient new-balance)
    
    ;; Update total supply variable
    (var-set total-supply new-supply)
    
    ;; Return success
    (ok true)
  )
)

(define-private (burn-tokens (sender principal) (amount uint))
  (let
    (
      (current-balance (default-to u0 (map-get? token-balances sender)))
      ;; Get current total supply
      (current-supply (var-get total-supply))
      ;; Calculate new balance after burning
      (new-balance (- current-balance amount))
      (new-supply (- current-supply amount))
    )
    ;; Validate amount is greater than zero
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)
    
    ;; Update sender's balance in the map
    (map-set token-balances sender new-balance)
    
    ;; Update total supply variable
    (var-set total-supply new-supply)
    
    ;; Return success
    (ok true)
  )
)

(define-private (can-claim-tokens (user principal))
  (let
    (
      (last-claim (default-to u0 (map-get? last-claim-block-heights user)))
      (current-block stacks-block-height)
      (blocks-passed (- current-block last-claim))
    )
    (if (or (is-eq last-claim u0) (>= blocks-passed CLAIM_COOLDOWN_BLOCKS))
      ;; User is eligible to claim
      (ok true)
      ERR-CLAIM-COOLDOWN-ACTIVE
    )
  )
)

(define-private (blocks-until-next-claim (user principal))
  (let
    (
      (last-claim (default-to u0 (map-get? last-claim-block-heights user)))
      ;; Get current block height
      (current-block stacks-block-height)
      (blocks-passed (- current-block last-claim))
    )
    (if (or (is-eq last-claim u0) (>= blocks-passed CLAIM_COOLDOWN_BLOCKS))
      u0
      (- CLAIM_COOLDOWN_BLOCKS blocks-passed)
    )
  )
)


;; ============================================
;; Public Functions - SIP-010 Implementation
;; ============================================
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq sender tx-sender) ERR-NOT-AUTHORIZED)
    
    ;; Validate amount is greater than zero
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    (asserts! (not (is-eq sender recipient)) ERR-INVALID-AMOUNT)
    
    (let
      (
        ;; Get sender's current balance
        (sender-balance (default-to u0 (map-get? token-balances sender)))
        ;; Get recipient's current balance
        (recipient-balance (default-to u0 (map-get? token-balances recipient)))
      )
      (asserts! (>= sender-balance amount) ERR-INSUFFICIENT-BALANCE)
      
      (map-set token-balances sender (- sender-balance amount))
      
      (map-set token-balances recipient (+ recipient-balance amount))
      
      (print {
        event: "transfer",
        sender: sender,
        recipient: recipient,
        amount: amount,
        memo: memo
      })
      
      ;; Return success
      (ok true)
    )
  )
)

(define-public (get-name)
  (ok TOKEN_NAME)
)

(define-public (get-symbol)
  (ok TOKEN_SYMBOL)
)

(define-public (get-decimals)
  (ok TOKEN_DECIMALS)
)

(define-public (get-balance (account principal))
  (ok (default-to u0 (map-get? token-balances account)))
)

(define-public (get-total-supply)
  (ok (var-get total-supply))
)

(define-public (get-token-uri)
  (ok (var-get token-uri))
)


;; ============================================
;; Public Functions - Daily Claim Mechanism
;; ============================================
(define-public (claim-daily-tokens)
  (let
    (
      ;; Get the caller's address
      (claimer tx-sender)
      ;; Get current block height
      (current-block stacks-block-height)
      (current-total-claimed (default-to u0 (map-get? total-claimed-by-user claimer)))
      ;; Calculate new total after this claim
      (new-total-claimed (+ current-total-claimed DAILY_CLAIM_AMOUNT))
    )
    (try! (can-claim-tokens claimer))
    
    (try! (mint-tokens claimer DAILY_CLAIM_AMOUNT))
    
    (map-set last-claim-block-heights claimer current-block)
    
    (map-set total-claimed-by-user claimer new-total-claimed)
    
    (print {
      event: "tokens-claimed",
      user: claimer,
      amount: DAILY_CLAIM_AMOUNT,
      block-height: current-block,
      total-claimed: new-total-claimed
    })
    
    ;; Return success with amount claimed
    (ok DAILY_CLAIM_AMOUNT)
  )
)


;; ============================================
;; Read-Only Functions
;; ============================================
(define-read-only (get-last-claim-block (user principal))
  (default-to u0 (map-get? last-claim-block-heights user))
)

(define-read-only (get-blocks-until-claim (user principal))
  (blocks-until-next-claim user)
)

(define-read-only (can-claim-now (user principal))
  (let
    (
      (last-claim (default-to u0 (map-get? last-claim-block-heights user)))
      ;; Get current block height
      (current-block stacks-block-height)
      ;; Calculate blocks elapsed
      (blocks-passed (- current-block last-claim))
    )
    (or (is-eq last-claim u0) (>= blocks-passed CLAIM_COOLDOWN_BLOCKS))
  )
)

(define-read-only (get-total-claimed-by-user (user principal))
  (default-to u0 (map-get? total-claimed-by-user user))
)
