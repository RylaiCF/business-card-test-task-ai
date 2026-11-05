# Request-scoped DataLoaders via Apollo Context

Context: DataLoaders cache results during query execution and must be isolated per incoming HTTP request to avoid cross-request data leaks.
Decision: Instantiate DataLoaders inside the Apollo driver context factory and inject them via GraphQL Context rather than using NestJS `Scope.REQUEST` injectable providers.
Why: NestJS `Scope.REQUEST` incurs significant performance penalties by forcing DI subtrees to be reconstructed per request, whereas context-based DataLoader instantiation is lightweight, canonical in Apollo Server, and cleanly isolates caching per execution lifecycle.
