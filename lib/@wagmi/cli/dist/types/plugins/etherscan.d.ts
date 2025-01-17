import type { ContractConfig } from '../config.js';
import type { Evaluate } from '../types.js';
declare const apiUrls: {
    1: string;
    5: string;
    17000: string;
    11155111: string;
    10: string;
    420: string;
    11155420: string;
    137: string;
    80001: string;
    42161: string;
    421613: string;
    421614: string;
    56: string;
    97: string;
    128: string;
    256: string;
    250: string;
    4002: string;
    43114: string;
    43113: string;
    42220: string;
    44787: string;
    252: string;
    2522: string;
};
type ChainId = keyof typeof apiUrls;
export type EtherscanConfig<chainId extends number> = {
    /**
     * Etherscan API key.
     *
     * API keys are specific per network and include testnets (e.g. Ethereum Mainnet and Goerli share same API key). Create or manage keys:
     * - [__Ethereum__](https://etherscan.io/myapikey)
     * - [__Arbitrum__](https://arbiscan.io/myapikey)
     * - [__Avalanche__](https://snowtrace.io/myapikey)
     * - [__BNB Smart Chain__](https://bscscan.com/myapikey)
     * - [__Celo__](https://celoscan.io/myapikey)
     * - [__Fantom__](https://ftmscan.com/myapikey)
     * - [__Heco Chain__](https://hecoinfo.com/myapikey)
     * - [__Optimism__](https://optimistic.etherscan.io/myapikey)
     * - [__Polygon__](https://polygonscan.com/myapikey)
     * - [__Fraxtal__](https://fraxscan.com/myapikey)
     */
    apiKey: string;
    /**
     * Duration in milliseconds to cache ABIs.
     *
     * @default 1_800_000 // 30m in ms
     */
    cacheDuration?: number | undefined;
    /**
     * Chain id to use for fetching ABI.
     *
     * If `address` is an object, `chainId` is used to select the address.
     */
    chainId: chainId;
    /**
     * Contracts to fetch ABIs for.
     */
    contracts: Evaluate<Omit<ContractConfig<ChainId, chainId>, 'abi'>>[];
};
/**
 * Fetches contract ABIs from Etherscan.
 */
export declare function etherscan<chainId extends ChainId>(config: EtherscanConfig<chainId>): {
    contracts: () => import("../types.js").MaybePromise<ContractConfig<number, undefined>[]>;
    name: string;
    run?: ((config: {
        contracts: {
            abi: import("abitype").Abi;
            address?: `0x${string}` | Record<number, `0x${string}`> | undefined;
            name: string;
            content: string;
            meta: {
                abiName: string;
                addressName?: string | undefined;
                configName?: string | undefined;
            };
        }[];
        isTypeScript: boolean;
        outputs: readonly {
            plugin: Pick<import("../config.js").Plugin, "name">;
            imports?: string | undefined;
            prepend?: string | undefined;
            content: string;
        }[];
    }) => import("../types.js").MaybePromise<{
        imports?: string | undefined;
        prepend?: string | undefined;
        content: string;
    }>) | undefined;
    validate?: (() => import("../types.js").MaybePromise<void>) | undefined;
    watch?: import("../config.js").Watch | undefined;
};
export {};
//# sourceMappingURL=etherscan.d.ts.map