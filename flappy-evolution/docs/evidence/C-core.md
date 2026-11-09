# C — shared run core and input
One PlayScene/Bird/ObstacleSystem for both modes. Bird's physics and getHitbox implementation retained. Rectangle collision geometry retained from upstream. Reward collection moved after collision; finishRun seals one frozen summary and disables physics. No post-death obstacle updates.
480×854 FIT/CENTER_BOTH, safe area / 100dvh shell; DOM controls outside canvas. Keyboard repeats ignored; pause, blur and visibility freeze world, obstacle clock, wind, audio and tweens. Manual resume has a three-second countdown. SHUTDOWN removes all external listeners, timers and tweens; gain disconnected.
A Canvas renderer diagnostic switch is available as ?canvas because software WebGL on the shared Linux machine rendered too slowly for useful wall-clock baseline evidence. It does not change physics. Default renderer remains Phaser.AUTO.
Automated lifecycle assertions live in e2e/lifecycle.spec.ts; final actual results are in H-report.md.
