# Flappy Evolution
Use Yarn 1.22.22, Node 22.x, Phaser 3.90.0, TypeScript 5.9.3, Vite 7.3.1.
One Bird / Arcade physics and one PlayScene for both modes. Preserve gravity 1650, world gravity 0 and manual hitbox geometry. Tier 1 flap remains 430; higher character powers are defined only in characters.ts.
No API, analytics, remote fonts, database, accounts or online leaderboard. All rewards go through SaveManager. Do not touch adjacent repositories. Do not deploy without an explicit user request.
Commands: yarn dev, yarn typecheck, yarn test, yarn test:e2e, yarn build, yarn preview.

Read .agents/skills/arcade-combat/SKILL.md before combat/UI/audio work. User-authorized power progression supersedes the old cosmetic-only design. Use pooled projectiles, authoritative boss phases and bounded audio. Adventure victory requires both gates and boss defeat.
Read installed skills in .agents/skills/design-action-combat, build-game-monster-system, build-game-audio-feedback and game-development. The Phaser-specific arcade-combat skill defines the documented 2D adaptation; do not introduce Three.js solely to satisfy 3D rig details.
