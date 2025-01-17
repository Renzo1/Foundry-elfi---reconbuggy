import { Abi as AbiSchema } from 'abitype/zod';
import {} from 'viem';
import { z } from 'zod';
import { fromZodError } from '../errors.js';
import { fetch } from './fetch.js';
const SourcifyResponse = z.object({
    compiler: z.object({
        version: z.string(),
    }),
    language: z.string(),
    output: z.object({
        abi: AbiSchema,
        devdoc: z.any(),
        userdoc: z.any(),
    }),
    settings: z.any(),
    sources: z.any(),
    version: z.number(),
});
/** Fetches contract ABIs from Sourcify. */
export function sourcify(config) {
    const { cacheDuration, chainId, contracts: contracts_ } = config;
    const contracts = contracts_.map((x) => ({
        ...x,
        address: typeof x.address === 'string' ? { [chainId]: x.address } : x.address,
    }));
    return fetch({
        cacheDuration,
        contracts,
        async parse({ response }) {
            if (response.status === 404)
                throw new Error('Contract not found in Sourcify repository.');
            const json = await response.json();
            const parsed = await SourcifyResponse.safeParseAsync(json);
            if (!parsed.success)
                throw fromZodError(parsed.error, { prefix: 'Invalid response' });
            if (parsed.data.output.abi)
                return parsed.data.output.abi;
            throw new Error('contract not found');
        },
        request({ address }) {
            if (!address)
                throw new Error('address is required');
            let contractAddress;
            if (typeof address === 'string')
                contractAddress = address;
            if (typeof address === 'object')
                contractAddress = address[chainId];
            if (!contractAddress)
                throw new Error(`No address found for chainId "${chainId}". Make sure chainId "${chainId}" is set as an address.`);
            return {
                url: `https://repo.sourcify.dev/contracts/full_match/${chainId}/${contractAddress}/metadata.json`,
            };
        },
    });
}
//# sourceMappingURL=sourcify.js.map