import {createHash} from 'node:crypto';
import {lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const [sourceDirectory, outputDirectory] = process.argv.slice(2);
if (!sourceDirectory || !outputDirectory) {
  throw new Error('Usage: node tools/package-pages.mjs <release source> <new output directory>');
}

const source = realpathSync(sourceDirectory);
const output = path.resolve(outputDirectory);

// The generated manifest is data, despite the JS wrapper used by the service worker.
const manifestPath = 'offline-assets.js';
const manifestText = readFileSync(path.join(source, manifestPath), 'utf8');
const manifestData = manifestText.match(/^const offlineRelease=\{version:"([a-f0-9]{20})",files:(\[[^\r\n]*\])\};$/m);
if (!manifestData) throw new Error(`Invalid ${manifestPath}`);
const [, version, entries] = manifestData;
const files = JSON.parse(entries);
const versionHash = createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0, 20);
if (version !== versionHash) throw new Error(`Invalid offline release identifier ${version}`);

const siteFiles = new Map([
  [manifestPath, null],
  ['sw.js', null],
  ['.nojekyll', null],
  ['auth-check/index.html', null],
  ['auth-check/preflight.mjs', null],
]);

for (const [file, bytes, sha256] of files) {
  // Accept ordinary relative web paths only. Never export dotfiles or archived studies.
  if (file.split('/').some(segment => !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment))) {
    throw new Error(`Invalid manifest path ${file}`);
  }
  if (/^eclipse\/review\/|(?:^|\/)(?:infinite-requiem\.mp3|(?:korean-art|jushang-references|gersang-frames)\.mjs)$/.test(file)) {
    throw new Error(`Retired content in the release manifest: ${file}`);
  }
  if (siteFiles.has(file)) throw new Error(`Duplicate release path: ${file}`);
  siteFiles.set(file, {bytes, sha256});
}

for (const required of ['index.html', 'eclipse/index.html', 'lantern-hall/index.html', 'privacy/index.html', 'terms/index.html', 'art-credits.txt', 'THREE-LICENSE.txt', 'eclipse/FONT-OFL.txt', 'eclipse/vendor/SUPABASE-LICENSE.txt', 'eclipse/audio/MUSIC-LICENSE.txt']) {
  if (!siteFiles.has(required)) throw new Error(`Missing page or license notice: ${required}`);
}

// Read and verify the complete allowlist before writing the output, so a stale
// index or corrupt download cannot produce a partially valid deployment.
const verified = new Map();
for (const [file, entry] of siteFiles) {
  const absolute = path.join(source, file);
  if (!lstatSync(absolute).isFile() || realpathSync(absolute) !== absolute) {
    throw new Error(`Release path must be a regular file: ${file}`);
  }
  const content = readFileSync(absolute);
  if (entry && (content.length !== entry.bytes || createHash('sha256').update(content).digest('base64') !== entry.sha256)) {
    throw new Error(`Offline manifest bytes do not match ${file}. Rebuild the manifest from the staged release.`);
  }
  verified.set(file, content);
}

mkdirSync(output, {recursive: true});
if (readdirSync(output).length) throw new Error(`Output directory must be empty: ${output}`);
for (const [file, content] of verified) {
  const target = path.join(output, file);
  mkdirSync(path.dirname(target), {recursive: true});
  writeFileSync(target, content, {flag: 'wx'});
}
console.log(`Pages artifact ${version}: ${verified.size} allowlisted files at ${output}`);
