# Wing audio fix

User-reported missing flap feedback investigated using the installed build-game-audio-feedback skill and drahulsingh/Flappy-Bird@a20a085ad9bad889cee4895bc3399f4a8bf131bd. That reference contains point/hit WAV files, but no wing sound. Copied those two files unchanged, with MIT notice. BootScene preloads/decodes them before the menu; failed audio assets retain synthesized fallback cues. Build-time SW manifest includes these local assets.

Wing synthesis changed from a quiet 160Hz bass transient to a 780Hz descending 135ms sine chirp at a stronger level, suitable for small speakers. This is original generated audio, not an imported Nintendo recording. The mix still has a compressor and mute control.

Two of the 12 voice slots are reserved for wing feedback. Other cues cannot evict those slots. Very rapid input replaces the oldest wing tail, not a new accepted flap. Ten other slots retain critical-cue priority. Stop/mute/pause/shutdown disconnect and clear all voices.

Native pointerdown and keydown capture handlers unlock/warm the shared Phaser AudioContext before Phaser defers input to its next animation frame. No second AudioContext is created. Scene-level resume remains as a fallback. User mute preference remains respected.

Chromium regression verifies: five accepted real canvas taps start five wing sources; first tap resumes an explicitly suspended context; decoded point/hit buffers are actually used; new wing PCM RMS exceeds 0.15; a saturated warning mix still starts each of three new wing cues while remaining at 12 voices; mute stops every voice and suppresses further cues. Existing combat/pause/restart tests rerun. These checks verify source scheduling and sample content, not the user's physical speaker or Safari hardware behavior.
