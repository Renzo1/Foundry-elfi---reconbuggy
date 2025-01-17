import { camelCase } from 'change-case';
import {} from 'viem';
import { z } from 'zod';
import {} from '../config.js';
import { fromZodError } from '../errors.js';
import {} from '../types.js';
import { fetch } from './fetch.js';
const BlockExplorerResponse = z.discriminatedUnion('status', [
    z.object({
        status: z.literal('1'),
        message: z.literal('OK'),
        result: z
            .string()
            .transform((val) => JSON.parse(val)),
    }),
    z.object({
        status: z.literal('0'),
        message: z.literal('NOTOK'),
        result: z.string(),
    }),
]);
/**
 * Fetches contract ABIs from block explorers, supporting `?module=contract&action=getabi` requests.
 */
export function blockExplorer(config) {
    const { apiKey, baseUrl, cacheDuration, contracts, getAddress = ({ address }) => {
        if (typeof address === 'string')
            return address;
        return Object.values(address)[0];
    }, name = 'Block Explorer', } = config;
    return fetch({
        cacheDuration,
        contracts,
        name,
        getCacheKey({ contract }) {
            if (typeof contract.address === 'string')
                return `${camelCase(name)}:${contract.address}`;
            return `${camelCase(name)}:${JSON.stringify(contract.address)}`;
        },
        async parse({ response }) {
            const json = await response.json();
            const parsed = await BlockExplorerResponse.safeParseAsync(json);
            if (!parsed.success)
                throw fromZodError(parsed.error, { prefix: 'Invalid response' });
            if (parsed.data.status === '0')
                throw new Error(parsed.data.result);
            return parsed.data.result;
        },
        request({ address }) {
            if (!address)
                throw new Error('address is required');
            return {
                url: `${baseUrl}?module=contract&action=getabi&address=${getAddress({
                    address,
                })}${apiKey ? `&apikey=${apiKey}` : ''}`,
            };
        },
    });
}
//# sourceMappingURL=blockExplorer.js.map