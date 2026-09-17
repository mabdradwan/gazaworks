#!/usr/bin/env bash
set -euo pipefail
: "${TEST_DATABASE_URL:?Set TEST_DATABASE_URL to an empty disposable PostgreSQL database}"
if [ "$(psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -Atc "select exists(select 1 from pg_tables where schemaname in ('public','auth','storage'))")" != "f" ]; then
  echo "Refusing to bootstrap a non-empty database. Use a disposable test database." >&2
  exit 1
fi
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bootstrap.sql
for migration in supabase/migrations/*.sql; do
  if [ "$(basename "$migration")" = "0011_auth_security.sql" ]; then
    bash scripts/test-auth-upgrade.sh
  fi
  psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/workflows.sql
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/appointments.sql
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/email.sql
GAZAWORKS_TEST_HARNESS=1 python3 scripts/test-appointment-race.py
GAZAWORKS_TEST_HARNESS=1 python3 scripts/test-email-race.py
