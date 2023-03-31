"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var utils_1 = require("./utils");
var plugin = function (_, documents, __, ___) {
    var allAst = (0, graphql_1.concatAST)(documents.map(function (v) { return v.document; }));
    var operations = allAst.definitions.filter(function (v) { return v.kind === graphql_1.Kind.OPERATION_DEFINITION; });
    var splitOperations = operations.reduce(function (acc, o) {
        var newAcc = __assign({}, acc);
        switch (o.operation) {
            case graphql_1.OperationTypeNode.QUERY:
                newAcc.query.push(o);
                break;
            case graphql_1.OperationTypeNode.MUTATION:
                newAcc.mutation.push(o);
                break;
            case graphql_1.OperationTypeNode.SUBSCRIPTION:
                newAcc.subscription.push(o);
                break;
        }
        return newAcc;
    }, { query: [], mutation: [], subscription: [] });
    var groupedTypeNames = Object.keys(splitOperations).reduce(function (acc, o) {
        var newAcc = __assign({}, acc);
        var operationArray = splitOperations[o];
        newAcc[o] =
            operationArray.reduce(function (acc, operation) {
                var _a;
                var newAcc = __assign({}, acc);
                var name = (_a = operation.name) === null || _a === void 0 ? void 0 : _a.value;
                if (!name) {
                    return newAcc;
                }
                newAcc[name] = (0, utils_1.getOperationTypes)(operation);
                return newAcc;
            }, {});
        return newAcc;
    }, { query: {}, mutation: {}, subscription: {} });
    var types = Object.keys(groupedTypeNames).map(function (key) {
        var typeNames = groupedTypeNames[key];
        var type = (0, utils_1.upperCase)(key);
        var strings = Object.keys(typeNames).reduce(function (acc, name) {
            var typeName = typeNames[name];
            var combinedType = " ".concat(name, ": { result: ").concat(typeName.result, "; variables: ").concat(typeName.variables, " }; ");
            var resultType = " ".concat(name, ": ").concat(typeName.result, "; ");
            var variablesType = " ".concat(name, ": ").concat(typeName.variables, "; ");
            var newAcc = {
                combined: __spreadArray(__spreadArray([], acc.combined, true), [combinedType], false),
                results: __spreadArray(__spreadArray([], acc.results, true), [resultType], false),
                variables: __spreadArray(__spreadArray([], acc.variables, true), [variablesType], false),
            };
            return newAcc;
        }, { combined: [], results: [], variables: [] });
        return "export type ".concat(type, "NamesTyped = {").concat(strings.combined.join("\n\n"), "}; \n\n      export type ").concat(type, "ResultNamesTyped = {").concat(strings.results.join("\n\n"), "}; \n\n      export type ").concat(type, "VariablesNamesTyped = {").concat(strings.variables.join("\n\n"), "}\n    ");
    });
    return types.filter(function (r) { return r; }).join("\n\n");
};
module.exports = {
    plugin: plugin,
};
