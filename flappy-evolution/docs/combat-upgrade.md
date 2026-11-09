# Combat / HUD / audio upgrade

User-requested power progression replaces the prior cosmetic-only contract. Existing saves remain schema 1: owned and selected characters are retained. Run summaries snapshot the character ID; the reward service applies the multiplier once to picked-up and bonus coins, not first-clear rewards. Star thresholds still count physical pickups.

## Installed and applied references

- https://github.com/MengTo/Skills/blob/main/agent-skills/game-development/design-action-combat/SKILL.md — authoritative timing/contact, cooldown tests.
- https://github.com/MengTo/Skills/blob/main/agent-skills/game-development/build-game-monster-system/SKILL.md plus references/monster-contract.md — authored boss facts, separate runtime and view. Installed in .agents/skills.
- https://github.com/MengTo/Skills/blob/main/agent-skills/game-development/build-game-audio-feedback/SKILL.md — voice priority, unlock, mute, cache and cleanup.
- https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/game-development/SKILL.md — Phaser 2D, content-as-data, bounded projectile pool, state machines.
- phaethix/polished-arcade-shooter@919035b3747905dc967224cf81a0f9e54fb9d723: inspected src/game/audio.ts, render/hud.ts, systems/bullet-system.ts, enemies/boss-ai.ts. Reference for layered cues, readable health and patterned attacks; no React/multiplayer stack or source copied.
- KilledByAPixel/ZzFX@ac5a4727a44e5506a12f7340087e0b889cfd69dc: actual vendored MIT sample generator. Shared Phaser context, cached recipes, compressor and a 12-voice priority cap. Original B5→E6 pickup, low wing transient, fire, wall break, boss contact and warning sounds.

## Play contract

| Character | Power |
|---|---|
| Kıvılcım | Original 430 flap, 1× coins |
| Filiz | 450 flap, 100px magnet, 2× coins |
| Kumul | Inherits flight/magnet, single 2-damage fireball, 3× coins |
| Kristal | Twin 3-damage piercing shots, one shield, 4× coins |
| Nova | Twin 6-damage plasma, two shields, shorter cooldown, 5× coins |

Fire: touch HUD button or F. Flight: tap sky, Space, ArrowUp. Shields grant 1.4s invulnerability; ceiling/floor recovery returns the bird to safe bounds. Bosses follow every adventure gate target. Early characters receive a temporary 1-damage shot during bosses to avoid progression deadlocks. Cracked walls start in world 2, every fourth gate; positioned in the lower gap so early characters can avoid them. Destroying walls never bypasses gate counts or awards duplicate rewards.

Boss telegraphs target lane for 1100ms, then fires once in a 180ms attack window, recovers for 1700ms. Below half health, the next windup enters phase 2: split volley, 1360ms recovery. Every attack renews its action ID. Hits are resolved once per projectile/target. Boss defeat clears hostile shots; player collision still takes precedence over victory in the same simulation frame. All combat clocks are advanced only during active play. The pool holds 48 projectiles and refuses a twin volley atomically when full.

## Scope / explicit adaptations

This is a 2D flying sentinel, not a rigged Three.js creature. CombatModel owns runtime/hurtboxes; CombatView owns the procedural silhouette/core/wings and targeting line. 3D meter axes, navigation, skeleton sockets and LOD checks do not apply; full 3D monster-contract conformance is not claimed. Boss definitions currently share one sentinel archetype with world-specific health/name and two attack phases. No copied Nintendo sounds or graphics. No backend, remote font or analytics.

HUD uses stable semantic DOM nodes with glass surfaces, icon labels, animated coin total, boss health progress and an active-time fire cooldown. Controls remain at least 48px, and decorative animations respect reduced motion. Locked equipment explains unlock requirements.

Human phone playtesting and full 20-level balance remain necessary; automated combat fixtures are not evidence of subjective game quality or real-device frame rate. Deployment is a separate release step.

## Validation evidence

36 unit tests passed (combat pool exhaustion/contact idempotence/phase windows/shield reset/character progression, plus existing save and level tests). Chromium fixtures cover a real gate run followed by basic-character boss victory using telegraph-aware input, collision priority, cooldown/projectile freeze on pause, actual cracked-wall destruction, 48 pooled slots and zero voices after mute. Mobile viewport checks additionally assert the top HUD is visible (a focus-induced hidden-parent scroll bug was fixed with overflow: clip). Images: docs/evidence/combat-hud.png and H-flight.png. These are local controlled fixtures, not real phone benchmarks.
