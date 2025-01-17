export declare function getIsPackageInstalled(parameters: {
    packageName: string;
    cwd?: string;
}): Promise<boolean>;
export declare function getPackageManager(executable?: boolean | undefined): Promise<"npx" | PackageManager>;
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export {};
//# sourceMappingURL=packages.d.ts.map