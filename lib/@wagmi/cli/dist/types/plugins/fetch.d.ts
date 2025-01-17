import type { ContractConfig, Plugin } from '../config.js';
import type { Evaluate, RequiredBy } from '../types.js';
export type FetchConfig = {
    /**
     * Duration in milliseconds to cache ABIs from request.
     *
     * @default 1_800_000 // 30m in ms
     */
    cacheDuration?: number | undefined;
    /**
     * Contracts to fetch ABIs for.
     */
    contracts: Evaluate<Omit<ContractConfig, 'abi'>>[];
    /**
     * Function for creating a cache key for contract.
     */
    getCacheKey?: ((config: {
        contract: Evaluate<Omit<ContractConfig, 'abi'>>;
    }) => string) | undefined;
    /**
     * Name of source.
     */
    name?: ContractConfig['name'] | undefined;
    /**
     * Function for parsing ABI from fetch response.
     *
     * @default ({ response }) => response.json()
     */
    parse?: ((config: {
        response: Response;
    }) => ContractConfig['abi'] | Promise<ContractConfig['abi']>) | undefined;
    /**
     * Function for returning a request to fetch ABI from.
     */
    request: (config: {
        address?: ContractConfig['address'] | undefined;
    }) => {
        url: RequestInfo;
        init?: RequestInit | undefined;
    } | Promise<{
        url: RequestInfo;
        init?: RequestInit | undefined;
    }>;
    /**
     * Duration in milliseconds before request times out.
     *
     * @default 5_000 // 5s in ms
     */
    timeoutDuration?: number | undefined;
};
type FetchResult = Evaluate<RequiredBy<Plugin, 'contracts'>>;
/** Fetches and parses contract ABIs from network resource with `fetch`. */
export declare function fetch(config: FetchConfig): FetchResult;
export {};
//# sourceMappingURL=fetch.d.ts.map