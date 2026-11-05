# DataLoader for nested GraphQL relations

Context: The GraphQL schema exposes nested relations (`skills`, `experience`, `projects`) under the root `profile` query. Naive field resolvers trigger the N+1 query problem, while AST projection tightly couples the root resolver to ORM query shapes.
Decision: Resolve nested relations using DataLoader batching inside field resolvers instead of AST-based eager loading.
Why: Preserves modularity and domain separation across NestJS modules, adheres to canonical GraphQL architecture, and batches parent ID lookups into single SQL `IN` queries per request context.
