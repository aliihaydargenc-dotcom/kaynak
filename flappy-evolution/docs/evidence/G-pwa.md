# G — production PWA
Build generates a content-hashed cache version and complete same-origin precache list, including all world/character/audio generator code and wardrobe/PWA icons. Offline status requires a successful active-worker cache-status response. Failed install discards its partial cache.
Navigation network-first accepts only the worker's own build-stamped HTML; a newer shell falls back to the current complete shell until the waiting worker is explicitly activated from menu. No automatic skipWaiting, no mid-flight reload. Menu update produces one controller-change reload. Cache deletion is restricted to flappy-evolution-. localStorage is never cleared by SW.
Manifest normal/maskable 192 and 512 PNG icons. Optional fullscreen/portrait failure is non-blocking. Vercel preparation only: Node 22.x, yarn build, dist, cache headers. No Vercel project/account/domain/deployment operations performed.
Actual offline/update browser evidence is recorded in H-report.md.
