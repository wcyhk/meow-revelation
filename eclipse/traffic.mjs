import {language} from './locale.mjs';
import {onlineConfig} from './online-config.mjs';

const platforms = new Map([
  ['webgamejp', ['webgame.jp']],
  ['kchkd', ['kchkd.com']],
  ['game16', ['game16.net']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['bahamut', ['gamer.com.tw']],
  ['bilibili', ['bilibili.com', 'b23.tv']],
  ['indieradar', ['indieradar.games']],
  ['reddit', ['reddit.com', 'redd.it']],
  ['itchio', ['itch.io']],
  ['crazygames', ['crazygames.com']],
  ['threads', ['threads.com', 'threads.net']],
]);
const queuePrefix = 'meow.traffic.v1.';
const dayMs = 86400000;
const retentionMs = 30 * dayMs;
const maxBatch = 24;
const maxPlayMs = 7 * dayMs;

export function trafficSource(url, referrer = '') {
  const marked = new URL(url).searchParams.get('utm_source')?.trim().toLowerCase();
  if (platforms.has(marked)) return marked;
  let host;
  try { host = new URL(referrer).hostname.toLowerCase(); }
  catch { return 'direct'; }
  if (host === 'wcy.hk' || host === 'www.wcy.hk') return 'direct';
  for (const [name, domains] of platforms) {
    if (domains.some(domain => host === domain || host.endsWith('.' + domain))) return name;
  }
  return 'other';
}

// One random ID per page opening, with cumulative snapshots so a retry or an
// older delivery cannot inflate the figures. Each visit has its own queue key.
export class TrafficVisit {
  constructor({source, locale, write, storage, now = () => Date.now(), uuid = () => crypto.randomUUID()}) {
    this.visit = {id:uuid(), source, locale, day:new Date(now() + 8 * 3600000).toISOString().slice(0, 10),
      starts:0, play_ms:0};
    this.now = now;
    this.write = write;
    this.storage = storage;
    this.pending = new Map();
    this.finishedMs = 0;
    this.save();
  }

  beginRun(elapsed) {
    this.finishRun();
    this.visit.starts = Math.min(10000, this.visit.starts + 1);
    this.elapsed = elapsed;
    this.save();
  }

  finishRun() {
    if (!this.elapsed) return;
    this.finishedMs += this.elapsed();
    this.elapsed = null;
    this.save();
  }

  save() {
    this.visit.play_ms = Math.min(maxPlayMs, Math.max(0, Math.floor(this.finishedMs + (this.elapsed?.() ?? 0))));
    const snapshot = JSON.stringify(this.visit);
    if (snapshot === this.lastSnapshot) return;
    this.lastSnapshot = snapshot;
    const entry = {at:this.now(), snapshot};
    const key = queuePrefix + this.visit.id;
    this.pending.set(key, entry);
    try { this.storage?.setItem(key, JSON.stringify(entry)); } catch { /* Keep the in-memory copy. */ }
  }

  queued() {
    const entries = new Map(this.pending);
    try {
      for (const key of Object.keys(this.storage ?? {})) {
        if (!key.startsWith(queuePrefix)) continue;
        const entry = JSON.parse(this.storage.getItem(key));
        if (entry && !entries.has(key)) entries.set(key, entry);
      }
    } catch { /* Storage is optional. */ }
    const cutoff = this.now() - retentionMs;
    const valid = [];
    for (const [key, entry] of entries) {
      if (typeof entry.snapshot === 'string' && entry.at >= cutoff) valid.push([key, entry]);
      else this.remove(key, entry);
    }
    // Bound local storage during long periods offline. Send the oldest first so
    // a fresh arrival does not prevent queued visits from being delivered.
    valid.sort((a, b) => a[1].at - b[1].at);
    while (valid.length > 96) this.remove(...valid.shift());
    return valid.slice(0, maxBatch);
  }

  remove(key, entry) {
    if (this.pending.get(key)?.snapshot === entry.snapshot) this.pending.delete(key);
    try {
      if (JSON.parse(this.storage?.getItem(key) ?? 'null')?.snapshot === entry.snapshot) {
        this.storage.removeItem(key);
      }
    } catch { /* A subsequent delivery of the same data is harmless. */ }
  }

  async flush() {
    this.save();
    if (this.sending) return;
    const batch = this.queued();
    if (!batch.length) return;
    this.sending = true;
    try {
      if (await this.write(batch.map(([, entry]) => JSON.parse(entry.snapshot)))) {
        for (const [key, entry] of batch) this.remove(key, entry);
      }
    } catch { /* Retry during the next visible interval or reconnect. */ }
    finally { this.sending = false; }
  }
}

function startTraffic() {
  if (globalThis.location?.origin !== 'https://wcy.hk' || !onlineConfig.url || !onlineConfig.publishableKey) return;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  let storage;
  try { storage = localStorage; } catch { /* In-memory measurements can still be sent. */ }
  const meter = new TrafficVisit({source:trafficSource(location.href, document.referrer), locale:language, storage,
    write:async visits => {
      if (!navigator.onLine) return false;
      const response = await fetch(new URL('/rest/v1/rpc/meow_record_traffic', onlineConfig.url), {
        method:'POST',
        headers:{apikey:onlineConfig.publishableKey, 'Content-Type':'application/json'},
        body:JSON.stringify({p_visits:visits}), keepalive:true,
        credentials:'omit', referrerPolicy:'no-referrer', signal:AbortSignal.timeout(10000),
      });
      return response.ok;
    }});
  const flush = () => { void meter.flush(); };
  addEventListener('online', flush);
  addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', flush);
  setInterval(() => { if (!document.hidden) flush(); }, 30000);
  if (!document.hidden) setTimeout(flush, 0);
  return meter;
}

export const traffic = startTraffic();
