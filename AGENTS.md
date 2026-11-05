# Project Guidelines

## Agent skills

### Issue tracker

Local markdown in `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`GLOSSARY.md` and `docs/adr/` at repo root). See `docs/agents/domain.md`.

## Dependency and Environment Pinning

- Always pin exact versions for all dependencies in `package.json` (do NOT use `^`, `~`, or floating ranges).
- In `Dockerfile`:
  - Pin exact versions for base images (e.g. `node:22.14.0-bookworm-slim`, not `:latest` or floating tags).
  - Do NOT pin OS-level package versions in package managers (`apt-get`, `apk`) to ephemeral patch revisions (e.g. use `apt-get install -y openssl`, not `openssl=3.0.15-1~deb12u1`), as upstream distro security updates obsolete older point releases and break builds.

