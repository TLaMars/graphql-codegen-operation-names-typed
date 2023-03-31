import type {
  CodegenPlugin,
  PluginFunction,
} from "@graphql-codegen/plugin-helpers";
import {
  concatAST,
  DocumentNode,
  Kind,
  OperationDefinitionNode,
  OperationTypeNode,
} from "graphql";

function getOperationTypes(node: OperationDefinitionNode): {
  result: string;
  variables: string;
} {
  const operationType = upperCase(node.operation);
  const operationName = upperCase(node.name?.value ?? "");

  const operation = operationName + operationType;

  return {
    result: operation,
    variables: operation + "Variables",
  };
}

function upperCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const plugin: PluginFunction = (_, documents, __, ___) => {
  const allAst = concatAST(documents.map((v) => v.document));

  const operations = allAst.definitions.filter(
    (v) => v.kind === Kind.OPERATION_DEFINITION
  ) as OperationDefinitionNode[];

  const splitOperations = operations.reduce<
    Record<OperationTypeNode, OperationDefinitionNode[]>
  >(
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

  const groupedTypeNames = Object.keys(splitOperations).reduce<
    Record<
      OperationTypeNode,
      Record<string, { result: string; variables: string }>
    >
  >(
    (acc, o) => {
      const newAcc = { ...acc };

      const operationArray = splitOperations[o as OperationTypeNode];
      newAcc[o as OperationTypeNode] = operationArray.reduce<
        Record<string, { result: string; variables: string }>
      >((acc, operation) => {
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

  type MultiType = {
    combined: string[];
    results: string[];
    variables: string[];
  };

  const types = Object.keys(groupedTypeNames).map((key) => {
    const typeNames = groupedTypeNames[key as OperationTypeNode];
    const type = upperCase(key);

    const strings = Object.keys(typeNames).reduce<MultiType>(
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
