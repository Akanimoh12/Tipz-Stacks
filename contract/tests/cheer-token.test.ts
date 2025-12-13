import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

/*
 * ============================================
 * CHEER Token Contract - Comprehensive Test Suite
 * ============================================
 * Clarity 4 | Clarinet SDK 3.8.1 | Vitest
 * 
 * Test Coverage:
 * 1. SIP-010 standard compliance
 * 2. Daily claim mechanism with block-height timing
 * 3. Token transfers and balance tracking
 * 4. Cooldown enforcement (144 blocks ≈ 24 hours)
 * 5. Edge cases and security scenarios
 * 6. Multi-user interactions
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("CHEER Token Contract - Clarity 4", () => {
  
  // ============================================
  // SIP-010 Compliance Tests
  // ============================================
  describe("SIP-010 Token Metadata", () => {
    it("should return correct token name 'Cheer Token'", () => {
      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-name",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.stringAscii("Cheer Token"));
    });

    it("should return correct token symbol 'CHEER'", () => {
      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-symbol",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.stringAscii("CHEER"));
    });

    it("should return decimals as 0 (whole tokens only)", () => {
      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-decimals",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should return correct token URI", () => {
      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-token-uri",
        [],
        deployer
      );
      expect(result).toBeOk(
        Cl.some(Cl.stringUtf8("https://tipz-stacks.com/cheer-token-metadata.json"))
      );
    });

    it("should return initial total supply of 0", () => {
      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  // ============================================
  // Balance Query Tests
  // ============================================
  describe("Balance Queries", () => {
    it("should return 0 balance for address that hasn't claimed", () => {
      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should return 100 balance after first claim", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(100));
    });
  });

  // ============================================
  // Daily Claim Mechanism Tests
  // ============================================
  describe("Daily Claim Mechanism", () => {
    it("should allow first-time claim of 100 CHEER", () => {
      const { result } = simnet.callPublicFn(
        "cheer-token",
        "claim-daily-tokens",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(100));
    });

    it("should update total supply after single claim", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(100));
    });

    it("should update total supply after multiple users claim", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet2);
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet3);

      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(300));
    });

    it("should record last claim block height", () => {
      const claimBlock = simnet.blockHeight;
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-last-claim-block",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(claimBlock);
    });

    it("should track total claimed by user", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-claimed-by-user",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(100);
    });

    it("should return 0 for last-claim-block of user who never claimed", () => {
      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-last-claim-block",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(0);
    });
  });

  // ============================================
  // Claim Cooldown Tests (144 blocks = 24 hours)
  // ============================================
  describe("Claim Cooldown Enforcement", () => {
    it("should reject immediate second claim (cooldown active)", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "claim-daily-tokens",
        [],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(300)); // ERR-CLAIM-COOLDOWN-ACTIVE
    });

    it("should calculate correct blocks until next claim (144)", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-blocks-until-claim",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(144);
    });

    it("should return 0 blocks-until-claim for unclaimed user", () => {
      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-blocks-until-claim",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(0);
    });

    it("should return false for can-claim-now during cooldown", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "can-claim-now",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeBool(false);
    });

    it("should return true for can-claim-now before first claim", () => {
      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "can-claim-now",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeBool(true);
    });

    it("should allow claim after exactly 144 blocks", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(144);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "claim-daily-tokens",
        [],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(100));
    });

    it("should return true for can-claim-now after cooldown expires", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(144);

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "can-claim-now",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeBool(true);
    });

    it("should reject claim at 143 blocks but allow at 144", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(143);

      // Should still be in cooldown
      let result = simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      expect(result.result).toBeErr(Cl.uint(300));

      // Mine one more block (total 144)
      simnet.mineEmptyBlock();

      // Should now succeed
      result = simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      expect(result.result).toBeOk(Cl.uint(100));
    });

    it("should accumulate total claimed across multiple claims", () => {
      // First claim
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(144);

      // Second claim
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-claimed-by-user",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(200);
    });

    it("should handle claim streak over 5 days", () => {
      // Day 1
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(144);

      // Day 2
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(144);

      // Day 3
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(144);

      // Day 4
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.mineEmptyBlocks(144);

      // Day 5
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-claimed-by-user",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(500);
    });
  });

  // ============================================
  // Token Transfer Tests
  // ============================================
  describe("Token Transfers (SIP-010)", () => {
    it("should transfer tokens between users", () => {
      // Give wallet1 some tokens first
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(50),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should update balances correctly after transfer", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(50),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );

      const balance1 = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      const balance2 = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );

      expect(balance1.result).toBeOk(Cl.uint(50));
      expect(balance2.result).toBeOk(Cl.uint(50));
    });

    it("should reject transfer from non-sender", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(50),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet2 // wallet2 trying to transfer wallet1's tokens
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should reject transfer with insufficient balance", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(200), // wallet1 only has 100
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(200)); // ERR-INSUFFICIENT-BALANCE
    });

    it("should reject transfer of 0 amount", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(0),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(201)); // ERR-INVALID-AMOUNT
    });

    it("should reject transfer to same address", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(50),
          Cl.principal(wallet1),
          Cl.principal(wallet1), // same address
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(201)); // ERR-INVALID-AMOUNT
    });

    it("should preserve total supply after transfer", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(50),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(100)); // Should still be 100
    });

    it("should handle transfer with memo", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const memo = Cl.some(Cl.bufferFromUtf8("Tip for great content!"));
      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(25),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          memo,
        ],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should allow transfer of exact balance", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [
          Cl.uint(100), // Entire balance
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.none(),
        ],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify wallet1 balance is 0
      const balance1 = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(balance1.result).toBeOk(Cl.uint(0));
    });
  });

  // ============================================
  // Complex Scenarios & Edge Cases
  // ============================================
  describe("Complex Multi-User Scenarios", () => {
    it("should handle multiple users claiming independently", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet2);
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet3);

      const balance1 = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet1)],
        deployer
      );
      const balance2 = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet2)],
        deployer
      );
      const balance3 = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(wallet3)],
        deployer
      );

      expect(balance1.result).toBeOk(Cl.uint(100));
      expect(balance2.result).toBeOk(Cl.uint(100));
      expect(balance3.result).toBeOk(Cl.uint(100));
    });

    it("should handle complex transfer chain", () => {
      // wallet1 claims 100
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      // wallet1 sends 40 to wallet2
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(40), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );

      // wallet2 sends 20 to wallet3
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(20), Cl.principal(wallet2), Cl.principal(wallet3), Cl.none()],
        wallet2
      );

      // wallet3 sends 10 back to wallet1
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(10), Cl.principal(wallet3), Cl.principal(wallet1), Cl.none()],
        wallet3
      );

      const balance1 = simnet.callReadOnlyFn("cheer-token", "get-balance", [Cl.principal(wallet1)], deployer);
      const balance2 = simnet.callReadOnlyFn("cheer-token", "get-balance", [Cl.principal(wallet2)], deployer);
      const balance3 = simnet.callReadOnlyFn("cheer-token", "get-balance", [Cl.principal(wallet3)], deployer);

      expect(balance1.result).toBeOk(Cl.uint(70)); // 60 + 10
      expect(balance2.result).toBeOk(Cl.uint(20)); // 40 - 20
      expect(balance3.result).toBeOk(Cl.uint(10)); // 20 - 10
    });

    it("should maintain correct total supply with multiple operations", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet2);
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(50), Cl.principal(wallet1), Cl.principal(wallet3), Cl.none()],
        wallet1
      );
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(25), Cl.principal(wallet2), Cl.principal(wallet3), Cl.none()],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-supply",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(200)); // Should still be 200 after transfers
    });

    it("should handle user claiming, transferring, then claiming again", () => {
      // Day 1: Claim and transfer
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(100), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );

      // Verify wallet1 has 0
      let balance = simnet.callReadOnlyFn("cheer-token", "get-balance", [Cl.principal(wallet1)], deployer);
      expect(balance.result).toBeOk(Cl.uint(0));

      // Day 2: Claim again
      simnet.mineEmptyBlocks(144);
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      // Verify wallet1 has 100 again
      balance = simnet.callReadOnlyFn("cheer-token", "get-balance", [Cl.principal(wallet1)], deployer);
      expect(balance.result).toBeOk(Cl.uint(100));
    });

    it("should handle interleaved claims and transfers", () => {
      // wallet1 claims
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      // wallet2 claims
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet2);

      // wallet1 transfers to wallet3
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(30), Cl.principal(wallet1), Cl.principal(wallet3), Cl.none()],
        wallet1
      );

      // wallet2 transfers to wallet3
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(40), Cl.principal(wallet2), Cl.principal(wallet3), Cl.none()],
        wallet2
      );

      // Check wallet3 received both
      const balance3 = simnet.callReadOnlyFn("cheer-token", "get-balance", [Cl.principal(wallet3)], deployer);
      expect(balance3.result).toBeOk(Cl.uint(70)); // 30 + 40
    });
  });

  // ============================================
  // Security & Edge Cases
  // ============================================
  describe("Security & Edge Cases", () => {
    it("should not allow transfer after balance is depleted", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      // Transfer all tokens
      simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(100), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );

      // Try to transfer again (should fail)
      const { result } = simnet.callPublicFn(
        "cheer-token",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2), Cl.none()],
        wallet1
      );
      expect(result).toBeErr(Cl.uint(200)); // ERR-INSUFFICIENT-BALANCE
    });

    it("should maintain independent cooldowns for different users", () => {
      // wallet1 claims
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);

      // Mine 100 blocks
      simnet.mineEmptyBlocks(100);

      // wallet2 claims (should succeed, no cooldown)
      const result2 = simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet2);
      expect(result2.result).toBeOk(Cl.uint(100));

      // wallet1 tries to claim (should fail, only 100 blocks passed)
      const result1 = simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
      expect(result1.result).toBeErr(Cl.uint(300));
    });

    it("should correctly handle large number of claims over time", () => {
      let totalClaimed = 0;

      // Claim 10 times
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], wallet1);
        totalClaimed += 100;

        if (i < 9) {
          // Don't mine blocks after last claim
          simnet.mineEmptyBlocks(144);
        }
      }

      const result = simnet.callReadOnlyFn(
        "cheer-token",
        "get-total-claimed-by-user",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result).toBeUint(1000);
    });

    it("should handle deployer claiming tokens", () => {
      const { result } = simnet.callPublicFn(
        "cheer-token",
        "claim-daily-tokens",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(100));

      const balance = simnet.callReadOnlyFn(
        "cheer-token",
        "get-balance",
        [Cl.principal(deployer)],
        deployer
      );
      expect(balance.result).toBeOk(Cl.uint(100));
    });
  });
});
