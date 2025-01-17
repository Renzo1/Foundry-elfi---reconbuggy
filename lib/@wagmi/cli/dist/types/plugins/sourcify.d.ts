import type * as chain from 'viem/chains';
import type { ContractConfig } from '../config.js';
import type { Evaluate } from '../types.js';
export type SourcifyConfig<chainId extends number> = {
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
     *
     * See https://docs.sourcify.dev/docs/chains for supported chains.
     */
    chainId: chainId;
    /**
     * Contracts to fetch ABIs for.
     */
    contracts: Evaluate<Omit<ContractConfig<ChainId, chainId>, 'abi'>>[];
};
/** Fetches contract ABIs from Sourcify. */
export declare function sourcify<chainId extends ChainId>(config: SourcifyConfig<chainId>): {
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
                /** Fetches contract ABIs from Sourcify. */
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
type ChainId = typeof chain.mainnet.id | typeof chain.goerli.id | 11155111 | typeof chain.arbitrumGoerli.id | typeof chain.arbitrum.id | 592 | typeof chain.aurora.id | typeof chain.auroraTestnet.id | typeof chain.avalanche.id | typeof chain.avalancheFuji.id | 56 | 97 | 288 | 28 | 534 | typeof chain.canto.id | typeof chain.celoAlfajores.id | 62320 | typeof chain.celo.id | typeof chain.gnosisChiado.id | 103090 | 53935 | 335 | 44 | 43 | 432204 | 432201 | 246 | 73799 | typeof chain.evmos.id | typeof chain.evmosTestnet.id | 122 | 486217935 | 192837465 | 356256156 | typeof chain.gnosis.id | 71402 | 71401 | 420420 | 420666 | 8217 | 1001 | 82 | 83 | 1287 | 1284 | 1285 | 62621 | 42262 | 42261 | 23295 | 311752642 | 4216137055 | typeof chain.optimism.id | 28528 | typeof chain.optimismGoerli.id | 300 | 99 | 77 | 11297108109 | 11297108099 | typeof chain.polygon.id | typeof chain.polygonMumbai.id | 336 | 57 | 5700 | 40 | 41 | 8 | 106 | 11111 | 51 | 7001;
export {};
//# sourceMappingURL=sourcify.d.ts.map