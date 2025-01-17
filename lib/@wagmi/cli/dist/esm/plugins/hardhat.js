import { execa } from 'execa';
import { default as fs } from 'fs-extra';
import { globby } from 'globby';
import { basename, extname, join, resolve } from 'pathe';
import pc from 'picocolors';
import * as logger from '../logger.js';
import { getIsPackageInstalled, getPackageManager } from '../utils/packages.js';
const defaultExcludes = ['build-info/**', '*.dbg.json'];
/** Resolves ABIs from [Hardhat](https://github.com/NomicFoundation/hardhat) project. */
export function hardhat(config) {
    const { artifacts = 'artifacts', deployments = {}, exclude = defaultExcludes, commands = {}, include = ['*.json'], namePrefix = '', sources = 'contracts', } = config;
    function getContractName(artifact) {
        return `${namePrefix}${artifact.contractName}`;
    }
    async function getContract(artifactPath) {
        const artifact = await fs.readJSON(artifactPath);
        return {
            abi: artifact.abi,
            address: deployments[artifact.contractName],
            name: getContractName(artifact),
        };
    }
    async function getArtifactPaths(artifactsDirectory) {
        return await globby([
            ...include.map((x) => `${artifactsDirectory}/**/${x}`),
            ...exclude.map((x) => `!${artifactsDirectory}/**/${x}`),
        ]);
    }
    const project = resolve(process.cwd(), config.project);
    const artifactsDirectory = join(project, artifacts);
    const sourcesDirectory = join(project, sources);
    const { build = true, clean = false, rebuild = true } = commands;
    return {
        async contracts() {
            if (clean) {
                const packageManager = await getPackageManager(true);
                const [command, ...options] = (typeof clean === 'boolean' ? `${packageManager} hardhat clean` : clean).split(' ');
                await execa(command, options, { cwd: project });
            }
            if (build) {
                const packageManager = await getPackageManager(true);
                const [command, ...options] = (typeof build === 'boolean'
                    ? `${packageManager} hardhat compile`
                    : build).split(' ');
                await execa(command, options, { cwd: project });
            }
            if (!fs.pathExistsSync(artifactsDirectory))
                throw new Error('Artifacts not found.');
            const artifactPaths = await getArtifactPaths(artifactsDirectory);
            const contracts = [];
            for (const artifactPath of artifactPaths) {
                const contract = await getContract(artifactPath);
                if (!contract.abi?.length)
                    continue;
                contracts.push(contract);
            }
            return contracts;
        },
        name: 'Hardhat',
        async validate() {
            // Check that project directory exists
            if (!(await fs.pathExists(project)))
                throw new Error(`Hardhat project ${pc.gray(project)} not found.`);
            // Check that `hardhat` is installed
            const packageName = 'hardhat';
            const isPackageInstalled = await getIsPackageInstalled({
                packageName,
                cwd: project,
            });
            if (isPackageInstalled)
                return;
            throw new Error(`${packageName} must be installed to use Hardhat plugin.`);
        },
        watch: {
            command: rebuild
                ? async () => {
                    logger.log(`${pc.blue('Hardhat')} Watching project at ${pc.gray(project)}`);
                    const [command, ...options] = (typeof rebuild === 'boolean'
                        ? `${await getPackageManager(true)} hardhat compile`
                        : rebuild).split(' ');
                    const { watch } = await import('chokidar');
                    const watcher = watch(sourcesDirectory, {
                        atomic: true,
                        awaitWriteFinish: true,
                        ignoreInitial: true,
                        persistent: true,
                    });
                    watcher.on('all', async (event, path) => {
                        if (event !== 'change' && event !== 'add' && event !== 'unlink')
                            return;
                        logger.log(`${pc.blue('Hardhat')} Detected ${event} at ${basename(path)}`);
                        const subprocess = execa(command, options, {
                            cwd: project,
                        });
                        subprocess.stdout?.on('data', (data) => {
                            process.stdout.write(`${pc.blue('Hardhat')} ${data}`);
                        });
                    });
                    process.once('SIGINT', shutdown);
                    process.once('SIGTERM', shutdown);
                    async function shutdown() {
                        await watcher.close();
                    }
                }
                : undefined,
            paths: [
                artifactsDirectory,
                ...include.map((x) => `${artifactsDirectory}/**/${x}`),
                ...exclude.map((x) => `!${artifactsDirectory}/**/${x}`),
            ],
            async onAdd(path) {
                return getContract(path);
            },
            async onChange(path) {
                return getContract(path);
            },
            async onRemove(path) {
                const filename = basename(path);
                const extension = extname(path);
                // Since we can't use `getContractName`, guess from path
                const removedContractName = `${namePrefix}${filename.replace(extension, '')}`;
                const artifactPaths = await getArtifactPaths(artifactsDirectory);
                for (const artifactPath of artifactPaths) {
                    const contract = await getContract(artifactPath);
                    // If contract with same name exists, don't remove
                    if (contract.name === removedContractName)
                        return;
                }
                return removedContractName;
            },
        },
    };
}
//# sourceMappingURL=hardhat.js.map