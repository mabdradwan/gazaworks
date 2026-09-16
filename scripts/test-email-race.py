"""Use independent PostgreSQL connections; never contact an email provider."""
import concurrent.futures
import json
import os
import subprocess
import time

if os.environ.get("GAZAWORKS_TEST_HARNESS") != "1":
    raise SystemExit("Run through scripts/test-database.sh on a disposable database.")


def query(sql):
    result = subprocess.run(["psql", os.environ["TEST_DATABASE_URL"], "-v", "ON_ERROR_STOP=1", "-Atq"], input=sql, text=True, capture_output=True, check=False)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


fixture = "89999999-9999-4999-8999-999999999999"
query(f"""
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data)
values('{fixture}','race@email.test',now(),'{{"account_type":"client","display_name":"Synthetic email race"}}');
insert into public.notifications(profile_id,category,title,body)
select '{fixture}','security','Synthetic race','No actual email sent' from generate_series(1,12);
""")
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    batches = list(pool.map(query, ["set role service_role; select public.gw_claim_emails(3);"] * 4))
jobs = [job for batch in batches for job in json.loads(batch)]
if len(jobs) != 12 or len({job["id"] for job in jobs}) != 12:
    raise SystemExit("FAIL: concurrent email workers must claim distinct jobs")
if query("set role service_role; select public.gw_claim_emails(3);") != "[]":
    raise SystemExit("FAIL: active email leases were claimed again")
print("PASS: four email workers claim twelve distinct jobs exactly once")

for n, job in enumerate(jobs[:2]):
    envelope = json.dumps({"from": "notice@email.test", "to": "race@email.test", "subject": "Synthetic", "html": "<p>Synthetic</p>", "text": "Synthetic"})
    query(f"set role service_role; select public.gw_prepare_email('{job['id']}','{job['claim_token']}','{envelope}');")
    finish = f"select public.gw_finish_email('{job['id']}','{job['claim_token']}','accepted','race-provider-{n}');"
    callback = f"select public.gw_email_delivery('race-event-{n}','race-provider-{n}','delivered',now());"
    first, second = (finish, callback) if n == 0 else (callback, finish)
    name = f"email-race-{n}"
    # Hold the first transaction open, then force the competing request to arrive
    # before commit. Without the shared message lock one ordering loses delivery.
    proc = subprocess.Popen(["psql", os.environ["TEST_DATABASE_URL"], "-v", "ON_ERROR_STOP=1", "-Atq"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    proc.stdin.write(f"begin; set local application_name='{name}'; set local role service_role; {first} select pg_sleep(1); commit;\n")
    proc.stdin.close()
    deadline = time.monotonic() + 5
    while query(f"select exists(select 1 from pg_stat_activity where application_name='{name}' and wait_event='PgSleep');") != "t":
        if proc.poll() is not None or time.monotonic() > deadline:
            proc.kill()
            raise SystemExit("FAIL: email transaction concurrency barrier was not reached")
        time.sleep(0.02)
    query("set role service_role; " + second)
    if proc.wait(timeout=5):
        raise SystemExit(proc.stderr.read())
    if query(f"select status='sent' and delivery_status='delivered' from private.email_outbox where id='{job['id']}';") != "t":
        raise SystemExit("FAIL: concurrent email confirmation lost its delivery event")
    print(f"PASS: concurrent email delivery is reconciled with {'send' if n == 0 else 'callback'} committing first")
