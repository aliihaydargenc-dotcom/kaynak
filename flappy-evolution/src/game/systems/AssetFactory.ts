import Phaser from "phaser";
export const WORLD_PALETTES = [
  ["#edf7db", "#aedacb", "#4b8f78", "#24594f"],
  ["#ffe7bb", "#e6b37f", "#b77452", "#77463b"],
  ["#e9f7ff", "#b8d6ef", "#779ac4", "#40587e"],
  ["#101c39", "#273968", "#655f9c", "#bfc6ed"],
];
// All drawing paths authored for Flappy Evolution. 72×64 character canvases
// deliberately preserve the upstream rotated-bounds hitbox envelope.
export class AssetFactory {
  static create(scene: Phaser.Scene): void {
    const make = (
      key: string,
      w: number,
      h: number,
      draw: (c: CanvasRenderingContext2D) => void,
    ): void => {
      if (scene.textures.exists(key)) return;
      const texture = scene.textures.createCanvas(key, w, h)!;
      draw(texture.context);
      texture.refresh();
    };
    for (let world = 1; world <= 4; world++) {
      make(`world-${world}`, 480, 854, (c) => this.world(c, world));
      make(`landscape-${world}`, 960, 250, (c) => this.landscape(c, world));
      make(`pipe-body-${world}`, 96, 520, (c) => this.pillar(c, world));
      make(`pipe-cap-${world}`, 108, 24, (c) => {
        const p = WORLD_PALETTES[world - 1];
        c.fillStyle = p[3];
        c.beginPath();
        c.roundRect(0, 0, 108, 24, world === 3 ? 2 : 8);
        c.fill();
        c.fillStyle = p[1];
        c.fillRect(8, 3, 92, 5);
        c.fillStyle = p[2];
        for (let x = 12; x < 104; x += 20) {
          c.beginPath();
          c.arc(x, 16, 3, 0, Math.PI * 2);
          c.fill();
        }
      });
    }
    for (const [index, id] of [
      "spark",
      "sprout",
      "dune",
      "crystal",
      "nova",
    ].entries())
      for (let frame = 0; frame < 3; frame++)
        make(`bird-${id}-${frame}`, 72, 64, (c) => this.bird(c, index, frame));
    make("coin", 64, 64, (c) => {
      c.fillStyle = "#8a522e";
      c.beginPath();
      c.arc(32, 34, 28, 0, 7);
      c.fill();
      const g = c.createLinearGradient(10, 4, 48, 54);
      g.addColorStop(0, "#fff2b6");
      g.addColorStop(1, "#eab55e");
      c.fillStyle = g;
      c.beginPath();
      c.arc(32, 30, 27, 0, 7);
      c.fill();
      c.strokeStyle = "#9e6635";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(32, 30, 19, 0, 7);
      c.stroke();
      c.fillStyle = "#8a522e";
      this.star(c, 32, 30, 12, 6);
    });
  }
  private static star(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    inner: number,
  ): void {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2,
        rr = i % 2 ? inner : r;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
  }
  private static bird(
    c: CanvasRenderingContext2D,
    skin: number,
    frame: number,
  ): void {
    const colors = ["#f6c76d", "#a8d785", "#e4af7f", "#afdbef", "#bab0f4"];
    const y = [38, 31, 22][frame];
    c.strokeStyle = "#203e43";
    c.lineWidth = 2.5;
    c.lineJoin = "round";
    // Tail fan and rounded body, with distinct silhouettes/details for each character.
    c.fillStyle = ["#dc7955", "#588b65", "#b56a4f", "#688fcc", "#7f77bc"][skin];
    c.beginPath();
    c.moveTo(22, 35);
    c.lineTo(5, 22);
    c.lineTo(9, 43);
    c.lineTo(24, 45);
    c.fill();
    c.stroke();
    c.fillStyle = colors[skin];
    c.beginPath();
    c.ellipse(38, 34, 25, 21, 0, 0, 7);
    c.fill();
    c.stroke();
    c.fillStyle = "#fff1cf";
    c.beginPath();
    c.ellipse(45, 40, 15, 12, -0.2, 0, 7);
    c.fill();
    c.fillStyle = ["#e59257", "#55996a", "#b57651", "#739dce", "#8982ce"][skin];
    c.beginPath();
    c.moveTo(31, 34);
    c.quadraticCurveTo(6, y - 17, 17, y);
    c.quadraticCurveTo(19, y + 14, 37, 41);
    c.closePath();
    c.fill();
    c.stroke();
    if (skin === 0) {
      c.fillStyle = "#ec895a";
      c.beginPath();
      c.moveTo(31, 15);
      c.quadraticCurveTo(23, 1, 38, 10);
      c.quadraticCurveTo(41, 0, 46, 15);
      c.fill();
    }
    if (skin === 1) {
      c.fillStyle = "#68a15e";
      c.beginPath();
      c.moveTo(38, 15);
      c.quadraticCurveTo(24, -1, 48, 7);
      c.quadraticCurveTo(55, 13, 38, 15);
      c.fill();
      c.stroke();
    }
    if (skin === 2) {
      c.fillStyle = "#f9d89b";
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(30 + i * 7, 15);
        c.lineTo(29 + i * 7, 3 + i * 2);
        c.lineTo(39 + i * 6, 16);
        c.fill();
        c.stroke();
      }
    }
    if (skin === 3) {
      c.fillStyle = "#e2faff";
      c.beginPath();
      c.moveTo(30, 15);
      c.lineTo(36, 1);
      c.lineTo(43, 15);
      c.lineTo(50, 6);
      c.lineTo(53, 20);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = "#d9f8ff";
      c.beginPath();
      c.moveTo(20, 31);
      c.lineTo(29, 24);
      c.lineTo(33, 38);
      c.closePath();
      c.fill();
    }
    if (skin === 4) {
      c.fillStyle = "#f8e3a2";
      this.star(c, 38, 12, 11, 5);
      c.stroke();
      c.fillStyle = "#fff5dc";
      this.star(c, 24, 32, 6, 3);
    }
    c.fillStyle = "#f9da83";
    c.beginPath();
    c.moveTo(59, 29);
    c.lineTo(71, 35);
    c.lineTo(59, 39);
    c.fill();
    c.stroke();
    c.fillStyle = "#17333a";
    c.beginPath();
    c.ellipse(50, 27, 3.8, 5, 0, 0, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(51, 25, 1.4, 0, 7);
    c.fill();
  }
  private static pillar(c: CanvasRenderingContext2D, w: number): void {
    const p = WORLD_PALETTES[w - 1];
    const g = c.createLinearGradient(0, 0, 96, 0);
    g.addColorStop(0, p[3]);
    g.addColorStop(0.45, p[2]);
    g.addColorStop(1, p[3]);
    c.fillStyle = g;
    c.fillRect(0, 0, 96, 520);
    c.strokeStyle = p[1];
    c.lineWidth = 3;
    if (w === 1) {
      for (let y = 15; y < 520; y += 55) {
        c.beginPath();
        c.moveTo(48, y);
        c.bezierCurveTo(9, y + 7, 86, y + 32, 45, y + 55);
        c.stroke();
        c.fillStyle = "#83bb87";
        c.beginPath();
        c.ellipse(38, y + 19, 16, 6, -0.5, 0, 7);
        c.fill();
      }
    }
    if (w === 2) {
      for (let y = 25; y < 520; y += 58) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(96, y + 7);
        c.moveTo(y % 2 ? 30 : 60, y);
        c.lineTo(y % 2 ? 28 : 64, y + 58);
        c.stroke();
      }
      c.globalAlpha = 0.25;
      c.fillStyle = "#ffe6b4";
      c.fillRect(12, 0, 12, 520);
      c.globalAlpha = 1;
    }
    if (w === 3) {
      for (let y = -70; y < 520; y += 130) {
        c.fillStyle = y % 3 ? "#8cb7d3" : "#c9e9ec";
        c.beginPath();
        c.moveTo(10, y);
        c.lineTo(70, y + 30);
        c.lineTo(36, y + 150);
        c.lineTo(12, y + 120);
        c.fill();
        c.stroke();
      }
    }
    if (w === 4) {
      c.fillStyle = "#a0a0d0";
      for (let y = 22; y < 520; y += 64) {
        this.star(c, 48, y, 9, 3);
        c.beginPath();
        c.moveTo(17, y + 28);
        c.lineTo(79, y + 28);
        c.stroke();
      }
      c.fillStyle = "#5c5b8c";
      c.fillRect(7, 0, 7, 520);
    }
  }
  private static world(c: CanvasRenderingContext2D, w: number): void {
    const p = WORLD_PALETTES[w - 1],
      g = c.createLinearGradient(0, 0, 0, 854);
    g.addColorStop(0, p[0]);
    g.addColorStop(1, p[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, 480, 854);
    c.fillStyle = w === 4 ? "#d1d1f4" : "#fff0bc";
    c.beginPath();
    c.arc(374, 186, w === 4 ? 43 : 65, 0, 7);
    c.fill();
    if (w === 4) {
      c.strokeStyle = "#7177a3";
      c.lineWidth = 8;
      c.beginPath();
      c.ellipse(374, 186, 75, 14, -0.35, 0, 7);
      c.stroke();
      c.fillStyle = "#ded9ff";
      for (let i = 0; i < 48; i++) {
        const x = (i * 137 + 23) % 480,
          y = (i * 73 + 20) % 640;
        c.beginPath();
        c.arc(x, y, i % 3 === 0 ? 2 : 1, 0, 7);
        c.fill();
      }
    } else {
      c.fillStyle = "#ffffff70";
      for (let i = 0; i < 5; i++) {
        c.beginPath();
        c.ellipse(i * 132 - 30, 130 + (i % 2) * 90, 80, 18, 0, 0, 7);
        c.fill();
      }
    }
    c.fillStyle = p[2];
    c.globalAlpha = 0.25;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.moveTo(i * 120 - 60, 750);
      c.lineTo(i * 120 + 40, 410 + (i % 3) * 50);
      c.lineTo(i * 120 + 180, 750);
      c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = p[3];
    c.fillRect(0, 750, 480, 104);
    c.fillStyle = p[2];
    c.fillRect(0, 750, 480, 8);
    c.fillStyle = p[1];
    for (let i = 0; i < 25; i++) {
      c.beginPath();
      c.ellipse(i * 21, 768 + (i % 3) * 18, 3, 2, 0, 0, 7);
      c.fill();
    }
  }
  private static landscape(c: CanvasRenderingContext2D, w: number): void {
    const p = WORLD_PALETTES[w - 1];
    c.fillStyle = p[2];
    c.globalAlpha = 0.5;
    for (let i = 0; i < 12; i++) {
      const x = i * 88,
        y = 50 + (i % 3) * 35;
      c.beginPath();
      c.moveTo(x - 60, 250);
      if (w === 3) {
        c.lineTo(x + 20, y);
        c.lineTo(x + 100, 250);
      } else {
        c.bezierCurveTo(x - 35, y, x + 45, y, x + 130, 250);
      }
      c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = p[3];
    for (let i = 0; i < 11; i++) {
      const x = i * 100 + 15,
        y = 110 + (i % 3) * 25;
      if (w === 1) {
        c.fillRect(x, y, 7, 140);
        c.beginPath();
        c.ellipse(x + 3, y, 30, 53, -0.2, 0, 7);
        c.fill();
      } else if (w === 2) {
        c.fillRect(x, y + 30, 18, 160);
        c.fillRect(x - 7, y + 20, 32, 12);
      } else if (w === 3) {
        c.beginPath();
        c.moveTo(x, 250);
        c.lineTo(x - 20, y + 35);
        c.lineTo(x + 10, y);
        c.lineTo(x + 35, y + 80);
        c.lineTo(x + 20, 250);
        c.fill();
      } else {
        c.beginPath();
        c.ellipse(x, y + 90, 45, 12, 0, 0, 7);
        c.fill();
        c.beginPath();
        c.moveTo(x - 36, y + 91);
        c.lineTo(x, y + 145);
        c.lineTo(x + 32, y + 91);
        c.fill();
      }
    }
  }
}
