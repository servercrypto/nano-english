export const BASE_SEPOLIA_CHAIN_ID = 8453; // Изменили на Base Mainnet Chain ID

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

// Новый рабочий контракт ончейн-чек-инов в Base Mainnet
export const checkInContractAddress = '0x756247796021Edab4401D07d80323CEb57Df382d'; // Твой новый Mainnet адрес
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
