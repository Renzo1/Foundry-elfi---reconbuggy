"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAbiParameters = void 0;
const formatAbiParameter_js_1 = require("./formatAbiParameter.js");
function formatAbiParameters(abiParameters) {
    let params = '';
    const length = abiParameters.length;
    for (let i = 0; i < length; i++) {
        const abiParameter = abiParameters[i];
        params += (0, formatAbiParameter_js_1.formatAbiParameter)(abiParameter);
        if (i !== length - 1)
            params += ', ';
    }
    return params;
}
exports.formatAbiParameters = formatAbiParameters;
//# sourceMappingURL=formatAbiParameters.js.map