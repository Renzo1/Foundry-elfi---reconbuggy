#!/usr/bin/env node
import { cac } from 'cac';
import { generate } from './commands/generate.js';
import { init } from './commands/init.js';
import * as logger from './logger.js';
import { version } from './version.js';
const cli = cac('wagmi');
cli
    .command('generate', 'generate code based on configuration')
    .option('-c, --config <path>', '[string] path to config file')
    .option('-r, --root <path>', '[string] root path to resolve config from')
    .option('-w, --watch', '[boolean] watch for changes')
    .example((name) => `${name} generate`)
    .action(async (options) => await generate(options));
cli
    .command('init', 'create configuration file')
    .option('-c, --config <path>', '[string] path to config file')
    .option('-r, --root <path>', '[string] root path to resolve config from')
    .example((name) => `${name} init`)
    .action(async (options) => await init(options));
cli.help();
cli.version(version);
void (async () => {
    try {
        // Parse CLI args without running command
        cli.parse(process.argv, { run: false });
        if (!cli.matchedCommand) {
            if (cli.args.length === 0) {
                if (!cli.options.help && !cli.options.version)
                    cli.outputHelp();
            }
            else
                throw new Error(`Unknown command: ${cli.args.join(' ')}`);
        }
        await cli.runMatchedCommand();
    }
    catch (error) {
        logger.error(`\n${error.message}`);
        process.exit(1);
    }
})();
//# sourceMappingURL=cli.js.map