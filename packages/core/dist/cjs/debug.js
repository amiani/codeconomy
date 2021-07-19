"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorType = exports.assert = void 0;
function assert(expression, message = "", type) {
    if (!expression) {
        throw new Error(type !== undefined
            ? `${errorMessagePrefixes[type]}: ${message}`
            : message);
    }
}
exports.assert = assert;
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["Internal"] = 0] = "Internal";
    ErrorType[ErrorType["Query"] = 1] = "Query";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
const errorMessagePrefixes = {
    [ErrorType.Internal]: "Internal Error",
    [ErrorType.Query]: "Query Error",
};
//# sourceMappingURL=debug.js.map