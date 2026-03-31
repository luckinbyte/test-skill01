import { PhysicsEngine } from '../core/PhysicsEngine';
import { GameConfig } from '../core/GameConfig';
import { Pep } from './Pep';
import { Bee } from './Bee';

type SpawnCallback = (x: number, y: number) => void;

export class Hive {
  private x: number;
  private y: number;
  private physics: PhysicsEngine;
  private config: GameConfig;

  private spawnTimer: number = 0;
  private spawnedCount: number = 0;
  private maxBees: number;
  private spawnInterval: number;
  private target: Pep | null = null;
  private spawnCallback: SpawnCallback | null = null;

  constructor(x: number, y: number, physics: PhysicsEngine, config: GameConfig) {
    this.x = x;
    this.y = y;
    this.physics = physics;
    this.config = config;

    this.maxBees = config.maxBees;
    this.spawnInterval = config.beeSpawnInterval;
  }

  setTarget(target: Pep) {
    this.target = target;
  }

  setOnSpawnBee(callback: SpawnCallback) {
    this.spawnCallback = callback;
  }

  update(deltaTime: number): Bee | null {
    if (!this.target || this.spawnedCount >= this.maxBees) {
      return null;
    }

    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      return this.spawnBee();
    }

    return null;
  }

  private spawnBee(): Bee | null {
    if (!this.target) return null;

    this.spawnedCount++;

    // Spawn slightly below hive with random offset
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = 30 + (Math.random() - 0.5) * 20;

    const spawnX = this.x + offsetX;
    const spawnY = this.y + offsetY;

    // Call the spawn callback if set
    if (this.spawnCallback) {
      this.spawnCallback(spawnX, spawnY);
    }

    return new Bee(
      spawnX,
      spawnY,
      this.target,
      this.physics,
      this.config
    );
  }

  render(ctx: CanvasRenderingContext2D) {
    const x = this.x;
    const y = this.y;

    // Hive body (honeycomb shape)
    ctx.fillStyle = '#DEB887';
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x + 35, y - 20);
    ctx.lineTo(x + 35, y + 20);
    ctx.lineTo(x, y + 40);
    ctx.lineTo(x - 35, y + 20);
    ctx.lineTo(x - 35, y - 20);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Honeycomb pattern
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 1;

    // Draw hexagon pattern
    const hexSize = 12;
    const hexHeight = hexSize * Math.sqrt(3);

    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 0; col++) {
        const hx = x + col * hexSize * 1.5;
        const hy = y + row * hexHeight * 0.5;
        this.drawHexagon(ctx, hx, hy, hexSize * 0.5);
      }
    }

    // Entrance hole
    ctx.fillStyle = '#4A3728';
    ctx.beginPath();
    ctx.ellipse(x, y + 25, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
}
