export function assert(expression, message = "", type) {
    if (!expression) {
        throw new Error(type !== undefined
            ? `${errorMessagePrefixes[type]}: ${message}`
            : message);
    }
}
export var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["Internal"] = 0] = "Internal";
    ErrorType[ErrorType["Query"] = 1] = "Query";
})(ErrorType || (ErrorType = {}));
const errorMessagePrefixes = {
    [ErrorType.Internal]: "Internal Error",
    [ErrorType.Query]: "Query Error",
};
//# sourceMappingURL=debug.js.map