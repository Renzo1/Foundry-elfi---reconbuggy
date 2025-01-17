import { blockExplorer } from './blockExplorer.js';
const apiUrls = {
    // Ethereum
    [1]: 'https://api.etherscan.io/api',
    [5]: 'https://api-goerli.etherscan.io/api',
    [17000]: 'https://api-holesky.etherscan.io/api',
    [11155111]: 'https://api-sepolia.etherscan.io/api',
    // Optimism
    [10]: 'https://api-optimistic.etherscan.io/api',
    [420]: 'https://api-goerli-optimistic.etherscan.io/api',
    [11155420]: 'https://api-sepolia-optimistic.etherscan.io/api',
    // Polygon
    [137]: 'https://api.polygonscan.com/api',
    [80001]: 'https://api-testnet.polygonscan.com/api',
    // Arbitrum
    [42161]: 'https://api.arbiscan.io/api',
    [421613]: 'https://api-goerli.arbiscan.io/api',
    [421614]: 'https://api-sepolia.arbiscan.io/api',
    // BNB Smart Chain
    [56]: 'https://api.bscscan.com/api',
    [97]: 'https://api-testnet.bscscan.com/api',
    // Heco Chain
    [128]: 'https://api.hecoinfo.com/api',
    [256]: 'https://api-testnet.hecoinfo.com/api',
    // Fantom
    [250]: 'https://api.ftmscan.com/api',
    [4002]: 'https://api-testnet.ftmscan.com/api',
    // Avalanche
    [43114]: 'https://api.snowtrace.io/api',
    [43113]: 'https://api-testnet.snowtrace.io/api',
    // Celo
    [42220]: 'https://api.celoscan.io/api',
    [44787]: 'https://api-alfajores.celoscan.io/api',
    // Fraxtal
    [252]: 'https://api.fraxscan.com/api',
    [2522]: 'https://api-holesky.fraxscan.com/api',
};
/**
 * Fetches contract ABIs from Etherscan.
 */
export function etherscan(config) {
    const { apiKey, cacheDuration, chainId } = config;
    const contracts = config.contracts.map((x) => ({
        ...x,
        address: typeof x.address === 'string' ? { [chainId]: x.address } : x.address,
    }));
    return blockExplorer({
        apiKey,
        baseUrl: apiUrls[chainId],
        cacheDuration,
        contracts,
        getAddress({ address }) {
            if (!address)
                throw new Error('address is required');
            if (typeof address === 'string')
                return address;
            const contractAddress = address[chainId];
            if (!contractAddress)
                throw new Error(`No address found for chainId "${chainId}". Make sure chainId "${chainId}" is set as an address.`);
            return contractAddress;
        },
        name: 'Etherscan',
    });
}
//# sourceMappingURL=etherscan.js.map