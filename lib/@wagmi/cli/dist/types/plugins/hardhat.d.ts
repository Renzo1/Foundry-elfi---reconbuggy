import type { ContractConfig, Plugin } from '../config.js';
import type { Evaluate, RequiredBy } from '../types.js';
export type HardhatConfig = {
    /**
     * Project's artifacts directory.
     *
     * Same as your project's `artifacts` [path configuration](https://hardhat.org/hardhat-runner/docs/config#path-configuration) option.
     *
     * @default 'artifacts/'
     */
    artifacts?: string | undefined;
    /** Mapping of addresses to attach to artifacts. */
    deployments?: {
        [key: string]: ContractConfig['address'];
    } | undefined;
    /** Artifact files to exclude. */
    exclude?: string[] | undefined;
    /** Commands to run */
    commands?: {
        /**
         * Remove build artifacts and cache directories on start up.
         *
         * @default `${packageManger} hardhat clean`
         */
        clean?: string | boolean | undefined;
        /**
         * Build Hardhat project before fetching artifacts.
         *
         * @default `${packageManger} hardhat compile`
         */
        build?: string | boolean | undefined;
        /**
         * Command to run when watched file or directory is changed.
         *
         * @default `${packageManger} hardhat compile`
         */
        rebuild?: string | boolean | undefined;
    } | undefined;
    /** Artifact files to include. */
    include?: string[] | undefined;
    /** Optional prefix to prepend to artifact names. */
    namePrefix?: string | undefined;
    /** Path to Hardhat project. */
    project: string;
    /**
     * Project's artifacts directory.
     *
     * Same as your project's `sources` [path configuration](https://hardhat.org/hardhat-runner/docs/config#path-configuration) option.
     *
     * @default 'contracts/'
     */
    sources?: string | undefined;
};
type HardhatResult = Evaluate<RequiredBy<Plugin, 'contracts' | 'validate' | 'watch'>>;
/** Resolves ABIs from [Hardhat](https://github.com/NomicFoundation/hardhat) project. */
export declare function hardhat(config: HardhatConfig): HardhatResult;
export {};
//# sourceMappingURL=hardhat.d.ts.map