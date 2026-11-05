# SQLite as embedded database engine

Context: The portfolio API requires a persistent database managed via Prisma with automated initialization, migrations, and zero-config startup from scratch.
Decision: Use SQLite as the database engine instead of a separate client-server RDBMS like PostgreSQL.
Why: SQLite eliminates external infrastructure dependencies, requires no multi-container networking or healthcheck waits in Docker, and ensures instant, fail-proof startup for code reviewers while Prisma keeps queries type-safe and portable.
