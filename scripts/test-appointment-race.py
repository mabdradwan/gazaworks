"""Exercise simultaneous bookings against the disposable database harness."""
import concurrent.futures
import os
import subprocess


def query(sql: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["psql", os.environ["TEST_DATABASE_URL"], "-v", "ON_ERROR_STOP=1", "-Atq"],
        input=sql, text=True, capture_output=True, check=False,
    )


if os.environ.get("GAZAWORKS_TEST_HARNESS") != "1":
    raise SystemExit("Run through scripts/test-database.sh on a disposable database.")

admin = "77777777-7777-4777-8777-777777777777"
setup = query(f"""
do $$begin
 if exists(select 1 from public.profiles) then raise exception 'test_database_must_have_no_users'; end if;
end$$;
insert into auth.users(id,email,raw_user_meta_data) values
 ('{admin}','concurrent-staff@test.invalid','{{"account_type":"client","display_name":"Synthetic race staff"}}');
insert into public.admin_roles(profile_id,role_id) select '{admin}',id from public.roles where name='Super Admin';
""")
if setup.returncode:
    raise SystemExit(setup.stderr)

sql = f"""
set role service_role;
select public.gw_create_appointment('{admin}','2090-01-01T10:00:00Z','2090-01-01T11:00:00Z','{admin}');
"""
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(query, [sql] * 4))

successes = [r for r in results if r.returncode == 0]
conflicts = [r for r in results if r.returncode != 0 and "staff_time_conflict" in r.stderr]
if len(successes) != 1 or len(conflicts) != 3:
    raise SystemExit("FAIL: parallel calendar writes must commit one slot and reject three overlaps\n" + "\n".join(r.stderr for r in results))
count = query("select count(*) from public.appointments;")
if count.returncode or count.stdout.strip() != "1":
    raise SystemExit("FAIL: parallel calendar writes left unexpected records")
print("PASS: concurrent scheduling commits exactly one overlapping staff slot")
