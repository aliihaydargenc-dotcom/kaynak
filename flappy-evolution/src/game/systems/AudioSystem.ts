import Phaser from "phaser";
import { ZZFX } from "../../vendor/zzfx.js";
type Cue =
  | "flap"
  | "score"
  | "coin"
  | "hit"
  | "unlock"
  | "fire"
  | "break"
  | "boss"
  | "warning";
// Original ZzFX recipes. Coin notes are B5 (987.77 Hz) → E6 (1318.51 Hz).
const recipes: Record<Cue, number[][]> = {
  flap: [[0.72, 0, 780, 0.002, 0.018, 0.115, 0, 1, -5]],
  score: [[0.16, 0, 660, 0.003, 0.02, 0.08, 0]],
  coin: [
    [0.34, 0, 987.77, 0.003, 0.025, 0.09, 1],
    [0.28, 0, 1318.51, 0.003, 0.035, 0.18, 1],
  ],
  hit: [[0.55, 0, 110, 0.002, 0.08, 0.25, 3, 1, -1]],
  unlock: [
    [0.3, 0, 523.25, 0.008, 0.08, 0.3, 1],
    [0.3, 0, 659.25, 0.008, 0.08, 0.3, 1],
    [0.3, 0, 783.99, 0.008, 0.08, 0.35, 1],
  ],
  fire: [[0.28, 0, 420, 0.003, 0.035, 0.13, 2, 1, -8]],
  break: [[0.45, 0, 80, 0.002, 0.06, 0.22, 3, 1, -0.7]],
  boss: [[0.38, 0, 190, 0.003, 0.025, 0.12, 2, 1, -3]],
  warning: [
    [0.23, 0, 440, 0.01, 0.1, 0.12, 1],
    [0.23, 0, 550, 0.01, 0.1, 0.12, 1],
  ],
};
export class AudioSystem {
  private context: AudioContext | null;
  private gain: GainNode | null = null;
  private voices = new Map<AudioBufferSourceNode, number>();
  private flightVoices = new Set<AudioBufferSourceNode>();
  private buffers = new Map<Cue, AudioBuffer[]>();
  private _enabled = true;
  get enabled(): boolean {
    return this._enabled;
  }
  set enabled(value: boolean) {
    this._enabled = value;
    if (!value) this.stop();
  }
  constructor(scene: Phaser.Scene) {
    this.context =
      (scene.sound as Phaser.Sound.WebAudioSoundManager).context ?? null;
    if (!this.context) return;
    this.gain = this.context.createGain();
    this.gain.gain.value = 0.55;
    const limiter = this.context.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 8;
    this.gain.connect(limiter);
    limiter.connect(this.context.destination);
    this.limiter = limiter;
    for (const [cue, sounds] of Object.entries(recipes)) {
      this.buffers.set(
        cue as Cue,
        sounds.map((params) => {
          const samples = ZZFX.buildSamples(...params);
          const buffer = this.context!.createBuffer(
            1,
            samples.length,
            ZZFX.sampleRate,
          );
          buffer.getChannelData(0).set(samples);
          return buffer;
        }),
      );
    }
    for (const [cue, key] of [
      ["score", "classic-point"],
      ["hit", "classic-hit"],
    ] as const) {
      const buffer = scene.cache.audio.get(key) as AudioBuffer | undefined;
      if (buffer?.getChannelData) this.buffers.set(cue, [buffer]);
    }
  }
  private limiter?: DynamicsCompressorNode;
  resume(): void {
    if (this.enabled) unlockAudio(this.context);
  }
  flap(): void {
    this.play("flap", 0);
  }
  score(): void {
    this.play("score", 1);
  }
  coin(): void {
    this.play("coin", 2);
  }
  hit(): void {
    this.play("hit", 3);
  }
  unlock(): void {
    this.play("unlock", 3);
  }
  fire(): void {
    this.play("fire", 1);
  }
  break(): void {
    this.play("break", 2);
  }
  boss(): void {
    this.play("boss", 2);
  }
  warning(): void {
    this.play("warning", 3);
  }
  private play(cue: Cue, priority: number): void {
    if (!this.enabled || !this.context || !this.gain) return;
    this.buffers.get(cue)?.forEach((buffer, index) => {
      // Keep two slots exclusively for immediate wing feedback. Other cues
      // never evict wings; repeated taps can replace the oldest wing tail.
      const flight = cue === "flap";
      const otherCount = this.voices.size - this.flightVoices.size;
      if (
        (flight && this.flightVoices.size >= 2) ||
        (!flight && otherCount >= 10)
      ) {
        const victim = [...this.voices].find(([node, p]) =>
          flight
            ? this.flightVoices.has(node)
            : !this.flightVoices.has(node) && p <= priority,
        );
        if (!victim) return;
        victim[0].stop();
        victim[0].disconnect();
        this.flightVoices.delete(victim[0]);
        this.voices.delete(victim[0]);
      }
      const source = this.context!.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gain!);
      this.voices.set(source, priority);
      if (flight) this.flightVoices.add(source);
      source.onended = () => {
        source.disconnect();
        this.voices.delete(source);
        this.flightVoices.delete(source);
      };
      source.start(
        this.context!.currentTime + index * (cue === "coin" ? 0.065 : 0.1),
      );
    });
  }
  stop(): void {
    for (const source of this.voices.keys()) {
      try {
        source.stop();
      } catch {}
      source.disconnect();
    }
    this.voices.clear();
    this.flightVoices.clear();
  }
  dispose(): void {
    this.stop();
    this.gain?.disconnect();
    this.limiter?.disconnect();
    this.buffers.clear();
    this.gain = null;
  }
}

// Called in native capture listeners, before Phaser defers input to its frame.
// This also warms iOS audio synchronously within the user-gesture stack.
export function unlockAudio(context: AudioContext | null): void {
  if (!context || context.state === "closed") return;
  if (context.state !== "running") void context.resume().catch(() => {});
  if (warmed.has(context)) return;
  try {
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    source.connect(context.destination);
    source.onended = () => source.disconnect();
    source.start();
    warmed.add(context);
  } catch {
    /* Audio-disabled browsers still support silent play. */
  }
}
const warmed = new WeakSet<AudioContext>();
