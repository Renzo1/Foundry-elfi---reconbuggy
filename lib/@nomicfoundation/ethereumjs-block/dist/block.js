"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_trie_1 = require("@nomicfoundation/ethereumjs-trie");
const ethereumjs_tx_1 = require("@nomicfoundation/ethereumjs-tx");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_1 = require("ethereum-cryptography/keccak");
const ethers_1 = require("ethers");
const from_rpc_1 = require("./from-rpc");
const header_1 = require("./header");
/**
 * An object that represents the block.
 */
class Block {
    /**
     * This constructor takes the values, validates them, assigns them and freezes the object.
     * Use the static factory methods to assist in creating a Block object from varying data types and options.
     */
    constructor(header, transactions = [], uncleHeaders = [], opts = {}, withdrawals) {
        this.transactions = [];
        this.uncleHeaders = [];
        this.txTrie = new ethereumjs_trie_1.Trie();
        this.header = header ?? header_1.BlockHeader.fromHeaderData({}, opts);
        this._common = this.header._common;
        this.transactions = transactions;
        this.withdrawals = withdrawals ?? (this._common.isActivatedEIP(4895) ? [] : undefined);
        this.uncleHeaders = uncleHeaders;
        if (uncleHeaders.length > 0) {
            this.validateUncles();
            if (this._common.consensusType() === ethereumjs_common_1.ConsensusType.ProofOfAuthority) {
                const msg = this._errorMsg('Block initialization with uncleHeaders on a PoA network is not allowed');
                throw new Error(msg);
            }
            if (this._common.consensusType() === ethereumjs_common_1.ConsensusType.ProofOfStake) {
                const msg = this._errorMsg('Block initialization with uncleHeaders on a PoS network is not allowed');
                throw new Error(msg);
            }
        }
        if (!this._common.isActivatedEIP(4895) && withdrawals !== undefined) {
            throw new Error('Cannot have a withdrawals field if EIP 4895 is not active');
        }
        const freeze = opts?.freeze ?? true;
        if (freeze) {
            Object.freeze(this);
        }
    }
    /**
     * Returns the withdrawals trie root for array of Withdrawal.
     * @param wts array of Withdrawal to compute the root of
     * @param optional emptyTrie to use to generate the root
     */
    static async genWithdrawalsTrieRoot(wts, emptyTrie) {
        const trie = emptyTrie ?? new ethereumjs_trie_1.Trie();
        for (const [i, wt] of wts.entries()) {
            await trie.put(Buffer.from(ethereumjs_rlp_1.RLP.encode(i)), (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.encode(wt.raw())));
        }
        return trie.root();
    }
    /**
     * Returns the ssz root for array of withdrawal transactions.
     * @param wts array of Withdrawal to compute the root of
     */
    static async generateWithdrawalsSSZRoot(withdrawals) {
        ethereumjs_util_1.ssz.Withdrawals.hashTreeRoot(withdrawals.map((wt) => wt.toValue()));
    }
    /**
     * Returns the txs trie root for array of TypedTransaction
     * @param txs array of TypedTransaction to compute the root of
     * @param optional emptyTrie to use to generate the root
     */
    static async genTransactionsTrieRoot(txs, emptyTrie) {
        const trie = emptyTrie ?? new ethereumjs_trie_1.Trie();
        for (const [i, tx] of txs.entries()) {
            await trie.put(Buffer.from(ethereumjs_rlp_1.RLP.encode(i)), tx.serialize());
        }
        return trie.root();
    }
    /**
     * Static constructor to create a block from a block data dictionary
     *
     * @param blockData
     * @param opts
     */
    static fromBlockData(blockData = {}, opts) {
        const { header: headerData, transactions: txsData, uncleHeaders: uhsData, withdrawals: withdrawalsData, } = blockData;
        const header = header_1.BlockHeader.fromHeaderData(headerData, opts);
        // parse transactions
        const transactions = [];
        for (const txData of txsData ?? []) {
            const tx = ethereumjs_tx_1.TransactionFactory.fromTxData(txData, {
                ...opts,
                // Use header common in case of hardforkByBlockNumber being activated
                common: header._common,
            });
            transactions.push(tx);
        }
        // parse uncle headers
        const uncleHeaders = [];
        const uncleOpts = {
            hardforkByBlockNumber: true,
            ...opts,
            // Use header common in case of hardforkByBlockNumber being activated
            common: header._common,
            // Disable this option here (all other options carried over), since this overwrites the provided Difficulty to an incorrect value
            calcDifficultyFromHeader: undefined,
            // This potentially overwrites hardforkBy options but we will set them cleanly just below
            hardforkByTTD: undefined,
        };
        // Uncles are obsolete post-merge, any hardfork by option implies hardforkByBlockNumber
        if (opts?.hardforkByTTD !== undefined) {
            uncleOpts.hardforkByBlockNumber = true;
        }
        for (const uhData of uhsData ?? []) {
            const uh = header_1.BlockHeader.fromHeaderData(uhData, uncleOpts);
            uncleHeaders.push(uh);
        }
        const withdrawals = withdrawalsData?.map(ethereumjs_util_1.Withdrawal.fromWithdrawalData);
        return new Block(header, transactions, uncleHeaders, opts, withdrawals);
    }
    /**
     * Static constructor to create a block from a RLP-serialized block
     *
     * @param serialized
     * @param opts
     */
    static fromRLPSerializedBlock(serialized, opts) {
        const values = (0, ethereumjs_util_1.arrToBufArr)(ethereumjs_rlp_1.RLP.decode(Uint8Array.from(serialized)));
        if (!Array.isArray(values)) {
            throw new Error('Invalid serialized block input. Must be array');
        }
        return Block.fromValuesArray(values, opts);
    }
    /**
     * Static constructor to create a block from an array of Buffer values
     *
     * @param values
     * @param opts
     */
    static fromValuesArray(values, opts) {
        if (values.length > 4) {
            throw new Error('invalid block. More values than expected were received');
        }
        const [headerData, txsData, uhsData, withdrawalsBuffer] = values;
        const header = header_1.BlockHeader.fromValuesArray(headerData, opts);
        // parse transactions
        const transactions = [];
        for (const txData of txsData ?? []) {
            transactions.push(ethereumjs_tx_1.TransactionFactory.fromBlockBodyData(txData, {
                ...opts,
                // Use header common in case of hardforkByBlockNumber being activated
                common: header._common,
            }));
        }
        // parse uncle headers
        const uncleHeaders = [];
        const uncleOpts = {
            hardforkByBlockNumber: true,
            ...opts,
            // Use header common in case of hardforkByBlockNumber being activated
            common: header._common,
            // Disable this option here (all other options carried over), since this overwrites the provided Difficulty to an incorrect value
            calcDifficultyFromHeader: undefined,
            // This potentially overwrites hardforkBy options but we will set them cleanly just below
            hardforkByTTD: undefined,
        };
        // Uncles are obsolete post-merge, any hardfork by option implies hardforkByBlockNumber
        if (opts?.hardforkByTTD !== undefined) {
            uncleOpts.hardforkByBlockNumber = true;
        }
        for (const uncleHeaderData of uhsData ?? []) {
            uncleHeaders.push(header_1.BlockHeader.fromValuesArray(uncleHeaderData, uncleOpts));
        }
        const withdrawals = withdrawalsBuffer
            ?.map(([index, validatorIndex, address, amount]) => ({
            index,
            validatorIndex,
            address,
            amount,
        }))
            ?.map(ethereumjs_util_1.Withdrawal.fromWithdrawalData);
        return new Block(header, transactions, uncleHeaders, opts, withdrawals);
    }
    /**
     * Creates a new block object from Ethereum JSON RPC.
     *
     * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
     * @param uncles - Optional list of Ethereum JSON RPC of uncles (eth_getUncleByBlockHashAndIndex)
     * @param options - An object describing the blockchain
     */
    static fromRPC(blockData, uncles, opts) {
        return (0, from_rpc_1.blockFromRpc)(blockData, uncles, opts);
    }
    /**
     * Returns a Buffer Array of the raw Buffers of this block, in order.
     */
    raw() {
        const bufferArray = [
            this.header.raw(),
            this.transactions.map((tx) => tx.supports(ethereumjs_tx_1.Capability.EIP2718TypedTransaction) ? tx.serialize() : tx.raw()),
            this.uncleHeaders.map((uh) => uh.raw()),
        ];
        const withdrawalsRaw = this.withdrawals?.map((wt) => wt.raw());
        if (withdrawalsRaw) {
            bufferArray.push(withdrawalsRaw);
        }
        return bufferArray;
    }
    /**
     * Returns the hash of the block.
     */
    hash() {
        return this.header.hash();
    }
    /**
     * Determines if this block is the genesis block.
     */
    isGenesis() {
        return this.header.isGenesis();
    }
    /**
     * Returns the rlp encoding of the block.
     */
    serialize() {
        return Buffer.from(ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(this.raw())));
    }
    /**
     * Generates transaction trie for validation.
     */
    async genTxTrie() {
        const { transactions, txTrie } = this;
        await Block.genTransactionsTrieRoot(transactions, txTrie);
    }
    /**
     * Validates the transaction trie by generating a trie
     * and do a check on the root hash.
     */
    async validateTransactionsTrie() {
        let result;
        if (this.transactions.length === 0) {
            result = this.header.transactionsTrie.equals(ethereumjs_util_1.KECCAK256_RLP);
            return result;
        }
        if (this.txTrie.root().equals(ethereumjs_util_1.KECCAK256_RLP)) {
            await this.genTxTrie();
        }
        result = this.txTrie.root().equals(this.header.transactionsTrie);
        return result;
    }
    validateTransactions(stringError = false) {
        const errors = [];
        let blockDataGas = BigInt(0);
        const dataGasLimit = this._common.param('gasConfig', 'maxDataGasPerBlock');
        const dataGasPerBlob = this._common.param('gasConfig', 'dataGasPerBlob');
        // eslint-disable-next-line prefer-const
        for (let [i, tx] of this.transactions.entries()) {
            const errs = tx.validate(true);
            if (this._common.isActivatedEIP(1559) === true) {
                if (tx.supports(ethereumjs_tx_1.Capability.EIP1559FeeMarket)) {
                    tx = tx;
                    if (tx.maxFeePerGas < this.header.baseFeePerGas) {
                        errs.push('tx unable to pay base fee (EIP-1559 tx)');
                    }
                }
                else {
                    tx = tx;
                    if (tx.gasPrice < this.header.baseFeePerGas) {
                        errs.push('tx unable to pay base fee (non EIP-1559 tx)');
                    }
                }
            }
            if (errs.length > 0) {
                errors.push(`errors at tx ${i}: ${errs.join(', ')}`);
            }
        }
        return stringError ? errors : errors.length === 0;
    }
    /**
     * Validates the block data, throwing if invalid.
     * This can be checked on the Block itself without needing access to any parent block
     * It checks:
     * - All transactions are valid
     * - The transactions trie is valid
     * - The uncle hash is valid
     * @param onlyHeader if only passed the header, skip validating txTrie and unclesHash (default: false)
     */
    async validateData(onlyHeader = false) {
        const txErrors = this.validateTransactions(true);
        if (txErrors.length > 0) {
            const msg = this._errorMsg(`invalid transactions: ${txErrors.join(' ')}`);
            throw new Error(msg);
        }
        if (onlyHeader) {
            return;
        }
        const validateTxTrie = await this.validateTransactionsTrie();
        if (!validateTxTrie) {
            const msg = this._errorMsg('invalid transaction trie');
            throw new Error(msg);
        }
        if (!this.validateUnclesHash()) {
            const msg = this._errorMsg('invalid uncle hash');
            throw new Error(msg);
        }
        if (this._common.isActivatedEIP(4895) && !(await this.validateWithdrawalsTrie())) {
            const msg = this._errorMsg('invalid withdrawals trie');
            throw new Error(msg);
        }
    }
    /**
     * Validates that data gas fee for each transaction is greater than or equal to the
     * dataGasPrice for the block and that total data gas in block is less than maximum
     * data gas per block
     * @param parentHeader header of parent block
     */
    validateBlobTransactions(parentHeader) {
        // removed in the fork because we don't support EIP4844
    }
    /**
     * Validates the uncle's hash.
     */
    validateUnclesHash() {
        const uncles = this.uncleHeaders.map((uh) => uh.raw());
        const raw = ethereumjs_rlp_1.RLP.encode((0, ethereumjs_util_1.bufArrToArr)(uncles));
        return Buffer.from((0, keccak_1.keccak256)((0, ethereumjs_util_1.arrToBufArr)(raw))).equals(this.header.uncleHash);
    }
    /**
     * Validates the withdrawal root
     */
    async validateWithdrawalsTrie() {
        if (!this._common.isActivatedEIP(4895)) {
            throw new Error('EIP 4895 is not activated');
        }
        const withdrawalsRoot = await Block.genWithdrawalsTrieRoot(this.withdrawals);
        return withdrawalsRoot.equals(this.header.withdrawalsRoot);
    }
    /**
     * Consistency checks for uncles included in the block, if any.
     *
     * Throws if invalid.
     *
     * The rules for uncles checked are the following:
     * Header has at most 2 uncles.
     * Header does not count an uncle twice.
     */
    validateUncles() {
        if (this.isGenesis()) {
            return;
        }
        // Header has at most 2 uncles
        if (this.uncleHeaders.length > 2) {
            const msg = this._errorMsg('too many uncle headers');
            throw new Error(msg);
        }
        // Header does not count an uncle twice.
        const uncleHashes = this.uncleHeaders.map((header) => header.hash().toString('hex'));
        if (!(new Set(uncleHashes).size === uncleHashes.length)) {
            const msg = this._errorMsg('duplicate uncles');
            throw new Error(msg);
        }
    }
    /**
     * Returns the canonical difficulty for this block.
     *
     * @param parentBlock - the parent of this `Block`
     */
    ethashCanonicalDifficulty(parentBlock) {
        return this.header.ethashCanonicalDifficulty(parentBlock.header);
    }
    /**
     * Validates if the block gasLimit remains in the boundaries set by the protocol.
     * Throws if invalid
     *
     * @param parentBlock - the parent of this `Block`
     */
    validateGasLimit(parentBlock) {
        return this.header.validateGasLimit(parentBlock.header);
    }
    /**
     * Returns the block in JSON format.
     */
    toJSON() {
        const withdrawalsAttr = this.withdrawals
            ? {
                withdrawals: this.withdrawals.map((wt) => wt.toJSON()),
            }
            : {};
        return {
            header: this.header.toJSON(),
            transactions: this.transactions.map((tx) => tx.toJSON()),
            uncleHeaders: this.uncleHeaders.map((uh) => uh.toJSON()),
            ...withdrawalsAttr,
        };
    }
    /**
     * Return a compact error string representation of the object
     */
    errorStr() {
        let hash = '';
        try {
            hash = (0, ethereumjs_util_1.bufferToHex)(this.hash());
        }
        catch (e) {
            hash = 'error';
        }
        let hf = '';
        try {
            hf = this._common.hardfork();
        }
        catch (e) {
            hf = 'error';
        }
        let errorStr = `block number=${this.header.number} hash=${hash} `;
        errorStr += `hf=${hf} baseFeePerGas=${this.header.baseFeePerGas ?? 'none'} `;
        errorStr += `txs=${this.transactions.length} uncles=${this.uncleHeaders.length}`;
        return errorStr;
    }
    /**
     * Internal helper function to create an annotated error message
     *
     * @param msg Base error message
     * @hidden
     */
    _errorMsg(msg) {
        return `${msg} (${this.errorStr()})`;
    }
}
exports.Block = Block;
_a = Block;
/**
 *  Method to retrieve a block from the provider and format as a {@link Block}
 * @param provider an Ethers JsonRPCProvider
 * @param blockTag block hash or block number to be run
 * @param opts {@link BlockOptions}
 * @returns the block specified by `blockTag`
 */
