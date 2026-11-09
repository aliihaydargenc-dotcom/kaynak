# Mobile arcade visual redesign

Base: 0dddc51ef326f50108060f999ae0b33b9c7b873b. Production: dpl_9ZSVQF6xc4c9E3QUCkdLyUspd9W8.
All 52 deployment source hashes match the base commit (../source-match.json).

## Changes
Full-screen living menu, separate 4x animated mascot portraits, two sculpted mode controls; four illustrated biome islands with routes, stage nodes, stars and locked states; cartoon bird frames in the unchanged 72x64 gameplay envelope; independent cloud/ridge/terrain/foreground parallax; bounded ambient motes; floating HUD, impact flash/ring/debris and a scene-based result presentation. Reduced motion disables decoration and camera impacts.

## Simulation
Bird.ts, constants.ts, characters.ts, CombatModel.ts, ObstacleSystem.ts, levels, save and progression remain unchanged. Both modes use one PlayScene. No changes to gravity, power, hitboxes, gate patterns, cooldowns or rewards.

## Verification
Node 22.16.0, Yarn 1.22.22. TypeScript and Vite production build pass. 37 unit tests and 12 Playwright tests pass, including precise reference physics, adventure boss completion, collision precedence, pause/restart, pooled combat, audio and reduced motion. Layouts: 360x640, 390x844, 430x932, 768x1024, 844x390; measured control targets >=48 CSS px, no horizontal overflow.
Before/after screenshots and gameplay.mp4 are in this directory; public gallery /review/; capture script scripts/capture-redesign.cjs. The final video segment uses real-time steering input without simulation changes.
Production navigation was attempted but failed with ERR_TUNNEL_CONNECTION_FAILED (outbound policy). Before images use the hash-verified local production sources. Remote preview browsing has the same environment limitation.
Performance probe: Linux Chromium WebGL software rendering, 390x844, zero runtime errors, maximum 77 scene objects, no horizontal overflow. Median frame interval 66.6ms, p95 83.4ms; this does not establish 60fps on phones. Physical-device smoothness and thermal behavior need user testing.

## Design guidance
UI/UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT). Loaded .claude/skills/ui-ux-pro-max/SKILL.md and references/pro-rules.md; ran design-system query “mobile arcade adventure game” and touch/safe-area UX query. Generic landing-page/retro/neon recommendations did not fit this game; applied touch sizing, focus, reduced-motion and safe-area guidance with an authored illustrated arcade direction. No remote fonts or additional runtime dependencies.
Repository arcade-combat and associated game skills applied; documented Phaser 2D adaptation preserved.

Preview only. No production reassignment or main merge.
