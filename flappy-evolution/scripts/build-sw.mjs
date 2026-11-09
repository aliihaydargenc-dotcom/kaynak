import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const list = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) files.push(...(await list(`${dir}/${e.name}`)));
    else files.push(`${dir}/${e.name}`);
  }
  return files;
};
const files = (await list("dist")).filter((p) => !p.endsWith("/sw.js")).sort();
const hash = createHash("sha256");
for (const p of files) {
  hash.update(p);
  hash.update(await readFile(p));
}
const build = process.env.FLAPPY_BUILD_ID || hash.digest("hex").slice(0, 16);
let html = (await readFile("dist/index.html", "utf8")).replace(/<meta name="flappy-build" content="[^"]*">/g, "");
html = html.replace(
  "</head>",
  `<meta name="flappy-build" content="${build}"></head>`,
);
await writeFile("dist/index.html", html);
const urls = files.map((p) => p.replace(/^dist/, ""));
const source = `const BUILD=${JSON.stringify(build)};
const CACHE='flappy-evolution-'+BUILD;
const FILES=${JSON.stringify(urls)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{await cache.addAll(FILES);}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('flappy-evolution-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE')self.skipWaiting();if(event.data==='STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE);const ready=(await cache.keys()).length>=FILES.length;event.ports[0]?.postMessage({ready,build:BUILD});})());});
self.addEventListener('fetch',event=>{const req=event.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/sw.js')return;
if(req.mode==='navigate'){event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(req);if(response.ok&&(await response.clone().text()).includes('name="flappy-build" content="'+BUILD+'"'))return response;}catch{}return (await cache.match('/index.html'))||Response.error();})());return;}
if(FILES.includes(url.pathname))event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(url.pathname))||fetch(req)));
});
`;
await writeFile("dist/sw.js", source);
console.log(`Precached ${urls.length} static files; build ${build}`);
