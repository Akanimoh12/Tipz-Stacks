import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

/*
 * ============================================
 * Tipz Core Contract - Comprehensive Test Suite
 * ============================================
 * Clarity 4 | Clarinet SDK 3.8.1 | Vitest
 * 
 * Test Coverage:
 * 1. Creator registration and management
 * 2. STX tipping mechanism
 * 3. CHEER token cheering integration
 * 4. Tipper tracking and statistics
 * 5. Dual leaderboard system
 * 6. Platform analytics
 * 7. Input validation and security
 * 8. Complex multi-user scenarios
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator1 = accounts.get("wallet_1")!;
const creator2 = accounts.get("wallet_2")!;
const tipper1 = accounts.get("wallet_3")!;
const tipper2 = accounts.get("wallet_4")!;
const tipper3 = accounts.get("wallet_5")!;

describe("Tipz Core Contract - Clarity 4", () => {

  // ============================================
  // Creator Registration Tests
  // ============================================
  describe("Creator Registration", () => {
    it("should allow new user to register as creator", () => {
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Alice Creator"),
          Cl.stringAscii("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"),
        ],
        creator1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject registration with name too short (< 3 chars)", () => {
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Al"), // Only 2 characters
          Cl.stringAscii("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"),
        ],
        creator1
      );
      expect(result).toBeErr(Cl.uint(107)); // ERR-INVALID-NAME
    });

    it("should reject registration with name too long (> 50 chars)", () => {
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("This is a very long name that exceeds the maximum allowed length of 50 characters"),
          Cl.stringAscii("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"),
        ],
        creator1
      );
      expect(result).toBeErr(Cl.uint(107)); // ERR-INVALID-NAME
    });

    it("should reject registration with empty metadata URI", () => {
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Valid Name"),
          Cl.stringAscii(""),
        ],
        creator1
      );
      expect(result).toBeErr(Cl.uint(108)); // ERR-INVALID-URI
    });

    it("should reject duplicate registration by same address", () => {
      // First registration
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Alice Creator"),
          Cl.stringAscii("QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"),
        ],
        creator1
      );

      // Second registration attempt
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Alice New Name"),
          Cl.stringAscii("QmNewHash"),
        ],
        creator1
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR-CREATOR-EXISTS
    });

    it("should increment total-creators counter", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Creator One"),
          Cl.stringAscii("QmHash1"),
        ],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Creator Two"),
          Cl.stringAscii("QmHash2"),
        ],
        creator2
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-count",
        [],
        deployer
      );
      expect(result).toBeUint(2);
    });

    it("should store creator info correctly", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Bob Artist"),
          Cl.stringAscii("QmBobHash"),
        ],
        creator1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-info",
        [Cl.principal(creator1)],
        deployer
      );

      expect(result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii("Bob Artist"),
          "metadata-uri": Cl.stringAscii("QmBobHash"),
          "total-stx-received": Cl.uint(0),
          "total-cheer-received": Cl.uint(0),
          "supporters-count": Cl.uint(0),
          "created-at": Cl.uint(simnet.blockHeight - 1),
        })
      );
    });

    it("should return none for non-existent creator", () => {
      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-info",
        [Cl.principal(tipper1)],
        deployer
      );
      expect(result).toBeNone();
    });

    it("should return true for is-creator check", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Charlie"),
          Cl.stringAscii("QmCharlie"),
        ],
        creator1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "is-creator",
        [Cl.principal(creator1)],
        deployer
      );
      expect(result).toBeBool(true);
    });

    it("should return false for is-creator check on non-creator", () => {
      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "is-creator",
        [Cl.principal(tipper1)],
        deployer
      );
      expect(result).toBeBool(false);
    });
  });

  // ============================================
  // Creator Metadata Update Tests
  // ============================================
  describe("Creator Metadata Updates", () => {
    it("should allow creator to update metadata URI", () => {
      // Register first
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Alice"),
          Cl.stringAscii("QmOldHash"),
        ],
        creator1
      );

      // Update metadata
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "update-creator-metadata",
        [Cl.stringAscii("QmNewHash")],
        creator1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify update
      const info = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-info",
        [Cl.principal(creator1)],
        deployer
      );
      expect(info.result).toBeSome(
        Cl.tuple({
          name: Cl.stringAscii("Alice"),
          "metadata-uri": Cl.stringAscii("QmNewHash"),
          "total-stx-received": Cl.uint(0),
          "total-cheer-received": Cl.uint(0),
          "supporters-count": Cl.uint(0),
          "created-at": Cl.uint(simnet.blockHeight - 2),
        })
      );
    });

    it("should reject metadata update from non-creator", () => {
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "update-creator-metadata",
        [Cl.stringAscii("QmSomeHash")],
        tipper1 // Not a creator
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-CREATOR-NOT-FOUND
    });

    it("should reject metadata update with empty URI", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Bob"),
          Cl.stringAscii("QmBob"),
        ],
        creator1
      );

      const { result } = simnet.callPublicFn(
        "tipz-core",
        "update-creator-metadata",
        [Cl.stringAscii("")],
        creator1
      );
      expect(result).toBeErr(Cl.uint(108)); // ERR-INVALID-URI
    });
  });

  // ============================================
  // STX Tipping Tests
  // ============================================
  describe("STX Tipping", () => {
    it("should allow tipping with STX (minimum 1 STX)", () => {
      // Register creator
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Creator Alice"),
          Cl.stringAscii("QmAlice"),
        ],
        creator1
      );

      // Tip 1 STX (1000000 micro-STX)
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject tip below minimum (< 1 STX)", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Creator Alice"),
          Cl.stringAscii("QmAlice"),
        ],
        creator1
      );

      const { result } = simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(999999)], // Less than 1 STX
        tipper1
      );
      expect(result).toBeErr(Cl.uint(103)); // ERR-INVALID-AMOUNT
    });

    it("should reject tip to non-existent creator", () => {
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-CREATOR-NOT-FOUND
    });

    it("should reject self-tipping", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [
          Cl.stringAscii("Alice"),
          Cl.stringAscii("QmAlice"),
        ],
        creator1
      );

      const { result } = simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        creator1 // Trying to tip themselves
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR-SELF-TIP
    });

    it("should update creator's total-stx-received", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Bob"), Cl.stringAscii("QmBob")],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(2000000)], // 2 STX
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-info",
        [Cl.principal(creator1)],
        deployer
      );

      const creatorInfo = result as any;
      expect(creatorInfo.value.data["total-stx-received"]).toBeUint(2000000);
    });

    it("should increment supporters-count for new supporter", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Charlie"), Cl.stringAscii("QmCharlie")],
        creator1
      );

      // First supporter
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );

      // Second supporter
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper2
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-supporters-count",
        [Cl.principal(creator1)],
        deployer
      );
      expect(result).toBeUint(2);
    });

    it("should not increment supporters-count for repeat supporter", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Dave"), Cl.stringAscii("QmDave")],
        creator1
      );

      // First tip
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );

      // Second tip from same tipper
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-supporters-count",
        [Cl.principal(creator1)],
        deployer
      );
      expect(result).toBeUint(1); // Still 1 unique supporter
    });

    it("should track tip history per tipper-creator pair", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Eve"), Cl.stringAscii("QmEve")],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(3000000)], // 3 STX
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tip-amount",
        [Cl.principal(tipper1), Cl.principal(creator1)],
        deployer
      );
      expect(result).toBeUint(3000000);
    });

    it("should accumulate tips from same tipper to same creator", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Frank"), Cl.stringAscii("QmFrank")],
        creator1
      );

      // First tip: 1 STX
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );

      // Second tip: 2 STX
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(2000000)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tip-amount",
        [Cl.principal(tipper1), Cl.principal(creator1)],
        deployer
      );
      expect(result).toBeUint(3000000); // Total: 3 STX
    });

    it("should update platform total-stx-tipped", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Grace"), Cl.stringAscii("QmGrace")],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Henry"), Cl.stringAscii("QmHenry")],
        creator2
      );

      // Tip creator1
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(2000000)],
        tipper1
      );

      // Tip creator2
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator2), Cl.uint(3000000)],
        tipper2
      );

      const stats = simnet.callReadOnlyFn(
        "tipz-core",
        "get-platform-stats",
        [],
        deployer
      );

      const statsValue = stats.result as any;
      expect(statsValue.value.data["total-stx-tipped"]).toBeUint(5000000);
    });
  });

  // ============================================
  // CHEER Token Cheering Tests
  // ============================================
  describe("CHEER Token Cheering", () => {
    it("should allow cheering with CHEER tokens", () => {
      // Register creator
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Iris"), Cl.stringAscii("QmIris")],
        creator1
      );

      // Tipper claims CHEER tokens
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      // Cheer with 50 CHEER
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(50)],
        tipper1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject cheer to non-existent creator", () => {
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      const { result } = simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(50)],
        tipper1
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-CREATOR-NOT-FOUND
    });

    it("should reject cheer with 0 amount", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Jack"), Cl.stringAscii("QmJack")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      const { result } = simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(0)],
        tipper1
      );
      expect(result).toBeErr(Cl.uint(103)); // ERR-INVALID-AMOUNT
    });

    it("should reject self-cheering", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Kate"), Cl.stringAscii("QmKate")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], creator1);

      const { result } = simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(50)],
        creator1 // Trying to cheer themselves
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR-SELF-TIP
    });

    it("should update creator's total-cheer-received", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Leo"), Cl.stringAscii("QmLeo")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(75)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-info",
        [Cl.principal(creator1)],
        deployer
      );

      const creatorInfo = result as any;
      expect(creatorInfo.value.data["total-cheer-received"]).toBeUint(75);
    });

    it("should track cheer history per tipper-creator pair", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Mia"), Cl.stringAscii("QmMia")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(30)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-cheer-amount",
        [Cl.principal(tipper1), Cl.principal(creator1)],
        deployer
      );
      expect(result).toBeUint(30);
    });

    it("should accumulate cheers from same tipper to same creator", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Nina"), Cl.stringAscii("QmNina")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      // First cheer: 20 CHEER
      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(20)],
        tipper1
      );

      // Second cheer: 30 CHEER
      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(30)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-cheer-amount",
        [Cl.principal(tipper1), Cl.principal(creator1)],
        deployer
      );
      expect(result).toBeUint(50); // Total: 50 CHEER
    });

    it("should reject cheer with insufficient CHEER balance", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Oscar"), Cl.stringAscii("QmOscar")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1); // Has 100 CHEER

      // Try to cheer 150 CHEER (more than balance)
      const { result } = simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(150)],
        tipper1
      );
      expect(result).toBeErr(Cl.uint(200)); // ERR-INSUFFICIENT-BALANCE from cheer-token
    });

    it("should update platform total-cheer-tipped", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Paul"), Cl.stringAscii("QmPaul")],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Quinn"), Cl.stringAscii("QmQuinn")],
        creator2
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);
      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper2);

      // Cheer creator1
      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(40)],
        tipper1
      );

      // Cheer creator2
      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator2), Cl.uint(60)],
        tipper2
      );

      const stats = simnet.callReadOnlyFn(
        "tipz-core",
        "get-platform-stats",
        [],
        deployer
      );

      const statsValue = stats.result as any;
      expect(statsValue.value.data["total-cheer-tipped"]).toBeUint(100);
    });
  });

  // ============================================
  // Tipper Statistics Tests
  // ============================================
  describe("Tipper Statistics", () => {
    it("should track tipper's total-stx-given", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Rachel"), Cl.stringAscii("QmRachel")],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(5000000)], // 5 STX
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tipper-stats",
        [Cl.principal(tipper1)],
        deployer
      );

      const stats = result as any;
      expect(stats.value.data["total-stx-given"]).toBeUint(5000000);
    });

    it("should track tipper's total-cheer-given", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Sam"), Cl.stringAscii("QmSam")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(80)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tipper-stats",
        [Cl.principal(tipper1)],
        deployer
      );

      const stats = result as any;
      expect(stats.value.data["total-cheer-given"]).toBeUint(80);
    });

    it("should track tipper's creators-supported count", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Tina"), Cl.stringAscii("QmTina")],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Uma"), Cl.stringAscii("QmUma")],
        creator2
      );

      // Tip both creators
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator2), Cl.uint(1000000)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creators-supported",
        [Cl.principal(tipper1)],
        deployer
      );
      expect(result).toBeUint(2);
    });

    it("should return none for non-existent tipper", () => {
      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tipper-stats",
        [Cl.principal(tipper1)],
        deployer
      );
      expect(result).toBeNone();
    });
  });

  // ============================================
  // Leaderboard & Scoring Tests
  // ============================================
  describe("Leaderboard System", () => {
    it("should calculate creator score (STX + CHEER)", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Victor"), Cl.stringAscii("QmVictor")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      // Tip 2 STX
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(2000000)],
        tipper1
      );

      // Cheer 50 CHEER
      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(50)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-rank",
        [Cl.principal(creator1)],
        deployer
      );

      const rank = result as any;
      expect(rank.value.data.score).toBeUint(2000050); // 2000000 + 50
    });

    it("should calculate tipper score (STX + CHEER given)", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Wendy"), Cl.stringAscii("QmWendy")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      // Tip 3 STX
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(3000000)],
        tipper1
      );

      // Cheer 25 CHEER
      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(25)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tipper-rank",
        [Cl.principal(tipper1)],
        deployer
      );

      const rank = result as any;
      expect(rank.value.data.score).toBeUint(3000025); // 3000000 + 25
    });

    it("should return platform stats correctly", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Xander"), Cl.stringAscii("QmXander")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );

      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(10)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-platform-stats",
        [],
        deployer
      );

      const stats = result as any;
      expect(stats.value.data["total-creators"]).toBeUint(1);
      expect(stats.value.data["total-tippers"]).toBeUint(1);
      expect(stats.value.data["total-stx-tipped"]).toBeUint(1000000);
      expect(stats.value.data["total-cheer-tipped"]).toBeUint(10);
    });
  });

  // ============================================
  // Complex Multi-User Scenarios
  // ============================================
  describe("Complex Scenarios", () => {
    it("should handle multiple tippers supporting one creator", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Yara"), Cl.stringAscii("QmYara")],
        creator1
      );

      // Three tippers tip the same creator
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(1000000)],
        tipper1
      );

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(2000000)],
        tipper2
      );

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(3000000)],
        tipper3
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-info",
        [Cl.principal(creator1)],
        deployer
      );

      const info = result as any;
      expect(info.value.data["total-stx-received"]).toBeUint(6000000); // 6 STX total
      expect(info.value.data["supporters-count"]).toBeUint(3);
    });

    it("should handle one tipper supporting multiple creators", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Zane"), Cl.stringAscii("QmZane")],
        creator1
      );

      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Amy"), Cl.stringAscii("QmAmy")],
        creator2
      );

      // One tipper tips both creators
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(2000000)],
        tipper1
      );

      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator2), Cl.uint(3000000)],
        tipper1
      );

      const { result } = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tipper-stats",
        [Cl.principal(tipper1)],
        deployer
      );

      const stats = result as any;
      expect(stats.value.data["total-stx-given"]).toBeUint(5000000); // 5 STX total
      expect(stats.value.data["creators-supported"]).toBeUint(2);
    });

    it("should handle mixed STX and CHEER tips to same creator", () => {
      simnet.callPublicFn(
        "tipz-core",
        "register-creator",
        [Cl.stringAscii("Betty"), Cl.stringAscii("QmBetty")],
        creator1
      );

      simnet.callPublicFn("cheer-token", "claim-daily-tokens", [], tipper1);

      // Tip with STX
      simnet.callPublicFn(
        "tipz-core",
        "tip-with-stx",
        [Cl.principal(creator1), Cl.uint(2000000)],
        tipper1
      );

      // Cheer with CHEER
      simnet.callPublicFn(
        "tipz-core",
        "cheer-with-token",
        [Cl.principal(creator1), Cl.uint(40)],
        tipper1
      );

      const creatorInfo = simnet.callReadOnlyFn(
        "tipz-core",
        "get-creator-info",
        [Cl.principal(creator1)],
        deployer
      );

      const tipperStats = simnet.callReadOnlyFn(
        "tipz-core",
        "get-tipper-stats",
        [Cl.principal(tipper1)],
        deployer
      );

      const creator = creatorInfo.result as any;
      const tipper = tipperStats.result as any;

      expect(creator.value.data["total-stx-received"]).toBeUint(2000000);
      expect(creator.value.data["total-cheer-received"]).toBeUint(40);
      expect(creator.value.data["supporters-count"]).toBeUint(1); // Same tipper

      expect(tipper.value.data["total-stx-given"]).toBeUint(2000000);
      expect(tipper.value.data["total-cheer-given"]).toBeUint(40);
      expect(tipper.value.data["creators-supported"]).toBeUint(1);
    });
  });
});
