import {readFile} from 'node:fs/promises';
import {Resolver} from 'node:dns/promises';
const setup=JSON.parse(await readFile(new URL('../../supabase/dns-records.json',import.meta.url),'utf8'));
// Check published records through public DNS, independent of local host overrides.
const resolver=new Resolver({timeout:3000,tries:2});
resolver.setServers(['1.1.1.1','8.8.8.8']);
let missing=0;
for(const record of setup.records){
  try{
    const actual=record.type==='TXT'?(await resolver.resolveTxt(record.fqdn)).map(chunks=>chunks.join('')):await resolver.resolveCname(record.fqdn);
    const match=record.type==='TXT'?actual.includes(record.value):actual.some(value=>value.toLowerCase().replace(/\.$/,'')===record.value.toLowerCase().replace(/\.$/,''));
    console.log((match?'OK ':'PENDING ')+record.type+' '+record.fqdn);
    if(!match)missing++;
  }catch(error){console.log('PENDING '+record.type+' '+record.fqdn+' ('+error.code+')');missing++;}
}
if(missing)process.exitCode=1;
else console.log('All three public mail records match the Resend domain. Verify domain status in Resend before enabling email login.');
