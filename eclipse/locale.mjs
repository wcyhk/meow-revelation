import {catalogue} from './locale-catalogue.mjs';

const storageKey = 'meow.language';
export const languages = Object.freeze({
  'zh-Hant':'繁體中文', 'zh-Hans':'简体中文', en:'English', ja:'日本語',
});
const supported = value => Object.hasOwn(languages, value);

export function detectLanguage(preferences) {
  for (const preference of preferences) {
    const tag = String(preference).toLowerCase().replaceAll('_','-').split('-');
    if (tag[0] === 'en' || tag[0] === 'ja') return tag[0];
    if (tag[0] === 'zh') {
      if (tag.includes('hant')) return 'zh-Hant';
      if (tag.includes('hans') || tag.some(part => ['cn','sg','my'].includes(part))) return 'zh-Hans';
      return 'zh-Hant';
    }
  }
  return 'zh-Hant';
}

const preference = (() => {
  try {
    const value = globalThis.localStorage?.getItem(storageKey);
    if (supported(value)) return value;
  } catch { /* Storage is optional, including in private browsing. */ }
  return 'auto';
})();
const request = typeof location === 'undefined' ? null : new URL(location.href).searchParams.get('lang');
const device = globalThis.navigator?.languages?.length ? navigator.languages : [globalThis.navigator?.language];
export const language = supported(request) ? request : preference === 'auto' ? detectLanguage(device) : preference;
const localeIndex = {'zh-Hans':0, en:1, ja:2}[language];
const own = (object, name) => Object.hasOwn(object, name);
const han = /\p{Script=Han}/u;
const marks = /《(\d+)》/g;
const table = catalogue;
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fill = (message, values) => message.replace(marks, (whole, id) => values[Number(id)] ?? whole);
const byInitial = new Map();
const patterns = [];
const cache = new Map();

if (localeIndex !== undefined) {
  for (const key of Object.keys(table)) {
    const parts = key.split(marks);
    if (parts.length > 1) {
      const stable = parts.filter((_, i) => i % 2 === 0).join('');
      if (stable.replace(/[^\p{L}]/gu, '').length < 2) continue;
      const pattern = parts.map((part,i) => i % 2 === 0 ? escape(part) : '(.+?)').join('');
      patterns.push({key, test:new RegExp('^'+pattern+'$','u'), stable, probe:
        parts.filter((_, i) => i % 2 === 0).sort((a,b) => b.length-a.length)[0],
      order:parts.filter((_,i) => i % 2 === 1).map(Number)});
    } else if (key.length > 1 && table[key][localeIndex]) {
      if (!byInitial.has(key[0])) byInitial.set(key[0], []);
      byInitial.get(key[0]).push(key);
    }
  }
  for (const phrases of byInitial.values()) phrases.sort((a,b) => b.length-a.length);
  patterns.sort((a,b) => b.stable.length-a.stable.length);
}

function getMessage(key) {
  return (own(table,key) && table[key][localeIndex]) || key;
}

// Use the whole translation when available. Composed labels such as a weapon
// name followed by a bonus can also be translated phrase by phrase.
function translate(text, depth) {
  if (!han.test(text)) return text;
  if (own(table,text) && table[text][localeIndex]) return table[text][localeIndex];
  if (depth < 3) for (const item of patterns) {
    if (!text.includes(item.probe)) continue;
    const match = item.test.exec(text);
    if (!match) continue;
    const message = getMessage(item.key);
    if (message === item.key) continue;
    const args = [];
    item.order.forEach((id,index) => { args[id] = translate(match[index+1], depth+1); });
    return fill(message,args);
  }
  let output = '';
  for (let offset = 0; offset < text.length;) {
    const key = byInitial.get(text[offset])?.find(phrase => text.startsWith(phrase,offset));
    if (!key) { output += text[offset++]; continue; }
    const piece = getMessage(key);
    if (language === 'en' && /[\p{L}\d]$/u.test(output) && /^[A-Za-z\d]/.test(piece)) output += ' ';
    output += piece;
    offset += key.length;
    if (language === 'en' && /[A-Za-z\d]$/.test(piece) && /^[A-Za-z\d\p{Script=Han}]/u.test(text.slice(offset))) output += ' ';
  }
  return output;
}

export function t(value) {
  if (localeIndex === undefined || typeof value !== 'string' || !han.test(value)) return value;
  if (language === 'ja' && /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(value) && !own(table,value)) return value;
  if (cache.has(value)) return cache.get(value);
  const output = value.replace(/^(\s*)([\s\S]*?)(\s*)$/, (_,start, middle,end) => start+translate(middle,0)+end);
  if (cache.size >= 1024) cache.delete(cache.keys().next().value);
  cache.set(value, output);
  return output;
}

export function format(message, ...values) {
  return fill(localeIndex === undefined ? message : getMessage(message), values.map(value => t(String(value))));
}

export function localizePage() {
  const html = document.documentElement;
  html.lang = language;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('script,style,[data-language]')) node.data = t(node.data);
  }
  const attributes = ['aria-label','title','placeholder','alt','data-release-label'];
  const selector = attributes.map(name => '['+name+']').join(',');
  for (const node of document.querySelectorAll(selector)) {
    for (const name of attributes) {
      if (node.hasAttribute(name)) node.setAttribute(name,t(node.getAttribute(name)));
    }
  }
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = t(description.content);
  document.title = t(document.title);
}

export function mountLanguagePicker() {
  const picker = document.querySelector('#game-language');
  if (!picker) return;
  picker.value = supported(request) ? request : preference;
  picker.addEventListener('change',() => {
    let persistent = true;
    try {
      if (picker.value === 'auto') localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey,picker.value);
    } catch { persistent = false; }
    const url = new URL(location.href);
    if (!persistent && picker.value !== 'auto') url.searchParams.set('lang',picker.value);
    else url.searchParams.delete('lang');
    location.replace(url.href);
  });
}
