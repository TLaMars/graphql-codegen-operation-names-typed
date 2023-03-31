"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperCase = exports.getOperationTypes = void 0;
function getOperationTypes(node) {
    var _a, _b;
    var operationType = upperCase(node.operation);
    var operationName = upperCase((_b = (_a = node.name) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "");
    var operation = operationName + operationType;
    return {
        result: operation,
        variables: operation + "Variables",
    };
}
exports.getOperationTypes = getOperationTypes;
function upperCase(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
exports.upperCase = upperCase;
