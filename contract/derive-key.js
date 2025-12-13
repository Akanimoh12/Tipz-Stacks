const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const { TransactionVersion } = require('@stacks/transactions');

const mnemonic = process.argv[2];

if (!mnemonic) {
  console.log('Usage: node derive-key.js "your 24 word mnemonic phrase here"');
  process.exit(1);
}

async function deriveKey() {
  try {
    const wallet = await generateWallet({
      secretKey: mnemonic,
      password: '',
    });

    const account = wallet.accounts[0];
    const address = getStxAddress({ account, transactionVersion: TransactionVersion.Testnet });
    
    console.log('\n✅ Key Derivation Successful!\n');
    console.log('Address:', address);
    console.log('Private Key:', account.stxPrivateKey);
    console.log('\nTo claim tokens, run:');
    console.log(`export STACKS_PRIVATE_KEY="${account.stxPrivateKey}"`);
    console.log('node claim-tokens.js');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

deriveKey();
