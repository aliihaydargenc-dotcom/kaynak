import Phaser from "phaser";
// Oscillator/gain envelope technique adapted from the MIT upstream; new tone recipes.
export class AudioSystem {
  private context: AudioContext | null;
  private gain: GainNode | null = null;
  private voices = new Set<OscillatorNode>();
  public enabled = true;
  constructor(scene: Phaser.Scene) {
    this.context =
      (scene.sound as Phaser.Sound.WebAudioSoundManager).context ?? null;
    if (this.context) {
      this.gain = this.context.createGain();
      this.gain.gain.value = 0.3;
      this.gain.connect(this.context.destination);
    }
  }
  public resume(): void {
    void this.context?.resume().catch(() => {});
  }
  public flap(): void {
    this.tone(360, 570, 0.07, "sine");
  }
  public score(): void {
    this.tone(620, 830, 0.11, "triangle");
  }
  public coin(): void {
    this.tone(980, 1460, 0.09, "sine");
  }
  public hit(): void {
    this.tone(170, 55, 0.18, "triangle");
  }
  public unlock(): void {
    this.tone(520, 1040, 0.25, "sine");
  }
  public stop(): void {
    for (const osc of this.voices) {
      try {
        osc.stop();
      } catch {}
    }
    this.voices.clear();
  }
  public dispose(): void {
    this.stop();
    this.gain?.disconnect();
    this.gain = null;
  }
  private tone(
    from: number,
    to: number,
    duration: number,
    type: OscillatorType,
  ): void {
    if (!this.enabled || !this.context || !this.gain) return;
    const c = this.context,
      o = c.createOscillator(),
      g = c.createGain(),
      now = c.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(from, now);
    o.frequency.exponentialRampToValueAtTime(to, now + duration);
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.2, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    o.connect(g);
    g.connect(this.gain);
    this.voices.add(o);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
      this.voices.delete(o);
    };
    o.start(now);
    o.stop(now + duration + 0.02);
  }
}
