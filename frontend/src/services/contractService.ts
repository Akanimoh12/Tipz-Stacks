import {
  fetchCallReadOnlyFunction,
  AnchorMode,
  PostConditionMode,
  cvToValue,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { getNetwork } from './stacksService';
import { DEPLOYER_ADDRESS, CHEER_TOKEN_CONTRACT, TIPZ_CORE_CONTRACT } from '@utils/constants';

// Contract identifiers
// Parse contract identifier to handle both formats:
// Format 1: "cheer-token" (just contract name) - uses DEPLOYER_ADDRESS
// Format 2: "ST1XXX.cheer-token" (full identifier) - extracts both parts
const parseContractId = (fullId: string | undefined) => {
  if (!fullId) {
    console.warn('No contract identifier provided, using defaults');
    return { address: DEPLOYER_ADDRESS || '', name: 'cheer-token' };
  }
  
  // Check if it contains a period (full identifier format)
  if (fullId.includes('.')) {
    const parts = fullId.split('.');
    return {
      address: parts[0] || DEPLOYER_ADDRESS || '',
      name: parts[1] || 'cheer-token'
    };
  }
  
  // Just contract name, use DEPLOYER_ADDRESS
  return {
    address: DEPLOYER_ADDRESS || '',
    name: fullId
  };
};

const { address: CHEER_TOKEN_ADDRESS, name: CHEER_TOKEN_NAME } = parseContractId(CHEER_TOKEN_CONTRACT);

console.log('=== Contract Service Initialized ===');
console.log('Environment Variables:', {
  DEPLOYER_ADDRESS,
  CHEER_TOKEN_CONTRACT,
  network: import.meta.env.VITE_STACKS_NETWORK
});
console.log('Parsed Contract Config:', {
  address: CHEER_TOKEN_ADDRESS,
  name: CHEER_TOKEN_NAME,
  fullId: `${CHEER_TOKEN_ADDRESS}.${CHEER_TOKEN_NAME}`
});
console.log('===================================');

export interface ClaimStatus {
  canClaim: boolean;
  lastClaimBlock: number;
  blocksUntilClaim: number;
  totalClaimed: number;
}

/**
 * Check if a user is eligible to claim tokens now
 */
export const checkClaimEligibility = async (
  userAddress: string
): Promise<boolean> => {
  try {
    const network = getNetwork();
    
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: CHEER_TOKEN_ADDRESS,
      contractName: CHEER_TOKEN_NAME,
      functionName: 'can-claim-now',
      functionArgs: [standardPrincipalCV(userAddress)],
      senderAddress: userAddress,
    });

    return cvToValue(result) as boolean;
  } catch (error) {
    console.error('Error checking claim eligibility:', error);
    return false;
  }
};

/**
 * Get the block height of the user's last claim
 */
export const getLastClaimBlock = async (
  userAddress: string
): Promise<number> => {
  try {
    const network = getNetwork();
    
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: CHEER_TOKEN_ADDRESS,
      contractName: CHEER_TOKEN_NAME,
      functionName: 'get-last-claim-block',
      functionArgs: [standardPrincipalCV(userAddress)],
      senderAddress: userAddress,
    });

    const value = cvToValue(result);
    return typeof value === 'bigint' ? Number(value) : Number(value);
  } catch (error) {
    console.error('Error getting last claim block:', error);
    return 0;
  }
};

/**
 * Get the number of blocks until the next claim is available
 */
export const getBlocksUntilClaim = async (
  userAddress: string
): Promise<number> => {
  try {
    const network = getNetwork();
    
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: CHEER_TOKEN_ADDRESS,
      contractName: CHEER_TOKEN_NAME,
      functionName: 'get-blocks-until-claim',
      functionArgs: [standardPrincipalCV(userAddress)],
      senderAddress: userAddress,
    });

    const value = cvToValue(result);
    return typeof value === 'bigint' ? Number(value) : Number(value);
  } catch (error) {
    console.error('Error getting blocks until claim:', error);
    return 0;
  }
};

/**
 * Get the total amount of tokens claimed by a user
 */
