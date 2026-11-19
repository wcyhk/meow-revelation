# Player accounts and rankings

The game stays on GitHub Pages. Supabase Auth handles permanent player accounts;
PostgreSQL stores private run history and computes one best run per player per
difficulty. A local guest ID is not an authenticated cloud account.

## Provisioning

The dedicated project is `lndgnnygydivahrywqxa` (Meow Revelation, Tokyo).
The database is connected. `email:false` and `google:false` deliberately keep
public login disabled while SMTP and Google OAuth are pending, per the owner's
choice. Guest play, local history, and public leaderboard viewing remain enabled.
Turn `email:true` only after real SMTP delivery and OTP verification are tested;
turn `google:true` only after the configured OAuth callback is tested. Existing
guest runs can be claimed when permanent login opens.

1. Create the dedicated **Meow Revelation** project in the **Meow Revelation**
   Free organization, in Asia-Pacific. The owner enters the database password.
2. Apply `migrations/202611190001_player_rankings.sql` in the SQL editor or with
   the Supabase migration tooling. The migration creates only the `meow_*`
   application objects; it does not import game test data.
3. Put the project URL and **publishable** key in
   `eclipse/online-config.mjs`. Never put service-role/secret keys, database
   passwords or management tokens in a browser module, repository or screenshot.
4. Set Auth Site URL and allowed redirect URL to
   `https://wcy.hk/meow-revelation/`. Email OTP uses `signInWithOtp` plus
   `verifyOtp`; PKCE magic links are also supported in the same browser.
5. For email codes, include `{{ .Token }}` in the Magic Link email template.
   A minimal body is `<h2>貓貓啟示錄登入驗證碼</h2><p>{{ .Token }}</p>`.
   Configure a real SMTP sender for public/player use. Supabase's default sender
   is restricted to organization-team addresses and is not production delivery:
   https://supabase.com/docs/guides/auth/auth-smtp
6. If Google login is enabled in Supabase Auth with a valid OAuth client,
   set `google:true` in the public config. OAuth client secrets stay in Supabase.
7. Stage runtime files, run `node tools/build-offline.mjs`, archive with
   `git -c core.autocrlf=false archive`, test, then publish the Pages commit.
   Before publishing, run `node tools/cloud-tests/check-config.mjs`; an empty
   placeholder or a privileged secret must fail this deployment check.

## Record rules

- `highest_floor` and `cleared_ms` always describe the same run/checkpoint.
  Death/retreat updates total elapsed time, not the time of its last floor clear.
- Sort by completed floor descending, then time of that floor clear ascending.
  `forest-1` is the gameplay ruleset, separate from cosmetic release versions.
- Every run has a UUID and monotonic revision. Duplicate/stale submissions return
  the accepted revision, and cannot create a second row or downgrade history.
- IndexedDB persists guest/account runs, offline flags and pending revisions.
  Acknowledgements only consume the revision actually accepted. Guest claims
  are permanent; changing accounts cannot claim another player's queue.
- Requests pin the initiating account's JWT so an in-flight upload cannot attach
  a newly signed-in account's token. The server derives ownership from `auth.uid()`.
- Direct table writes are revoked. Only the validated RPC writes run data;
  private history SELECT uses owner-only RLS. Leaderboard RPC exposes names and
  performance data, never email addresses, tokens or detailed private history.
- Invincible/practice runs are not created locally and explicit such flags are
  rejected by the submit RPC. Offline browser telemetry is not tamper-proof;
  basic validation and authentication do not establish cheat-proof gameplay.
- Auth sessions are separate from game progress. This change does not implement
  cloud synchronization of training purchases, gold or unlocks.

## Verification

Install test dependencies with `npm ci --prefix tools/cloud-tests`.

```
node tools/cloud-tests/test-records.mjs
node tools/cloud-tests/test-database.mjs
node tools/cloud-tests/smoke-player.cjs <absolute-deployment-tree>
node tools/cloud-tests/test-live-public.mjs
node tools/cloud-tests/smoke-live-rankings.cjs <absolute-deployment-tree>
node tools/smoke-reward-music.cjs <absolute-deployment-tree>
```

The database checks execute the real migration on PGlite/PostgreSQL, with explicit
anon/authenticated roles and RLS checks. The browser test uses the bundled actual
Supabase SDK against a **local-only fake email provider** and PostgreSQL-backed
REST fixture. It sends no real email and creates no production users. It verifies
guest claiming, idempotency, offline cold launch, reconnect uploads, history
isolation, one-best ranking, invincible/practice exclusion and mobile UI.

Production release additionally needs verification against the provisioned
Supabase project's real Auth and RPC endpoints. Fixture success is not a claim
that production email delivery or OAuth has been configured.
