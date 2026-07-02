export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Старый контракт минта (шаблон OnchainKit)
export const mintContractAddress = '0xA3e40bBe8E8579Cd2619Ef9C6fEA362b760dac9f';
export const mintABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'public',
    type: 'function',
  },
] as const;

// Новый рабочий контракт ончейн-чек-инов
export const checkInContractAddress = '0x8a69EA95949f8cd9E6B2aCb3460A638A67935BAE';
export const checkInABI = [
  {
    type: "function",
    name: "appName",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "checkIn",
    inputs: [
      { name: "category", type: "string", internalType: "string" },
      { name: "stageId", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "PlayerCheckIn",
    inputs: [
      { name: "player", type: "address", indexed: true, internalType: "address" },
      { name: "category", type: "string", indexed: false, internalType: "string" },
      { name: "stageId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  }
] as const;
