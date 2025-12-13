import {
  fetchCallReadOnlyFunction,
  AnchorMode,
  PostConditionMode,
  cvToValue,
  standardPrincipalCV,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { getNetwork } from './stacksService';
import { DEPLOYER_ADDRESS, CHEER_TOKEN_CONTRACT } from '@utils/constants';

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

console.log('Contract Config:', {
  address: CHEER_TOKEN_ADDRESS,
  name: CHEER_TOKEN_NAME,
  fullId: `${CHEER_TOKEN_ADDRESS}.${CHEER_TOKEN_NAME}`
});

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