export const getTotalClaimedByUser = async (
  userAddress: string
): Promise<number> => {
  try {
    const network = getNetwork();
    
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: CHEER_TOKEN_ADDRESS,
      contractName: CHEER_TOKEN_NAME,
      functionName: 'get-total-claimed-by-user',
      functionArgs: [standardPrincipalCV(userAddress)],
      senderAddress: userAddress,
    });

    const value = cvToValue(result);
    return typeof value === 'bigint' ? Number(value) : Number(value);
  } catch (error) {
    console.error('Error getting total claimed:', error);
    return 0;
  }
};

/**
 * Get complete claim status for a user
 */
export const getClaimStatus = async (
  userAddress: string
): Promise<ClaimStatus> => {
  try {
    const [canClaim, lastClaimBlock, blocksUntilClaim, totalClaimed] = 
      await Promise.all([
        checkClaimEligibility(userAddress),
        getLastClaimBlock(userAddress),
        getBlocksUntilClaim(userAddress),
        getTotalClaimedByUser(userAddress),
      ]);

    return {
      canClaim,
      lastClaimBlock,
      blocksUntilClaim,
      totalClaimed,
    };
  } catch (error) {
    console.error('Error getting claim status:', error);
    return {
      canClaim: false,
      lastClaimBlock: 0,
      blocksUntilClaim: 144,
      totalClaimed: 0,
    };
  }
};

/**
 * Execute the daily token claim transaction
 */
export const claimDailyTokens = async (): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    try {
      const network = getNetwork();

      const txOptions = {
        network,
        contractAddress: CHEER_TOKEN_ADDRESS,
        contractName: CHEER_TOKEN_NAME,
        functionName: 'claim-daily-tokens',
        functionArgs: [],
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: (data: any) => {
          console.log('Transaction submitted:', data.txId);
          resolve(data.txId);
        },
        onCancel: () => {
          console.log('Transaction cancelled by user');
          reject(new Error('Transaction cancelled by user'));
        },
      };

      openContractCall(txOptions);
    } catch (error: any) {
      console.error('Error claiming daily tokens:', error);
      
      // Handle specific error cases
      if (error.message?.includes('cancelled')) {
        reject(new Error('Transaction cancelled by user'));
      } else if (error.message?.includes('cooldown')) {
        reject(new Error('Claim cooldown is still active. Please wait.'));
      } else if (error.message?.includes('insufficient')) {
        reject(new Error('Insufficient STX for transaction fee'));
      } else {
        reject(new Error('Failed to claim tokens. Please try again.'));
      }
    }
  });
};

/**
 * Convert blocks to time duration
 */
export const blocksToTime = (blocks: number): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} => {
  // 1 block ≈ 10 minutes = 600 seconds
  const totalSeconds = blocks * 600;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
};

/**
 * Format time remaining as a human-readable string
 */
