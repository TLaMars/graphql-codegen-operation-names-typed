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

## Usage example
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