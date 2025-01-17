import {} from 'zod';
class ValidationError extends Error {
    constructor(message, options) {
        super(message);
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.details = options.details;
    }
}
// From https://github.com/causaly/zod-validation-error
export function fromZodError(zError, { maxIssuesInMessage = 99, issueSeparator = '\n- ', prefixSeparator = '\n- ', prefix = 'Validation Error', } = {}) {
    function joinPath(arr) {
        return arr.reduce((acc, value) => {
            if (typeof value === 'number')
                return `${acc}[${value}]`;
            const separator = acc === '' ? '' : '.';
            return acc + separator + value;
        }, '');
    }
    const reason = zError.errors
        // limit max number of issues printed in the reason section
        .slice(0, maxIssuesInMessage)
        // format error message
        .map((issue) => {
        const { message, path } = issue;
        if (path.length > 0)
            return `${message} at \`${joinPath(path)}\``;
        return message;
    })
        // concat as string
        .join(issueSeparator);
    const message = reason ? [prefix, reason].join(prefixSeparator) : prefix;
    return new ValidationError(message, {
        details: zError.errors,
    });
}
//# sourceMappingURL=errors.js.map