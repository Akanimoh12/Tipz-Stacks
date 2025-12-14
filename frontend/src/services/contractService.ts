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
const CHEER_TOKEN_ADDRESS = CHEER_TOKEN_CONTRACT.address;
const CHEER_TOKEN_NAME = CHEER_TOKEN_CONTRACT.name;

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
    const tipzCoreAddress = TIPZ_CORE_CONTRACT.address;
    const tipzCoreName = TIPZ_CORE_CONTRACT.name;

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
    const tipzCoreAddress = TIPZ_CORE_CONTRACT.address;
    const tipzCoreName = TIPZ_CORE_CONTRACT.name;

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
    const tipzCoreAddress = TIPZ_CORE_CONTRACT.address;
    const tipzCoreName = TIPZ_CORE_CONTRACT.name;

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
    const tipzCoreAddress = TIPZ_CORE_CONTRACT.address;
    const tipzCoreName = TIPZ_CORE_CONTRACT.name;

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

/**
 * Get creator info from contract
 * @param address - Creator principal address
 * @returns Creator info or null
 */
export const getCreatorInfo = async (address: string) => {
  try {
    const network = getNetwork();
    const result = await fetchCallReadOnlyFunction({
      contractAddress: TIPZ_CORE_CONTRACT.address,
      contractName: TIPZ_CORE_CONTRACT.name,
      functionName: 'get-creator-info',
      functionArgs: [standardPrincipalCV(address)],
      network,
      senderAddress: address,
    });

    const value = cvToValue(result);
    if (!value) return null;

    return {
      name: value.name,
      metadataUri: value['metadata-uri'],
      totalStxReceived: Number(value['total-stx-received']),
      totalCheerReceived: Number(value['total-cheer-received']),
      supportersCount: Number(value['supporters-count']),
      createdAt: Number(value['created-at']),
    };
  } catch (error) {
    console.error('Error getting creator info:', error);
    return null;
  }
};

/**
 * Fetch all creators from Stacks API using contract events
 * This queries the blockchain API for creator-registered events
 */
export const getAllCreators = async (): Promise<string[]> => {
  try {
    const { address, name } = TIPZ_CORE_CONTRACT;
    const contractId = `${address}.${name}`;
    const apiUrl = import.meta.env.VITE_STACKS_API || 'https://api.testnet.hiro.so';
    
    // Query contract events for creator registrations
    const response = await fetch(
      `${apiUrl}/extended/v1/contract/${contractId}/events?limit=200&offset=0`
    );

    if (!response.ok) {
      console.error('Failed to fetch contract events:', response.statusText);
      return [];
    }

    const data = await response.json();
    const creatorAddresses: string[] = [];

    // Parse events to extract creator addresses
    if (data.results && Array.isArray(data.results)) {
      for (const event of data.results) {
        if (event.contract_log?.value?.repr) {
          const eventData = event.contract_log.value.repr;
          // Look for creator-registered events
          if (eventData.includes('creator-registered') || eventData.includes('event: \"creator-registered\"')) {
            // Extract creator address from event
            const creatorMatch = eventData.match(/creator: ([A-Z0-9]+)/);
            if (creatorMatch && creatorMatch[1]) {
              const address = creatorMatch[1];
              if (!creatorAddresses.includes(address)) {
                creatorAddresses.push(address);
              }
            }
          }
        }
      }
    }

    console.log('Found creators from events:', creatorAddresses);
    return creatorAddresses;
  } catch (error) {
    console.error('Error fetching creators from API:', error);
    return [];
  }
};
