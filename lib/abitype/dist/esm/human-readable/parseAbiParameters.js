import { InvalidAbiParametersError } from '../index.js';
import { isStructSignature, modifiers } from './runtime/signatures.js';
import { parseStructs } from './runtime/structs.js';
import { splitParameters } from './runtime/utils.js';
import { parseAbiParameter as parseAbiParameter_ } from './runtime/utils.js';
export function parseAbiParameters(params) {
    const abiParameters = [];
    if (typeof params === 'string') {
        const parameters = splitParameters(params);
        const length = parameters.length;
        for (let i = 0; i < length; i++) {
            abiParameters.push(parseAbiParameter_(parameters[i], { modifiers }));
        }
    }
    else {
        const structs = parseStructs(params);
        const length = params.length;
        for (let i = 0; i < length; i++) {
            const signature = params[i];
            if (isStructSignature(signature))
                continue;
            const parameters = splitParameters(signature);
            const length = parameters.length;
            for (let k = 0; k < length; k++) {
                abiParameters.push(parseAbiParameter_(parameters[k], { modifiers, structs }));
            }
        }
    }
    if (abiParameters.length === 0)
        throw new InvalidAbiParametersError({ params });
    return abiParameters;
}
//# sourceMappingURL=parseAbiParameters.js.map