Block.fromEthersProvider = async (provider, blockTag, opts) => {
    let blockData;
    const prov = typeof provider === 'string' ? new ethers_1.ethers.providers.JsonRpcProvider(provider) : provider;
    if (typeof blockTag === 'string' && blockTag.length === 66) {
        blockData = await prov.send('eth_getBlockByHash', [blockTag, true]);
    }
    else if (typeof blockTag === 'bigint') {
        blockData = await prov.send('eth_getBlockByNumber', [(0, ethereumjs_util_1.bigIntToHex)(blockTag), true]);
    }
    else if ((0, ethereumjs_util_1.isHexPrefixed)(blockTag) ||
        blockTag === 'latest' ||
        blockTag === 'earliest' ||
        blockTag === 'pending') {
        blockData = await prov.send('eth_getBlockByNumber', [blockTag, true]);
    }
    else {
        throw new Error(`expected blockTag to be block hash, bigint, hex prefixed string, or earliest/latest/pending; got ${blockTag}`);
    }
    const uncleHeaders = [];
    if (blockData.uncles.length > 0) {
        for (let x = 0; x < blockData.uncles.length; x++) {
            const headerData = await prov.send('eth_getUncleByBlockHashAndIndex', [
                blockData.hash,
                (0, ethereumjs_util_1.intToHex)(x),
            ]);
            uncleHeaders.push(headerData);
        }
    }
    return (0, from_rpc_1.blockFromRpc)(blockData, uncleHeaders, opts);
};
//# sourceMappingURL=block.js.map