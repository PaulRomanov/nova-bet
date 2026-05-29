/**
 * Casino contract configuration
 * ──────────────────────────────────────────────────────────────────────────
 * HOW TO GET THESE VALUES FROM REMIX:
 *
 * 1. CONTRACT_ADDRESS:
 *    After deploying in Remix IDE → "Deploy & Run Transactions" panel →
 *    copy the address under "Deployed Contracts" (e.g. 0x5B38...)
 *
 * 2. CONTRACT_ABI:
 *    Remix IDE → Solidity Compiler panel → click "ABI" button (bottom) →
 *    copy the JSON array and paste it below.
 *
 * 3. NETWORK:
 *    - Remix VM (Cancun) → add http://127.0.0.1:8545 as custom network in MetaMask
 *    - Or switch MetaMask to Sepolia if deploying there
 */

// ⚠️  REPLACE with your deployed contract address from Remix
export const CONTRACT_ADDRESS = '0xc9682f026629c21b04B0dcA73c43f6Ce11Fd00b4'

// ⚠️  REPLACE with the ABI copied from Remix "Solidity Compiler → ABI"
export const CONTRACT_ABI = [
  // --- View functions ---
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCasinoReserve',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBetLimits',
    outputs: [
      { internalType: 'uint256', name: 'min', type: 'uint256' },
      { internalType: 'uint256', name: 'max', type: 'uint256' },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // --- State-changing functions ---
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'choice', type: 'uint8' },
      { internalType: 'uint256', name: 'betAmount', type: 'uint256' },
    ],
    name: 'flip',
    outputs: [
      { internalType: 'bool', name: 'won', type: 'bool' },
      { internalType: 'uint8', name: 'result', type: 'uint8' },
      { internalType: 'uint256', name: 'payout', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // --- Events ---
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'player',
        type: 'address',
      },
      { indexed: false, internalType: 'uint8', name: 'choice', type: 'uint8' },
      { indexed: false, internalType: 'uint8', name: 'result', type: 'uint8' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'betAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'payout',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bool', name: 'won', type: 'bool' },
    ],
    name: 'CoinFlipped',
    type: 'event',
  },
]
