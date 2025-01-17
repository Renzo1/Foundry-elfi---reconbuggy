import type { AbiEventParameter, AbiParameter } from '../abi.js';
import type { IsNarrowable, Join } from '../types.js';
import type { AssertName } from './types/signatures.js';
/**
 * Formats {@link AbiParameter} to human-readable ABI parameter.
 *
 * @param TAbiParameter - ABI parameter
 * @returns Human-readable ABI parameter
 *
 * @example
 * type Result = FormatAbiParameter<{ type: 'address'; name: 'from'; }>
 * //   ^? type Result = 'address from'
 */
export type FormatAbiParameter<TAbiParameter extends AbiParameter | AbiEventParameter> = TAbiParameter extends {
    name?: infer Name extends string;
    type: `tuple${infer Array}`;
    components: infer Components extends readonly AbiParameter[];
    indexed?: infer Indexed extends boolean;
} ? FormatAbiParameter<{
    type: `(${Join<{
        [K in keyof Components]: FormatAbiParameter<{
            type: Components[K]['type'];
        } & (IsNarrowable<Components[K]['name'], string> extends true ? {
            name: Components[K]['name'];
        } : unknown) & (Components[K] extends {
            components: readonly AbiParameter[];
        } ? {
            components: Components[K]['components'];
        } : unknown)>;
    }, ', '>})${Array}`;
} & (IsNarrowable<Name, string> extends true ? {
    name: Name;
} : unknown) & (IsNarrowable<Indexed, boolean> extends true ? {
    indexed: Indexed;
} : unknown)> : `${TAbiParameter['type']}${TAbiParameter extends {
    indexed: true;
} ? ' indexed' : ''}${TAbiParameter['name'] extends infer Name extends string ? Name extends '' ? '' : ` ${AssertName<Name>}` : ''}`;
/**
 * Formats {@link AbiParameter} to human-readable ABI parameter.
 *
 * @param abiParameter - ABI parameter
 * @returns Human-readable ABI parameter
 *
 * @example
 * const result = formatAbiParameter({ type: 'address', name: 'from' })
 * //    ^? const result: 'address from'
 */
export declare function formatAbiParameter<const TAbiParameter extends AbiParameter | AbiEventParameter>(abiParameter: TAbiParameter): FormatAbiParameter<TAbiParameter>;
//# sourceMappingURL=formatAbiParameter.d.ts.map