const { makeContractCall, broadcastTransaction, AnchorMode, standardPrincipalCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');

async function claimTokens() {
  const network = new StacksTestnet();
  
  // Your wallet details
  const senderKey = process.env.STACKS_PRIVATE_KEY;
  const contractAddress = 'ST1XHPEWSZYNN2QA9QG9JG9GHRVF6GZSFRWTFB5VV';
  const contractName = 'cheer-token';
  const functionName = 'claim-daily-tokens';

  console.log('🎉 Claiming 100 CHEER tokens...\n');
  console.log(`Contract: ${contractAddress}.${contractName}`);
  console.log(`Function: ${functionName}\n`);

  try {
    const txOptions = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [],
      senderKey,
      validateWithAbi: true,
      network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);

    console.log('✅ Transaction Broadcast!\n');
    console.log(`Transaction ID: ${broadcastResponse.txid}`);
    console.log(`\n🔗 View on Explorer:`);
    console.log(`https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    console.log(`\n⏳ Waiting for confirmation (this may take 10-20 minutes)...`);
    console.log(`\nRefresh the explorer link to check status.`);

  } catch (error) {
    console.error('❌ Error claiming tokens:', error.message);
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
  }
}

claimTokens();
