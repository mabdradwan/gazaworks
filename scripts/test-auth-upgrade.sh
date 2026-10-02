#!/usr/bin/env bash
set -euo pipefail
: "${TEST_DATABASE_URL:?Disposable CI database required}"
# Called by the guarded bootstrap after 0010, before applying the pending changes.
# One connection and one transaction preserve the baseline for the main suite.
{
 printf '%s\n' 'begin;'
 cat supabase/tests/auth-upgrade-before.sql
 cat supabase/migrations/0011_auth_security.sql
 cat supabase/migrations/20260916060000_atomic_workflows.sql
 cat supabase/migrations/20260916185305_transactional_email_outbox.sql
 cat supabase/tests/auth-upgrade-after.sql
 printf '%s\n' 'rollback;'
} | psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1
