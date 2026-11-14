// Locale regression check: every locale × every route, reporting interface
// strings still in a foreign script. Run against a preview server:
//   node tools/check-locales.cjs http://127.0.0.1:8775/index.html
const { spawn } = require("child_process");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.PROBE_PORT || 9410);
const BASE = process.argv[2] || "http://127.0.0.1:8775/index.html";
const sleep = ms => new Promise(r => setTimeout(r, ms));

const LOCALES = ["zh-Hans", "zh-Hant", "ja", "en", "ko", "pt", "es", "fr", "de", "ru", "ar"];

// Grep for text that cannot belong to the active locale's script. Chinese,
// Japanese and Korean share a script, so they are checked as a group.
const SWEEP = `(function(lang){
  var cjk=/[\\u3000-\\u303f\\u3400-\\u4dbf\\u4e00-\\u9fff\\uff00-\\uffef\\u3040-\\u30ff\\uac00-\\ud7af]/;
  var arabic=/[\\u0600-\\u06ff]/;
  var cyrillic=/[\\u0400-\\u04ff]/;
  var latin=/[A-Za-z]/;
  var foreign=[];
  var isCJK = /zh|ja|ko/.test(lang);
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n;
  while(n=w.nextNode()){
    var t=n.nodeValue.replace(/\\s+/g,' ').trim(); if(!t) continue;
    var el=n.parentElement;
    if(!el) continue;
    /* Authorial prose is the author's own language and the theme does not
       translate it: an article body speaks whatever language its author wrote
       in, whichever locale the interface is set to. The sweep therefore only
       audits the theme's chrome, never the text inside a body container. */
    if(el.closest('#article-prose,#page-prose,.article-body')) continue;
    if(el.closest('script,style,#lang-menu,#font-menu,#search-overlay .sr-only')) continue;
    /* The theme's decorative Latin (INSTITVTUM, FOLIA, MMXXVI) and the brand
       "Antiphon" are intentional in every locale, so Latin never counts as a
       leak. What must not appear is another locale's script. */
    var bad;
    if(isCJK) bad = arabic.test(t) || cyrillic.test(t);
    else if(lang==='ar') bad = cjk.test(t) || cyrillic.test(t);
    else if(lang==='ru') bad = cjk.test(t) || arabic.test(t);
    else bad = cjk.test(t) || arabic.test(t) || cyrillic.test(t);
    if(!bad) continue;
    var c=(el.className&&typeof el.className==='string')?el.className.trim().split(/\\s+/)[0]:'';
    foreign.push(el.tagName.toLowerCase()+(c?'.'+c:'')+' : '+t.slice(0,44));
  }
  return foreign;
})`;

async function main() {
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox",
    "--user-data-dir=/tmp/ch-reg-" + Date.now(), "--remote-debugging-port=" + PORT,
    "--window-size=1440,1200", "about:blank"], { stdio: "ignore" });
  let page = null;
  for (let i = 0; i < 150; i++) {
    try { const r = await fetch("http://127.0.0.1:" + PORT + "/json/list"); const j = await r.json(); page = j.find(t => t.type === "page"); if (page) break; } catch (e) {}
    await sleep(100);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  };
  const send = (me, pa) => { const mid = ++id; return new Promise((res, rej) => { pend.set(mid, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: mid, method: me, params: pa || {} })); }); };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url: BASE });

  const ev = async x => {
    const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return "ERR:" + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
    return r.result && r.result.value;
  };

  for (let i = 0; i < 300; i++) {
    if (await ev("!!document.querySelector('.entry-title a')")) break;
    await sleep(150);
  }

  const lines = [];
  const P = s => lines.push(s);

  const route = async q => {
    await ev(`(function(){history.pushState(null,'','./index.html${q}');Antiphon.renderRoute();return 1;})()`);
    await sleep(1000);
  };

  const sweep = async () => {
    const tag = await ev("Antiphon.lang");
    const res = await ev(`${SWEEP}(${JSON.stringify(tag)})`);
    return typeof res === "string" && res.startsWith("ERR:") ? [res] : res;
  };

  for (const loc of LOCALES) {
    await ev(`(function(){var m=document.getElementById('lang-menu');if(m)m.hidden=false;var r=document.querySelector('#lang-menu [data-lang-choice="${loc}"]');if(r)r.click();return 1;})()`);
    await sleep(1000);
    const resolved = await ev("Antiphon.lang");
    P("\n" + loc + " -> " + resolved + "  dir=" + await ev("document.body.getAttribute('dir')||'ltr'"));
    for (const [label, q] of [
      ["home", "?type=internal&function=article_list"],
      ["archive", "?type=internal&function=archive_and_tags"],
      ["friends", "?type=internal&function=friendbook"],
      ["article", "?type=article&filename=06-pinned.md"],
      ["page", "?type=page&filename=about.md"]
    ]) {
      await route(q);
      const leaks = await sweep();
      P("  " + label.padEnd(8) + " " + (leaks.length ? leaks.length + " leak(s)" : "clean"));
      leaks.slice(0, 4).forEach(l => P("      " + l));
    }
  }

  console.log(lines.join("\n"));
  ws.close(); chrome.kill();
}
main().catch(e => { console.error("FAIL", e); process.exit(1); });
