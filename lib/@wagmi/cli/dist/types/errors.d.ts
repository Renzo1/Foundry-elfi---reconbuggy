import { type z } from 'zod';
declare class ValidationError extends Error {
    details: Zod.ZodIssue[];
    constructor(message: string, options: {
        details: Zod.ZodIssue[];
    });
}
export declare function fromZodError(zError: z.ZodError, { maxIssuesInMessage, issueSeparator, prefixSeparator, prefix, }?: {
    maxIssuesInMessage?: number;
    issueSeparator?: string;
    prefixSeparator?: string;
    prefix?: string;
}): ValidationError;
export {};
//# sourceMappingURL=errors.d.ts.map