import { OperationDefinitionNode } from "graphql";

export function getOperationTypes(node: OperationDefinitionNode): {
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

export function upperCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
