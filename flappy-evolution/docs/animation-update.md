# Animation and interface update

Phaser 3.90.0 was already pinned in the project. Installed with Node 22 and Yarn 1.22.22 using the existing frozen lockfile; no motor upgrade or new runtime dependency.

Reviewed repositories:
- [phaserjs/phaser, v3.90.0 TweenManager](https://github.com/phaserjs/phaser/blob/v3.90.0/src/tweens/TweenManager.js): scene-owned tweens, easing and completion cleanup for transient feedback objects.
- [phaserjs/examples, legacy 3.86 animation example](https://github.com/phaserjs/examples/blob/master/public/3.86/src/animation/create%20animation%20from%20sprite%20sheet.js): native repeating animation configuration. Uses existing locally generated bird textures, not the example's assets or CDN.

Changes:
- Replaced the manual wing timer with native Phaser animation, four-step raised/down/raised cycle using the original three textures at 85ms per frame. A flap restarts the cycle. Pause and death freeze the animation.
- Added short-lived flap rings and radial coin/gate feedback using separate tweened objects. Death has a brief reduced-motion-aware camera shake. Bird scale, origin, bounds calculation, gravity and flap velocity remain unchanged.
- Added gentle menu illustration movement, breathing orbits and short panel transitions. Existing system and stored reduced-motion rules disable these decorative effects.
- Removed home/map slogans, redundant storage success messages and verbose descriptions. Kept storage failure warnings, locked-level reasons, controls and offline readiness.

Validation (local Chromium, Node 22): 28 unit tests passed; existing 9 browser tests passed, including fixed-input physics baseline and five viewport sizes; new motion regression passed (pause/resume, reduced-motion effects, unchanged flap velocity/bounds). Typecheck and production build passed. These automated checks do not establish subjective animation quality on physical mobile devices.

Production offline check also passed: offline reload, adventure completion, saved unlock and endless retry, with no external requests or browser errors.

No deployment performed. Adjacent dashboard application unchanged.
