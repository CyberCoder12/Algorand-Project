import * as algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';

// Algorand TestNet configuration
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = 443;

const INDEXER_TOKEN = '';
const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
const INDEXER_PORT = 443;

// Create clients
export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
export const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT);

// Campus Token Asset ID on TestNet (Example ID, replace with real one)
export const CAMPUS_TOKEN_ASSET_ID = 123456789;

// Interface types
export interface VoteTransaction {
  txId: string;
  sender: string;
  pollId: string;
  option: string;
  timestamp: number;
}

// Get account balance
export async function getAccountBalance(address: string): Promise<number> {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return Number(accountInfo.amount || 0);
  } catch (e) {
    console.error('Error fetching balance:', e);
    return 0;
  }
}

// Get token balance using Indexer for better performance/reliability
export async function getTokenBalance(
  address: string,
  assetId: number = CAMPUS_TOKEN_ASSET_ID
): Promise<number> {
  try {
    const accountInfo = await indexerClient.lookupAccountAssets(address).do();
    const assets = accountInfo['assets'] || [];
    const campusToken = assets.find((asset: any) => asset['asset-id'] === assetId);
    return campusToken ? Number(campusToken.amount) : 0;
  } catch (e) {
    console.error('Error fetching token balance:', e);
    return 0;
  }
}

// Verify voter eligibility (real check)
export async function verifyVoterEligibility(
  address: string,
  minTokenBalance: number
): Promise<{ eligible: boolean; tokenBalance: number }> {
  const tokenBalance = await getTokenBalance(address);
  return {
    eligible: tokenBalance >= minTokenBalance,
    tokenBalance,
  };
}

// Create vote transaction (0 ALGO payment to self with note)
export function createVoteTransaction(
  sender: string,
  pollId: string,
  optionId: string
): any { // using any to avoid strict typing issues during draft, but ideally algosdk.Transaction
  const params = {
    from: sender,
    to: sender, // Send to self
    amount: 0,
    note: new TextEncoder().encode(`vote:${pollId}:${optionId}`),
    suggestedParams: {
      fee: 1000,
      firstRound: 1,
      lastRound: 1000,
      genesisID: 'testnet-v1.0',
      genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
    }
  };
  // Ideally we use algodClient.getTransactionParams(), but this needs to be async.
  // The caller should normally fetch params. 
  // For this helper, let's accept suggestedParams or fetch them if we make it async.
  return null; // Placeholder as we need async params
}

// Better approach: Async helper
export async function createVoteTransactionAsync(
  sender: string,
  pollId: string,
  optionId: string
): Promise<any> {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: sender,
    receiver: sender, // Was 'to'
    amount: 0,
    note: new TextEncoder().encode(`json:{"p":"${pollId}","o":"${optionId}"}`),
    suggestedParams,
  });
  return txn;
}

// Send signed transaction
export async function sendTransaction(signedTxn: Uint8Array): Promise<string> {
  const response = await algodClient.sendRawTransaction(signedTxn).do() as any;
  console.log('sendRawTransaction response:', JSON.stringify(response, null, 2));

  const txId = response.txId || response.txid || (typeof response === 'string' ? response : null);

  if (!txId) {
    throw new Error('Failed to parse transaction ID from response: ' + JSON.stringify(response));
  }

  return txId;
}

// Helper to format address
export function formatAddress(address: string): string {
  if (!address || address.length <= 12) return address || '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to format timestamp
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

// Find vote transaction by address and poll ID (Recovery)
export async function findVoteTransaction(
  address: string,
  pollId: string
): Promise<string | null> {
  try {
    // Search for transactions by this address
    const response = await indexerClient
      .lookupAccountTransactions(address)
      .limit(100) // Look at recent 100 txns
      .do();

    const transactions = response['transactions'] || [];

    // Find one that matches our vote pattern
    const match = transactions.find((txn: any) => {
      if (!txn.note) return false;
      try {
        const note = Buffer.from(txn.note, 'base64').toString('utf-8');
        // Check for expected note patterns (we supported two: "vote:..." and "json:...")
        return note.includes(pollId);
      } catch (e) {
        return false;
      }
    });

    return match ? (match.id || null) : null;
  } catch (e) {
    console.error('Error finding vote transaction:', e);
    return null;
  }
}

// Wait for confirmation
export async function waitForConfirmation(txId: string): Promise<any> {
  try {
    const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
    return result;
  } catch (e) {
    console.error('Error waiting for confirmation:', e);
    throw new Error(`Transaction ${txId} not confirmed: ${e}`);
  }
}

// Export utilities
export const algorandUtils = {
  getAccountBalance,
  getTokenBalance,
  verifyVoterEligibility,
  createVoteTransactionAsync,
  sendTransaction,
  waitForConfirmation,
  findVoteTransaction,
  formatAddress,
  formatTimestamp,
};

