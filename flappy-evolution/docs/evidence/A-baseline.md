# A — pinned upstream baseline
Source checkout: 9117cfe268940acef8fc10ba0cff8e758a5d7209, isolated in scratch/flappy-upstream.
Upstream package uses Yarn Classic lock v1, no packageManager or engines pin. Installed with Yarn 1.22.22 --frozen-lockfile. Node 22.23.4. Phaser 3.90.0, TS 5.9.3, Vite 7.3.1 resolved from upstream lock.
Original yarn build and yarn tsc --noEmit passed. No independent score API was started. Missing score endpoint is separate from flight behavior.
Browser evidence: baseline.json and baseline.png. Controlled obstacle fixture holds centers at 360 and movement static; it does not replace Bird physics or award scores. Input timestamps and observed positions/velocities are recorded, not a claim of cross-device bit determinism.
Bird start x=144 y=392.84, body 38×30 offset(16,17); death uses rotated visual bounds inset(8,7,18,14). World gravity 0, body gravity 1650, flap velocity -430. First spawn cooldown 450 ms. Upstream post-death reward bug documented; corrected in C.
