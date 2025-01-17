"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.valuesArrayToHeaderData = exports.getDifficulty = exports.getDataGasPrice = exports.calcExcessDataGas = exports.calcDataFee = exports.BlockHeader = exports.Block = void 0;
var block_1 = require("./block");
Object.defineProperty(exports, "Block", { enumerable: true, get: function () { return block_1.Block; } });
var header_1 = require("./header");
Object.defineProperty(exports, "BlockHeader", { enumerable: true, get: function () { return header_1.BlockHeader; } });
var helpers_1 = require("./helpers");
Object.defineProperty(exports, "calcDataFee", { enumerable: true, get: function () { return helpers_1.calcDataFee; } });
Object.defineProperty(exports, "calcExcessDataGas", { enumerable: true, get: function () { return helpers_1.calcExcessDataGas; } });
Object.defineProperty(exports, "getDataGasPrice", { enumerable: true, get: function () { return helpers_1.getDataGasPrice; } });
Object.defineProperty(exports, "getDifficulty", { enumerable: true, get: function () { return helpers_1.getDifficulty; } });
Object.defineProperty(exports, "valuesArrayToHeaderData", { enumerable: true, get: function () { return helpers_1.valuesArrayToHeaderData; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map