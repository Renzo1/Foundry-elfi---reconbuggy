import { pascalCase } from 'change-case';
import {} from '../config.js';
import {} from '../types.js';
import { getAddressDocString } from '../utils/getAddressDocString.js';
export function react(config = {}) {
    return {
        name: 'React',
        async run({ contracts }) {
            const imports = new Set([]);
            const content = [];
            const pure = '/*#__PURE__*/';
            const hookNames = new Set();
            for (const contract of contracts) {
                let hasReadFunction = false;
                let hasWriteFunction = false;
                let hasEvent = false;
                const readItems = [];
                const writeItems = [];
                const eventItems = [];
                for (const item of contract.abi) {
                    if (item.type === 'function')
                        if (item.stateMutability === 'view' ||
                            item.stateMutability === 'pure') {
                            hasReadFunction = true;
                            readItems.push(item);
                        }
                        else {
                            hasWriteFunction = true;
                            writeItems.push(item);
                        }
                    else if (item.type === 'event') {
                        hasEvent = true;
                        eventItems.push(item);
                    }
                }
                let innerContent;
                if (contract.meta.addressName)
                    innerContent = `abi: ${contract.meta.abiName}, address: ${contract.meta.addressName}`;
                else
                    innerContent = `abi: ${contract.meta.abiName}`;
                if (hasReadFunction) {
                    const hookName = getHookName(config, hookNames, 'read', contract.name);
                    const docString = genDocString('useReadContract', contract);
                    const functionName = 'createUseReadContract';
                    imports.add(functionName);
                    content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent} })`);
                    const names = new Set();
                    for (const item of readItems) {
                        if (item.type !== 'function')
                            continue;
                        if (item.stateMutability !== 'pure' &&
                            item.stateMutability !== 'view')
                            continue;
                        // Skip overrides since they are captured by same hook
                        if (names.has(item.name))
                            continue;
                        names.add(item.name);
                        const hookName = getHookName(config, hookNames, 'read', contract.name, item.name);
                        const docString = genDocString('useReadContract', contract, {
                            name: 'functionName',
                            value: item.name,
                        });
                        content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent}, functionName: '${item.name}' })`);
                    }
                }
                if (hasWriteFunction) {
                    {
                        const hookName = getHookName(config, hookNames, 'write', contract.name);
                        const docString = genDocString('useWriteContract', contract);
                        const functionName = 'createUseWriteContract';
                        imports.add(functionName);
                        content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent} })`);
                        const names = new Set();
                        for (const item of writeItems) {
                            if (item.type !== 'function')
                                continue;
                            if (item.stateMutability !== 'nonpayable' &&
                                item.stateMutability !== 'payable')
                                continue;
                            // Skip overrides since they are captured by same hook
                            if (names.has(item.name))
                                continue;
                            names.add(item.name);
                            const hookName = getHookName(config, hookNames, 'write', contract.name, item.name);
                            const docString = genDocString('useWriteContract', contract, {
                                name: 'functionName',
                                value: item.name,
                            });
                            content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent}, functionName: '${item.name}' })`);
                        }
                    }
                    {
                        const hookName = getHookName(config, hookNames, 'simulate', contract.name);
                        const docString = genDocString('useSimulateContract', contract);
                        const functionName = 'createUseSimulateContract';
                        imports.add(functionName);
                        content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent} })`);
                        const names = new Set();
                        for (const item of writeItems) {
                            if (item.type !== 'function')
                                continue;
                            if (item.stateMutability !== 'nonpayable' &&
                                item.stateMutability !== 'payable')
                                continue;
                            // Skip overrides since they are captured by same hook
                            if (names.has(item.name))
                                continue;
                            names.add(item.name);
                            const hookName = getHookName(config, hookNames, 'simulate', contract.name, item.name);
                            const docString = genDocString('useSimulateContract', contract, {
                                name: 'functionName',
                                value: item.name,
                            });
                            content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent}, functionName: '${item.name}' })`);
                        }
                    }
                }
                if (hasEvent) {
                    const hookName = getHookName(config, hookNames, 'watch', contract.name);
                    const docString = genDocString('useWatchContractEvent', contract);
                    const functionName = 'createUseWatchContractEvent';
                    imports.add(functionName);
                    content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent} })`);
                    const names = new Set();
                    for (const item of eventItems) {
                        if (item.type !== 'event')
                            continue;
                        // Skip overrides since they are captured by same hook
                        if (names.has(item.name))
                            continue;
                        names.add(item.name);
                        const hookName = getHookName(config, hookNames, 'watch', contract.name, item.name);
                        const docString = genDocString('useWatchContractEvent', contract, {
                            name: 'eventName',
                            value: item.name,
                        });
                        content.push(`${docString}
export const ${hookName} = ${pure} ${functionName}({ ${innerContent}, eventName: '${item.name}' })`);
                    }
                }
            }
            const importValues = [...imports.values()];
            return {
                imports: importValues.length
                    ? `import { ${importValues.join(', ')} } from 'wagmi/codegen'\n`
                    : '',
                content: content.join('\n\n'),
            };
        },
    };
}
function genDocString(hookName, contract, item) {
    let description = `Wraps __{@link ${hookName}}__ with \`abi\` set to __{@link ${contract.meta.abiName}}__`;
    if (item)
        description += ` and \`${item.name}\` set to \`"${item.value}"\``;
    const docString = getAddressDocString({ address: contract.address });
    if (docString)
        return `/**
 * ${description}
 * 
 ${docString}
 */`;
    return `/**
 * ${description}
 */`;
}
function getHookName(config, hookNames, type, contractName, itemName) {
    const ContractName = pascalCase(contractName);
    const ItemName = itemName ? pascalCase(itemName) : undefined;
    let hookName;
    if (typeof config.getHookName === 'function')
        hookName = config.getHookName({
            type,
            contractName: ContractName,
            itemName: ItemName,
        });
    else if (typeof config.getHookName === 'string') {
        switch (type) {
            case 'read':
                hookName = `use${ContractName}${ItemName ?? 'Read'}`;
                break;
            case 'simulate':
                hookName = `usePrepare${ContractName}${ItemName ?? 'Write'}`;
                break;
            case 'watch':
                hookName = `use${ContractName}${ItemName ?? ''}Event`;
                break;
            case 'write':
                hookName = `use${ContractName}${ItemName ?? 'Write'}`;
                break;
        }
    }
    else {
        hookName = `use${pascalCase(type)}${ContractName}${ItemName ?? ''}`;
        if (type === 'watch')
            hookName = `${hookName}Event`;
    }
    if (hookNames.has(hookName))
        throw new Error(`Hook name "${hookName}" must be unique for contract "${contractName}". Try using \`getHookName\` to create a unique name.`);
    hookNames.add(hookName);
    return hookName;
}
//# sourceMappingURL=react.js.map