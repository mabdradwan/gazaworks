#!/usr/bin/env bash
set -euo pipefail
: "${TEST_DATABASE_URL:?Set TEST_DATABASE_URL to an empty disposable PostgreSQL database}"
if [ "$(psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -Atc "select exists(select 1 from pg_tables where schemaname in ('public','auth','storage'))")" != "f" ]; then
  echo "Refusing to bootstrap a non-empty database. Use a disposable test database." >&2
  exit 1
fi
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bootstrap.sql
for migration in supabase/migrations/*.sql; do
  psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/workflows.sql
