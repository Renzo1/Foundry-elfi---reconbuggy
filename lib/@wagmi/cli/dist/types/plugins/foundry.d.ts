import type { ContractConfig, Plugin } from '../config.js';
import type { Evaluate, RequiredBy } from '../types.js';
export type FoundryConfig = {
    /**
     * Project's artifacts directory.
     *
     * Same as your project's `--out` (`-o`) option.
     *
     * @default foundry.config#out | 'out'
     */
    artifacts?: string | undefined;
    /** Mapping of addresses to attach to artifacts. */
    deployments?: {
        [key: string]: ContractConfig['address'];
    } | undefined;
    /** Artifact files to exclude. */
    exclude?: string[] | undefined;
    /** [Forge](https://book.getfoundry.sh/forge) configuration */
    forge?: {
        /**
         * Remove build artifacts and cache directories on start up.
         *
         * @default false
         */
        clean?: boolean | undefined;
        /**
         * Build Foundry project before fetching artifacts.
         *
         * @default true
         */
        build?: boolean | undefined;
        /**
         * Path to `forge` executable command
         *
         * @default "forge"
         */
        path?: string | undefined;
        /**
         * Rebuild every time a watched file or directory is changed.
         *
         * @default true
         */
        rebuild?: boolean | undefined;
    } | undefined;
    /** Artifact files to include. */
    include?: string[] | undefined;
    /** Optional prefix to prepend to artifact names. */
    namePrefix?: string | undefined;
    /** Path to foundry project. */
    project?: string | undefined;
};
type FoundryResult = Evaluate<RequiredBy<Plugin, 'contracts' | 'validate' | 'watch'>>;
/** Resolves ABIs from [Foundry](https://github.com/foundry-rs/foundry) project. */
export declare function foundry(config?: FoundryConfig): FoundryResult;
export {};
//# sourceMappingURL=foundry.d.ts.map