export const formatTimeRemaining = (blocks: number): string => {
  if (blocks === 0) return 'Available now';

  const { hours, minutes, seconds } = blocksToTime(blocks);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Tipping and Cheering Functions

/**
 * Send a tip to a creator with STX
 * @param creatorAddress - Principal address of the creator
 * @param amount - Amount in micro-STX (1 STX = 1,000,000 micro-STX)
 * @param userAddress - Principal address of the sender
 * @returns Transaction ID
 */
export const sendTipWithStx = async (
  creatorAddress: string,
  amount: number,
  userAddress: string
): Promise<string> => {
  try {
    const network = getNetwork();
    const { address: tipzCoreAddress, name: tipzCoreName } = parseContractId(TIPZ_CORE_CONTRACT);

    console.log('Sending STX tip:', {
      creator: creatorAddress,
      amount: `${amount} micro-STX (${amount / 1_000_000} STX)`,
      from: userAddress,
      contract: `${tipzCoreAddress}.${tipzCoreName}`,
    });

    const txOptions = {
      contractAddress: tipzCoreAddress,
      contractName: tipzCoreName,
      functionName: 'tip-with-stx',
      functionArgs: [
        standardPrincipalCV(creatorAddress),
        uintCV(amount),
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Tip transaction broadcast:', data.txId);
      },
      onCancel: () => {
        console.log('Tip transaction cancelled by user');
        throw new Error('Transaction cancelled by user');
      },
    };

    await openContractCall(txOptions);
    
    // Return a pending transaction ID (actual txId comes in onFinish callback)
    return 'pending';
  } catch (error: any) {
    console.error('Error sending tip:', error);
    throw new Error(error.message || 'Failed to send tip');
  }
};

/**
 * Send CHEER tokens to a creator
 * @param creatorAddress - Principal address of the creator
 * @param amount - Amount of CHEER tokens
 * @param userAddress - Principal address of the sender
 * @returns Transaction ID
 */
export const sendCheerWithToken = async (
  creatorAddress: string,
  amount: number,
  userAddress: string
): Promise<string> => {
  try {
    const network = getNetwork();
    const { address: tipzCoreAddress, name: tipzCoreName } = parseContractId(TIPZ_CORE_CONTRACT);

    console.log('Sending CHEER tokens:', {
      creator: creatorAddress,
      amount: `${amount} CHEER`,
      from: userAddress,
      contract: `${tipzCoreAddress}.${tipzCoreName}`,
    });

    const txOptions = {
      contractAddress: tipzCoreAddress,
      contractName: tipzCoreName,
      functionName: 'cheer-with-token',
      functionArgs: [
        standardPrincipalCV(creatorAddress),
        uintCV(amount),
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Cheer transaction broadcast:', data.txId);
      },
      onCancel: () => {
        console.log('Cheer transaction cancelled by user');
        throw new Error('Transaction cancelled by user');
      },
    };

    await openContractCall(txOptions);
    
    // Return a pending transaction ID (actual txId comes in onFinish callback)
    return 'pending';
  } catch (error: any) {
    console.error('Error sending cheer:', error);
    
    // Handle specific CHEER errors
    if (error.message?.includes('insufficient')) {
      throw new Error('Insufficient CHEER balance');
    }
    
    throw new Error(error.message || 'Failed to send cheer');
  }
};

// Creator Registration Functions

/**
 * Register a new creator on the blockchain
 * @param name - Creator name (3-50 characters)
 * @param metadataUri - IPFS URI (ipfs://QmXXX...)
 * @param userAddress - Principal address of the creator
 * @returns Transaction ID
 */
export const registerCreatorOnChain = async (
  name: string,
  metadataUri: string,
  userAddress: string
): Promise<string> => {
  try {
    const network = getNetwork();
    const { address: tipzCoreAddress, name: tipzCoreName } = parseContractId(TIPZ_CORE_CONTRACT);

    console.log('Registering creator:', {
      name,
      metadataUri,
      from: userAddress,
      contract: `${tipzCoreAddress}.${tipzCoreName}`,
    });

    // Import required types for string values
    const { stringAsciiCV } = await import('@stacks/transactions');

    const txOptions = {
      contractAddress: tipzCoreAddress,
      contractName: tipzCoreName,
      functionName: 'register-creator',
      functionArgs: [
        stringAsciiCV(name),
        stringAsciiCV(metadataUri),
      ],
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data: any) => {
        console.log('Creator registration transaction broadcast:', data.txId);
      },
      onCancel: () => {
        console.log('Creator registration cancelled by user');
        throw new Error('Registration cancelled by user');
      },
    };

    await openContractCall(txOptions);
    
    // Return a pending transaction ID
    return 'pending';
  } catch (error: any) {
    console.error('Error registering creator:', error);
    
    // Handle specific registration errors
    if (error.message?.includes('already exists')) {
      throw new Error('Creator already registered with this address');
    }
    if (error.message?.includes('invalid name')) {
      throw new Error('Invalid creator name. Use 3-50 characters.');
    }
    
    throw new Error(error.message || 'Failed to register creator');
  }
};

/**
 * Check if an address is already registered as a creator
 * @param address - Principal address to check
 * @returns Boolean indicating if address is registered
 */
export const isCreatorRegistered = async (address: string): Promise<boolean> => {
  try {
    const network = getNetwork();
    const { address: tipzCoreAddress, name: tipzCoreName } = parseContractId(TIPZ_CORE_CONTRACT);

    console.log('Checking creator registration for:', address);

    const result = await fetchCallReadOnlyFunction({
      contractAddress: tipzCoreAddress,
      contractName: tipzCoreName,
      functionName: 'get-creator-info',
      functionArgs: [standardPrincipalCV(address)],
      network,
      senderAddress: address,
    });

    const value = cvToValue(result);
    console.log('Creator registration check result:', value);

    // If the result is not null/none, creator is registered
    return value !== null && value !== undefined;
  } catch (error) {
    console.error('Error checking creator registration:', error);
    return false;
  }
};
