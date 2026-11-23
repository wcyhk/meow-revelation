import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const root=path.resolve(process.argv[2]);
const release=vm.runInNewContext(fs.readFileSync(path.join(root,'offline-assets.js'),'utf8')+';offlineRelease');
const packed=new Set(release.files.map(([file])=>file));
for(const [file,size,hash] of release.files){
 const bytes=fs.readFileSync(path.join(root,file));assert.equal(bytes.length,size,file);
 assert.equal(createHash('sha256').update(bytes).digest('base64'),hash,file);
 assert.doesNotMatch(file,/infinite-requiem|korean-art|jushang-references|gersang-frames|\/review\/|weapon-forge/,'Retired content must not be cached');
}
const seen=new Set();
function visit(file){
 if(seen.has(file))return;seen.add(file);assert.ok(packed.has(file),'Active module must be available offline: '+file);
 const source=fs.readFileSync(path.join(root,file),'utf8');
 assert.doesNotMatch(source,/52jushang\.com|gersangjjang\.com|KoreanWeaponColors|KoreanBossArt/,'No external-game reference data in active module: '+file);
 for(const match of source.matchAll(/['"]((?:\.\.\/|\.\/)[^'"\n]*?\.mjs(?:\?[^'"\n]*)?)['"]/g)){
  visit(path.posix.normalize(path.posix.join(path.posix.dirname(file),match[1].split('?')[0])));
 }
}
visit('eclipse/game.mjs');visit('eclipse/offline.mjs');
assert.equal(fs.existsSync(path.join(root,'eclipse/audio/infinite-requiem.mp3')),false);
const music=fs.readFileSync(path.join(root,'eclipse/audio/night-watch-metal.mp3'));
assert.equal(createHash('sha256').update(music).digest('hex'),'3b8f87fb9230c81d6b4f201e1247c971ce92e11e0c5ee47f2e3eb2563b5d9503');
assert.ok(packed.has('eclipse/audio/MUSIC-LICENSE.txt'));assert.ok(packed.has('THREE-LICENSE.txt'));
console.log('Active original-world graph, all release hashes, retired-content exclusion and licensed music provenance passed. '+seen.size+' active modules; '+packed.size+' cached files.');
