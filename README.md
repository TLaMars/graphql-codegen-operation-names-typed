# GraphQL Codegen Operation Names Typed
[GraphQL Code Generator](https://www.graphql-code-generator.com) allows you to generate types for your GraphQL operations. These are al separate types. To create a typed query you need to make your query typed. This plugin makes types which contains the operation name and points to the correct result or variables type.

## Motivation
During a custom project I encountert in Svelte that I needed to make a own type which contains the operation name and points to the operation result and variables. This made me wonder if I couldn't build a plugin for it, which I did.

## Installation
Make sure that your project contains all needed dependencies for this plugin

```bash
npm i graphql
npm i -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations graphql-codegen-operation-names-typed
```

## Example config
```typescript
import type { CodegenConfig } from '@graphql-codegen/cli'
 
const config: CodegenConfig = {
  schema: 'YOUR_SCHEMA',
  documents: 'YOUR_OPERATIONS',
  generates: {
    './types.ts': {
      plugins: ['typescript', 'typescript-operations', 'graphql-codegen-operation-names-typed']
    }
  }
}
export default config
```

## Usage example
Lets say we have a hello query that looks as follows
```gql
query hello {
  hello
}
```

This will output the types listed below.

```typescript
export type QueryResultNamesTyped = { 
  hello: HelloQuery 
};
export type QueryVariablesNamesTyped = { 
  hello: HelloQueryVariables 
};
```

### svelte-apollo
Before you are able to make use the example below make sure you have [@apollo/client](https://www.npmjs.com/package/@apollo/client) and [svelte-apollo](https://github.com/timhall/svelte-apollo) installed and setup according to the documentation.

#### Typed query example
```typescript
import { query as svelteApolloQuery } from "svelte-apollo";
import type { DocumentNode } from "graphql";
import type {
  QueryResultNamesTyped,
  QueryVariablesNamesTyped,
} from "gql/generated/graphql";

const query = <N extends keyof QueryResultNamesTyped>(
  documentNode: DocumentNode,
  variables?: QueryVariablesNamesTyped[N]
) =>
  svelteApolloQuery<QueryResultNamesTyped[N], QueryVariablesNamesTyped[N]>(
    documentNode,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    }
  );

export default query;
```

##### Usage example
```svelte
<script lang="ts">
const result = query<"hello">(helloQuery);
</script>

<h1>{$result.data?.hello}</h1>
```

#### Typed mutation example
```typescript
import { mutation as svelteApolloMutation } from "svelte-apollo";
import type { DocumentNode } from "graphql";

import type {
  MutationResultNamesTyped,
  MutationVariablesNamesTyped,
} from "@shared/generated/graphql";

const mutation = <N extends keyof MutationResultNamesTyped>(
  documentNode: DocumentNode,
) =>
  svelteApolloMutation<
    MutationResultNamesTyped[N],
    MutationVariablesNamesTyped[N]
  >(documentNode);

export default mutation;
```