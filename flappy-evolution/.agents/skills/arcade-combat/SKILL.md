# Flappy arcade combat
Read and applied 2026-11-09. Sources: MengTo/Skills design-action-combat, build-game-monster-system (including references/monster-contract.md), build-game-audio-feedback; sickn33/antigravity-awesome-skills game-development. URLs and adaptation report: docs/combat-upgrade.md.

- Simulation owns contact, damage, cooldown and completion; views only display resolved state. Use stable action/target IDs and resolve each contact once.
- Boss definition, runtime, collision shapes and view are separate. Attacks have visible startup, active and recovery windows, deterministic phase transitions and no unavoidable instant contacts. Stop combat clocks while paused.
- This is Phaser 2D: use pixel coordinates, simple hurtboxes and scene-owned sprites. Three.js skeleton/LOD/3D navigation requirements do not apply. Document this exception; do not claim full 3D monster compliance.
- Pool frequent projectiles; bound live entities and audio voices. Clear on scene shutdown and reset on restart.
- Prioritize damage/warnings over flight sounds. Unlock one Phaser-owned AudioContext from input; cache synthesized buffers, stop nodes on mute/pause/shutdown. Keep visible warning and cooldown equivalents.
- Preserve baseline character physics; higher tiers inherit prior capabilities. Keep early bosses completable with temporary basic fire. Only boss defeat completes an adventure after its gate target.
- Test contact idempotence, pool exhaustion, cooldown boundaries, phases, pause/restart, rewards, mute, reduced motion and mobile controls. Do not claim physical-device balance from automated fixtures.
