import type { Abi } from '../abi.js';
import { type FormatAbiItem } from './formatAbiItem.js';
/**
 * Parses JSON ABI into human-readable ABI
 *
 * @param TAbi - ABI
 * @returns Human-readable ABI
 */
export type FormatAbi<TAbi extends Abi | readonly unknown[]> = Abi extends TAbi ? readonly string[] : TAbi extends readonly [] ? never : TAbi extends Abi ? {
    [K in keyof TAbi]: FormatAbiItem<TAbi[K]>;
} : readonly string[];
/**
 * Parses JSON ABI into human-readable ABI
 *
 * @param abi - ABI
 * @returns Human-readable ABI
 */
export declare function formatAbi<const TAbi extends Abi | readonly unknown[]>(abi: TAbi): FormatAbi<TAbi>;
//# sourceMappingURL=formatAbi.d.ts.map