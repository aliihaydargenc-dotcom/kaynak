# Flappy Evolution — game design system
UI/UX Pro Max read at mola-app@f4ec62b21fcdd40916bf32d14085a865dba58887, .agents/skills/ui-ux-pro-max. Ran `search.py 'mobile arcade game playful' --design-system -p 'Flappy Evolution'`.
Search result: Pixel Art / Hero-Centric, neon red/blue/green, Press Start/VT323. The game fit is partial: frame animation and playful arcade feedback retained. Landing-page conversion sections, sticky sales CTA, marquee, blinking text and Google font imports rejected. Phaser is not an available stack in that dataset. The following are manually reviewed Phaser/semantic HTML adaptations, not claims of a Phaser-specific database match.

## Identity
Warm illustrated sky explorers: ink teal #102e32, ivory #f9f4df, muted sage #b9cfc6, gold #f4ca75. Main surface opaque to keep contrast stable. Filiz: botanical arcs; Kumul: sandstone masonry; Kristal: faceted pillars; Nova: orbit islands. Characters have new 72×64 drawing paths and crest/wing forms; all retain upstream hitbox dimensions/anchors.
System UI fonts only. Body 16 px, headings 30–48 px, labels 12–14 px. Single stroke 24px SVG icon family. No emoji navigation.

## Interaction
Visible buttons/selects at least 48×48 CSS px, gap at least 8px. 120ms press/hover feedback, no gameplay delay. Panels scroll vertically. Native HTML buttons, visible 3px gold focus ring, dialog focus trap, canvas inert behind menus, focus returns to flight after resume. DOM handles do not bubble to Phaser canvas input.
One primary action per panel. Results show stars, earned coins, XP and gate/physical-coin counts. Locked levels state the predecessor requirement, not only a color.
Shell respects safe-area and 100dvh, 480×854 FIT game space. Landscape letterboxing; no forced zoom restriction. Fullscreen/orientation user-initiated and optional.

## Motion/audio
Phaser AnimationManager plays the original three textures in a four-step 2→1→0→1 wing cycle at 85ms per frame; each flap restarts at the raised wing. Pause freezes the animation and collision stops it. Separate short-lived tween objects provide flap rings and reward bursts without scaling or moving the Bird. Cosmetic XP ring and trails never alter Bird bounds. Reduced motion uses stored system/on/off setting and disables decorative parallax/trails/rings/bursts/camera shake and CSS transitions; gameplay obstacle motion remains. Mute persists, gains disconnected on scene shutdown, oscillators stopped on pause and finish.
Real-time gameplay screen-reader equivalence is not claimed. Menus, instructions, results and control names are semantic HTML.
