# Read-only public GraphQL API

Context: The application exposes an Apollo Sandbox interface deployed on a publicly accessible host to showcase specialist experience and skills.
Decision: Restrict the public GraphQL API to Queries only, omitting Mutations for creating or altering records.
Why: The digital business card is an immutable portfolio whose data is pre-seeded on startup; exposing unauthenticated mutations on a public Apollo Sandbox would compromise data integrity and present a security risk.
