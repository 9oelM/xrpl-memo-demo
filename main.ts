import { Client, Wallet, xrpToDrops, Payment } from 'xrpl';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';
const DESTINATION_ADDRESS = 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY';

async function connectToTestnet(): Promise<Client> {
  const client = new Client(TESTNET_URL);
  await client.connect();
  console.log('Connected to XRPL Testnet');
  return client;
}

async function fundWallet(client: Client): Promise<Wallet> {
  console.log('\nFunding wallet from faucet...');
  const { wallet } = await client.fundWallet();
  console.log(`Wallet funded: ${wallet.address}`);
  console.log(`Balance: ${await getBalance(client, wallet.address)} XRP`);
  return wallet;
}

async function getBalance(client: Client, address: string): Promise<number> {
  const balance = await client.getXrpBalance(address);
  return balance;
}

function calculateSHA256Hash(filePath: string): string {
  const fileContent = readFileSync(filePath, 'utf-8');
  const hash = createHash('sha256').update(fileContent).digest('hex');
  return hash;
}

function convertStringToHex(text: string): string {
  return Buffer.from(text, 'utf-8').toString('hex').toUpperCase();
}

async function sendPaymentWithMemo(
  client: Client,
  wallet: Wallet,
  destination: string,
  memoData: string,
): Promise<void> {
  const payment: Payment = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: destination,
    Amount: '1',
    Memos: [
      {
        Memo: {
          MemoType: convertStringToHex('important-data'),
          MemoData: convertStringToHex(memoData),
        },
      },
    ],
  };

  console.log(`Sending 1 drop XRP to ${destination}`);
  console.log(`Memo Data: ${memoData}`);

  const prepared = await client.autofill(payment);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta && typeof result.result.meta === 'object' && 'TransactionResult' in result.result.meta) {
    console.log(`Transaction Result: ${result.result.meta.TransactionResult}`);
  }
  console.log(`Transaction Hash: ${result.result.hash}`);
  console.log(`View transaction: https://testnet.xrpl.org/transactions/${result.result.hash}`);
}

async function main(): Promise<void> {
  let client: Client | null = null;

  try {
    client = await connectToTestnet();
    const wallet = await fundWallet(client);

    console.log('=== Transaction #1: Plain Text Memo ===')
    // Transaction #1: Payment with memo "Hi Linklogis"
    await sendPaymentWithMemo(
      client,
      wallet,
      DESTINATION_ADDRESS,
      'Hi Linklogis',
    );

    // Transaction #2: Payment with SHA256 hash of example-document.txt
    const documentHash = calculateSHA256Hash('./example-document.txt');
    
    console.log('=== Transaction #2: Document Hash Memo ===')
    console.log(`\nSHA256 hash of example-document.txt: ${documentHash}`);
    await sendPaymentWithMemo(
      client,
      wallet,
      DESTINATION_ADDRESS,
      documentHash,
    );

    console.log('\n✅ All transactions completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    if (client) {
      await client.disconnect();
      console.log('\nDisconnected from XRPL Testnet');
    }
  }
}

main();
