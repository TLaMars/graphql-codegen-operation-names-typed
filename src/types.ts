import { OperationDefinitionNode, OperationTypeNode } from "graphql";

export type GroupedOperations = Record<
  OperationTypeNode,
  OperationDefinitionNode[]
>;

export type GroupedNamedOperationTypes = Record<
  OperationTypeNode,
  NamedOperationTypes
>;

export type NamedOperationTypes = Record<
  string,
  { result: string; variables: string }
>;

export type ExportStringType = {
  combined: string[];
  results: string[];
  variables: string[];
};
