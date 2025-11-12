/**
 * Transaction type color configuration
 * Maps transaction types to their corresponding color codes
 * Used for visual differentiation in the UI and game animations
 */
export const TX_TYPE_COLORS: Record<string, string> = {
    secp256k1_blake160_sighash_all: "#C2FFFA",
    dao: "#EDCFD3",
    secp256k1_blake160_multisig_all: "#BFE0EA",
    sudt: "#7A5699",
    xudt: "#8A5C32",
} as const;

export type TransactionType = keyof typeof TX_TYPE_COLORS;
