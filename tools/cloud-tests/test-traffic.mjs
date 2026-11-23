import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {TrafficVisit, trafficSource} from '../../eclipse/traffic.mjs';

const game = 'https://wcy.hk/meow-revelation/';
assert.equal(trafficSource(game + '?lang=ja', 'https://webgame.jp/games/3880'), 'webgamejp');
assert.equal(trafficSource(game + '?utm_source=KCHKD', 'https://www.youtube.com/'), 'kchkd');
assert.equal(trafficSource(game + '?utm_source=not-a-platform', 'https://www.kchkd.com/games'), 'kchkd');
assert.equal(trafficSource(game, 'https://l.threads.com/'), 'threads');
assert.equal(trafficSource(game, 'https://www.kchkd.com.example.org/'), 'other');
assert.equal(trafficSource(game, 'https://wcy.hk/'), 'direct');
assert.equal(trafficSource(game + '?utm_source=unrecognized'), 'direct');

const db = new PGlite();
try {
  await db.exec('create role anon; create role authenticated;');
  await db.exec(await readFile(new URL('../../supabase/migrations/202611230001_traffic_analytics.sql', import.meta.url), 'utf8'));
  const write = async visits => {
    await db.exec('set role anon');
    try {
      await db.query('select public.meow_record_traffic($1::jsonb)', [JSON.stringify(visits)]);
      return true;
    } finally {
      await db.exec('reset role');
    }
  };
  const storage = Object.create({
    getItem(key) { return this[key] ?? null; },
    setItem(key, value) { this[key] = value; },
    removeItem(key) { delete this[key]; },
  });
  let online = false;
  let elapsed = 0;
  const first = new TrafficVisit({storage, source:'webgamejp', locale:'ja', write:async visits => online && write(visits)});
  first.beginRun(() => elapsed);
  elapsed = 94000;
  await first.flush();
  assert.equal(Object.keys(storage).length, 1, 'offline visits remain queued');
  const offlineSnapshot = JSON.parse(Object.values(storage)[0]).snapshot;
  first.finishRun();
  elapsed = 0;
  first.beginRun(() => elapsed);
  elapsed = 26000;
  first.finishRun();

  online = true;
  const second = new TrafficVisit({storage, source:'kchkd', locale:'zh-Hant', write});
  await second.flush();
  assert.equal(Object.keys(storage).length, 0, 'a new page uploads pending visits');
  await write([JSON.parse(offlineSnapshot)]);
  await write([{...first.visit, starts:4, play_ms:200000, source:'direct'}]);
  const rows = (await db.query('select source,starts,play_ms from meow_analytics.visits order by source')).rows;
  assert.deepEqual(rows, [
    {source:'kchkd', starts:0, play_ms:0},
    {source:'webgamejp', starts:2, play_ms:120000},
  ], 'retries do not inflate counts or rewrite source');

  const report = await readFile(new URL('../../supabase/traffic-report.sql', import.meta.url), 'utf8');
  const stats = (await db.query(report)).rows;
  assert.equal(stats[0]['來源'], 'WebGameJp');
  assert.equal(Number(stats[0]['開局率 %']), 100);
  assert.equal(Number(stats[0]['每局平均分鐘']), 1);
  assert.equal(stats[1]['每局平均分鐘'], null);
  await assert.rejects(() => write([{...first.visit, id:crypto.randomUUID(), source:'invalid'}]), {code:'23514'});
  await assert.rejects(() => write(Array(25).fill(first.visit)), {code:'22023'});
  await db.exec('set role anon');
  await assert.rejects(() => db.query('select * from meow_analytics.last_30_days'), {code:'42501'});
  await assert.rejects(() => db.query('select * from meow_analytics.visits'), {code:'42501'});
  await db.exec('set role authenticated');
  await assert.rejects(() => db.query('select * from meow_analytics.last_30_days'), {code:'42501'});
} finally {
  await db.close();
}

console.log('Traffic sources, offline syncing, stale snapshots, private reporting, validation and aggregates passed.');
