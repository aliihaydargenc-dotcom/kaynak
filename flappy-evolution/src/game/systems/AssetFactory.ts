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
      make(`clouds-${world}`, 960, 380, (c) => this.clouds(c, world));
      make(`ridges-${world}`, 960, 420, (c) => this.ridges(c, world));
      make(`foreground-${world}`, 960, 108, (c) => this.foreground(c, world));
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
      for (let frame = 0; frame < 3; frame++) {
        make(`bird-${id}-${frame}`, 72, 64, (c) => this.bird(c, index, frame));
        make(`portrait-${id}-${frame}`, 288, 256, (c) => {
          c.scale(4, 4);
          this.bird(c, index, frame);
        });
      }
    make("fireball", 32, 32, (c) => {
      const g = c.createRadialGradient(16, 16, 2, 16, 16, 16);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.25, "#ffffff");
      g.addColorStop(0.55, "#ffffffb0");
      g.addColorStop(1, "#ffffff00");
      c.fillStyle = g;
      c.fillRect(0, 0, 32, 32);
    });
    make("cracked-wall", 42, 76, (c) => {
      c.fillStyle = "#714c59";
      c.strokeStyle = "#ffca89";
      c.lineWidth = 3;
      c.beginPath();
      c.roundRect(2, 2, 38, 72, 7);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(25, 2);
      c.lineTo(16, 26);
      c.lineTo(30, 36);
      c.lineTo(12, 52);
      c.lineTo(20, 74);
      c.stroke();
      c.fillStyle = "#ffd9a0";
      this.star(c, 21, 38, 8, 4);
    });
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
    const palettes = [
      ["#ffc75b", "#e67539", "#fff3c9"],
      ["#9cd768", "#398269", "#eef9c5"],
      ["#efb37c", "#a85550", "#ffe1a8"],
      ["#a4e9ff", "#5680be", "#ecffff"],
      ["#c8acff", "#7256b0", "#fff0ff"],
    ];
    const [body, shade, cream] = palettes[skin];
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "#263d52";
    c.lineWidth = 2;
    // Same 72x64 envelope and origin as physics baseline. Art never changes scale.
    c.fillStyle = shade;
    c.beginPath();
    c.moveTo(22, 34);
    c.lineTo(4, 26);
    c.lineTo(8, 39);
    c.lineTo(3, 44);
    c.quadraticCurveTo(15, 50, 27, 43);
    c.fill();
    c.stroke();
    const g = c.createLinearGradient(20, 12, 48, 57);
    g.addColorStop(0, cream);
    g.addColorStop(0.3, body);
    g.addColorStop(1, shade);
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(38, 34, 25, 21, -0.1, 0, 7);
    c.fill();
    c.stroke();
    c.fillStyle = cream;
    c.beginPath();
    c.ellipse(46, 42, 14, 11, -0.2, 0, 7);
    c.fill();
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(28, 16);
    c.quadraticCurveTo(25, 3, 37, 11);
    c.quadraticCurveTo(41, 1, 47, 14);
    c.fill();
    c.stroke();
    if (skin === 1) {
      c.fillStyle = "#62b368";
      c.beginPath();
      c.moveTo(36, 13);
      c.quadraticCurveTo(28, -2, 49, 5);
      c.quadraticCurveTo(51, 13, 36, 13);
      c.fill();
      c.stroke();
    }
    if (skin === 2) {
      c.fillStyle = "#e86464";
      c.beginPath();
      c.moveTo(23, 21);
      c.quadraticCurveTo(42, 5, 59, 24);
      c.lineTo(54, 29);
      c.quadraticCurveTo(40, 15, 25, 28);
      c.fill();
    }
    if (skin >= 3) {
      c.fillStyle = cream;
      for (let j = 0; j < 3; j++) {
        c.beginPath();
        c.moveTo(29 + j * 7, 16);
        c.lineTo(32 + j * 7, 3 + (j % 2) * 4);
        c.lineTo(39 + j * 7, 17);
        c.fill();
        c.stroke();
      }
    }
    c.fillStyle = shade;
    const wy = [40, 28, 17][frame];
    c.beginPath();
    c.moveTo(34, 32);
    c.bezierCurveTo(11, wy - 14, 7, wy + 2, 17, wy + 10);
    c.quadraticCurveTo(24, wy + 16, 38, 40);
    c.fill();
    c.stroke();
    c.strokeStyle = body;
    c.lineWidth = 2;
    for (let j = 0; j < 3; j++) {
      c.beginPath();
      c.moveTo(18 + j * 4, wy + 3);
      c.lineTo(27 + j * 3, wy + 8);
      c.stroke();
    }
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(50, 27, 8, 10, -0.05, 0, 7);
    c.fill();
    c.fillStyle = "#223c51";
    c.beginPath();
    c.ellipse(53, 28, 4, 6, 0, 0, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(54, 25, 1.8, 0, 7);
    c.fill();
    c.fillStyle = "#f29a5e";
    c.beginPath();
    c.ellipse(53, 39, 4, 2, 0, 0, 7);
    c.fill();
    c.strokeStyle = "#583c42";
    c.lineWidth = 1.5;
    c.fillStyle = "#ffbd5f";
    c.beginPath();
    c.moveTo(59, 32);
    c.quadraticCurveTo(73, 33, 65, 39);
    c.lineTo(59, 39);
    c.closePath();
    c.fill();
    c.stroke();
    c.strokeStyle = "#fff6ce";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(38, 30, 19, 3.6, 4.6);
    c.stroke();
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
    const skies = [
      ["#367f9c", "#b2d5bc", "#f9e9ac"],
      ["#846eaa", "#e9ac9c", "#ffe4a7"],
      ["#3c6694", "#a8d8e6", "#f0f8e8"],
      ["#151d48", "#514b82", "#bf93b9"],
    ][w - 1];
    const g = c.createLinearGradient(0, 0, 0, 854);
    g.addColorStop(0, skies[0]);
    g.addColorStop(0.58, skies[1]);
    g.addColorStop(1, skies[2]);
    c.fillStyle = g;
    c.fillRect(0, 0, 480, 854);
    const glow = c.createRadialGradient(355, 210, 10, 355, 210, 190);
    glow.addColorStop(0, "#fff3bcaa");
    glow.addColorStop(1, "#fff3bc00");
    c.fillStyle = glow;
    c.fillRect(0, 0, 480, 600);
    c.fillStyle = w === 4 ? "#f6dcf5" : "#fff1bc";
    c.beginPath();
    c.arc(355, 210, w === 4 ? 33 : 48, 0, 7);
    c.fill();
    if (w === 4) {
      c.fillStyle = "#fff";
      for (let i = 0; i < 65; i++) {
        c.globalAlpha = 0.25 + (i % 4) * 0.18;
        c.beginPath();
        c.arc(
          (i * 137) % 480,
          25 + ((i * 67) % 550),
          i % 7 === 0 ? 2 : 1,
          0,
          7,
        );
        c.fill();
      }
      c.globalAlpha = 1;
      c.strokeStyle = "#d1b6df";
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(355, 210, 60, 11, -0.4, 0, 7);
      c.stroke();
    }
    // Sunbeams stay below high-contrast game objects.
    c.fillStyle = "#fff8d5";
    c.globalAlpha = 0.06;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(355, 175);
      c.lineTo(i * 180 - 250, 854);
      c.lineTo(i * 180 - 140, 854);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  private static clouds(c: CanvasRenderingContext2D, w: number): void {
    c.fillStyle = w === 4 ? "#d6bce3" : "#fff7e4";
    for (let i = 0; i < 8; i++) {
      const x = i * 135 + 35,
        y = 75 + (i % 3) * 81;
      c.globalAlpha = w === 4 ? 0.12 : 0.35;
      c.beginPath();
      c.ellipse(x, y, 68, 12, 0, 0, 7);
      c.ellipse(x - 20, y - 9, 24, 17, 0, 0, 7);
      c.ellipse(x + 12, y - 12, 32, 22, 0, 0, 7);
      c.fill();
    }
    c.globalAlpha = 1;
  }
  private static ridges(c: CanvasRenderingContext2D, w: number): void {
    const colors = [
      ["#8cbda8", "#629c91"],
      ["#c38c92", "#b07681"],
      ["#91b6cc", "#7199b8"],
      ["#817aa6", "#605d8e"],
    ][w - 1];
    for (let layer = 0; layer < 2; layer++) {
      c.fillStyle = colors[layer];
      c.beginPath();
      c.moveTo(0, 420);
      for (let i = -1; i < 10; i++) {
        const x = i * 130,
          y = 130 + layer * 95 + (i % 3) * 38;
        if (w === 3) {
          c.lineTo(x, y + 95);
          c.lineTo(x + 65, y);
          c.lineTo(x + 130, y + 95);
        } else {
          c.quadraticCurveTo(x + 55, y - 50, x + 130, y + 60);
        }
      }
      c.lineTo(960, 420);
      c.fill();
    }
    if (w === 3) {
      c.fillStyle = "#e7f6ef";
      for (let i = 0; i < 8; i++) {
        const x = i * 130 + 65,
          y = 130 + (i % 3) * 38;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x - 26, y + 40);
        c.lineTo(x - 3, y + 27);
        c.lineTo(x + 12, y + 38);
        c.lineTo(x + 28, y + 42);
        c.fill();
      }
    }
  }
  private static foreground(c: CanvasRenderingContext2D, w: number): void {
    const colors = [
      ["#285b58", "#163f48", "#9ac284"],
      ["#af7162", "#795261", "#edbd8b"],
      ["#6b9fbb", "#3c638b", "#c8edec"],
      ["#57577f", "#343b66", "#d2addb"],
    ][w - 1];
    const g = c.createLinearGradient(0, 0, 0, 108);
    g.addColorStop(0, colors[0]);
    g.addColorStop(1, colors[1]);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, 25);
    for (let x = 0; x <= 960; x += 30) c.lineTo(x, 20 + Math.sin(x * 0.03) * 7);
    c.lineTo(960, 108);
    c.lineTo(0, 108);
    c.fill();
    c.strokeStyle = colors[2];
    c.lineWidth = 2;
    c.globalAlpha = 0.35;
    for (let x = 0; x < 960; x += 25) {
      c.beginPath();
      c.moveTo(x, 25);
      c.quadraticCurveTo(x + 6, 9, x + 12, 12);
      c.stroke();
    }
    c.globalAlpha = 1;
    c.fillStyle = colors[1];
    for (let x = 0; x < 960; x += 77) {
      c.beginPath();
      c.ellipse(x, 80, 31, 12, -0.4, 0, 7);
      c.fill();
    }
  }
  private static landscape(c: CanvasRenderingContext2D, w: number): void {
    const p = [
      ["#477f71", "#32645e", "#84b47f"],
      ["#b88372", "#925f68", "#d9ab84"],
      ["#6599b6", "#477c9e", "#bbdedc"],
      ["#6e6592", "#494e79", "#b8a0ce"],
    ][w - 1];
    c.fillStyle = p[0];
    c.beginPath();
    c.moveTo(0, 250);
    for (let x = 0; x <= 1000; x += 80)
      c.quadraticCurveTo(x - 20, 155 + Math.sin(x) * 25, x + 80, 195);
    c.lineTo(960, 250);
    c.fill();
    for (let i = -1; i < 15; i++) {
      const x = i * 78 + 35,
        y = 70 + ((i * 37) % 75);
      c.fillStyle = p[1];
      if (w === 1) {
        c.fillRect(x - 4, y, 8, 160);
        for (let j = 0; j < 3; j++) {
          c.fillStyle = j === 0 ? p[0] : p[1];
          c.beginPath();
          c.ellipse(
            x + (j - 1) * 14,
            y + j * 14,
            25 - j * 2,
            40,
            -0.25 + j * 0.2,
            0,
            7,
          );
          c.fill();
        }
        c.fillStyle = p[2];
        c.globalAlpha = 0.3;
        c.beginPath();
        c.ellipse(x - 10, y - 10, 12, 22, -0.2, 0, 7);
        c.fill();
        c.globalAlpha = 1;
      } else if (w === 2) {
        c.beginPath();
        c.moveTo(x - 25, 250);
        c.lineTo(x - 17, y + 20);
        c.lineTo(x + 12, y);
        c.lineTo(x + 30, y + 65);
        c.lineTo(x + 34, 250);
        c.fill();
        c.strokeStyle = p[2];
        c.lineWidth = 3;
        for (let j = 0; j < 3; j++) {
          c.beginPath();
          c.moveTo(x - 15, y + 45 + j * 35);
          c.lineTo(x + 24, y + 55 + j * 35);
          c.stroke();
        }
      } else if (w === 3) {
        c.beginPath();
        c.moveTo(x - 25, 250);
        c.lineTo(x - 21, y + 35);
        c.lineTo(x + 2, y);
        c.lineTo(x + 25, y + 36);
        c.lineTo(x + 32, 250);
        c.fill();
        c.fillStyle = p[2];
        c.beginPath();
        c.moveTo(x + 2, y);
        c.lineTo(x - 7, 250);
        c.lineTo(x + 10, 240);
        c.fill();
      } else {
        c.beginPath();
        c.ellipse(x, y + 40, 35, 10, 0, 0, 7);
        c.moveTo(x - 34, y + 42);
        c.lineTo(x, y + 100);
        c.lineTo(x + 34, y + 42);
        c.fill();
        c.strokeStyle = p[2];
        c.lineWidth = 2;
        c.beginPath();
        c.ellipse(x, y + 37, 33, 7, 0, 0, 7);
        c.stroke();
      }
    }
  }
}
