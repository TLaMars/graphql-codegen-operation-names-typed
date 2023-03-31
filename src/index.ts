import type {
  CodegenPlugin,
  PluginFunction,
} from "@graphql-codegen/plugin-helpers";
import {
  concatAST,
  Kind,
  OperationDefinitionNode,
  OperationTypeNode,
} from "graphql";
import {
  ExportStringType,
  GroupedNamedOperationTypes,
  GroupedOperations,
  NamedOperationTypes,
} from "./types";
import { getOperationTypes, upperCase } from "./utils";

const plugin: PluginFunction = (_, documents, __, ___) => {
  const allAst = concatAST(documents.map((v) => v.document));

  const operations = allAst.definitions.filter(
    (v) => v.kind === Kind.OPERATION_DEFINITION
  ) as OperationDefinitionNode[];

  const splitOperations = operations.reduce<GroupedOperations>(
    (acc, o) => {
      const newAcc = { ...acc } as Record<
        OperationTypeNode,
        OperationDefinitionNode[]
      >;
      switch (o.operation) {
        case OperationTypeNode.QUERY:
          newAcc.query.push(o);
          break;
        case OperationTypeNode.MUTATION:
          newAcc.mutation.push(o);
          break;
        case OperationTypeNode.SUBSCRIPTION:
          newAcc.subscription.push(o);
          break;
      }
      return newAcc;
    },
    { query: [], mutation: [], subscription: [] }
  );

  const groupedTypeNames = Object.keys(
    splitOperations
  ).reduce<GroupedNamedOperationTypes>(
    (acc, o) => {
      const newAcc = { ...acc };

      const operationArray = splitOperations[o as OperationTypeNode];
      newAcc[o as OperationTypeNode] =
        operationArray.reduce<NamedOperationTypes>((acc, operation) => {
          const newAcc = { ...acc };
          const name = operation.name?.value;

          if (!name) {
            return newAcc;
          }

          newAcc[name] = getOperationTypes(operation);

          return newAcc;
        }, {});

      return newAcc;
    },
    { query: {}, mutation: {}, subscription: {} }
  );

  const types = Object.keys(groupedTypeNames).map((key) => {
    const typeNames = groupedTypeNames[key as OperationTypeNode];
    const type = upperCase(key);

    const strings = Object.keys(typeNames).reduce<ExportStringType>(
      (acc, name) => {
        const typeName = typeNames[name];
        const combinedType = ` ${name}: { result: ${typeName.result}; variables: ${typeName.variables} }; `;
        const resultType = ` ${name}: ${typeName.result}; `;
        const variablesType = ` ${name}: ${typeName.variables}; `;

        const newAcc = {
          combined: [...acc.combined, combinedType],
          results: [...acc.results, resultType],
          variables: [...acc.variables, variablesType],
        };

        return newAcc;
      },
      { combined: [], results: [], variables: [] }
    );

    return `export type ${type}NamesTyped = {${strings.combined.join(
      `\n\n`
    )}}; \n
      export type ${type}ResultNamesTyped = {${strings.results.join(
      `\n\n`
    )}}; \n
      export type ${type}VariablesNamesTyped = {${strings.variables.join(
      `\n\n`
    )}}
    `;
  });

  return types.filter((r) => r).join("\n\n");
};

module.exports = {
  plugin,
} as CodegenPlugin;
