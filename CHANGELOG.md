# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Critical fixes

- Secured `agents` and `mcp` APIs behind JWT auth to remove unauthenticated execution paths.
- Fixed template persistence consistency by standardizing `is_template` handling and wiring frontend template APIs to `/api/templates`.
- Repaired conversation/message route schema mismatches (`sender`, `content_type`, `parent_id`) and removed writes to non-existent counters.
- Fixed task stats endpoint to compute counts from actual `conversations` and `messages` tables.
- Added workflow node type normalization (`ai-platform`/legacy aliases -> executor node types) to prevent builder/runtime incompatibility.
- Aligned DB bootstrap with runtime needs by adding task metadata/template columns in `init.sql` and a new SQL migration.
- Implemented missing `db:migrate` and `db:seed` scripts (`migrate.ts`, `seed.ts`) so setup commands now work.
