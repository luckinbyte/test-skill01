import Matter from 'matter-js';
import { PhysicsEngine } from '../core/PhysicsEngine';

export class Terrain {
  private body: Matter.Body;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private type: string;

  constructor(
    x: number, y: number,
    width: number, height: number,
    type: string,
    physics: PhysicsEngine
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;

    this.body = physics.createStaticRect(x, y, width, height, {
      label: type,
      friction: 0.8,
      restitution: 0.2
    });
  }

  getBody(): Matter.Body {
    return this.body;
  }

  getType(): string {
    return this.type;
  }

  render(ctx: CanvasRenderingContext2D) {
    const x = this.x - this.width / 2;
    const y = this.y - this.height / 2;

    switch (this.type) {
      case 'ground':
        this.renderGround(ctx, x, y);
        break;
      case 'platform':
        this.renderPlatform(ctx, x, y);
        break;
      case 'water':
        this.renderWater(ctx, x, y);
        break;
      case 'wall':
        this.renderWall(ctx, x, y);
        break;
      default:
        this.renderDefault(ctx, x, y);
    }
  }

  private renderGround(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Grass top
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x, y, this.width, 15);

    // Dirt
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y + 15, this.width, this.height - 15);

    // Outline
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.width, this.height);
  }

  private renderPlatform(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Wood platform
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(x, y, this.width, this.height);

    // Wood grain
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;
    for (let i = 0; i < this.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + this.height);
      ctx.stroke();
    }

    // Outline
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.width, this.height);
  }

  private renderWater(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Water base
    ctx.fillStyle = '#4FC3F7';
    ctx.fillRect(x, y, this.width, this.height);

    // Wave effect
    ctx.strokeStyle = '#29B6F6';
    ctx.lineWidth = 2;
    const time = Date.now() * 0.002;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      for (let px = 0; px < this.width; px += 10) {
        const py = y + 10 + i * 15 + Math.sin(time + px * 0.05) * 3;
        if (px === 0) {
          ctx.moveTo(x + px, py);
        } else {
          ctx.lineTo(x + px, py);
        }
      }
      ctx.stroke();
    }

    // Outline
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.width, this.height);
  }

  private renderWall(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Stone wall
    ctx.fillStyle = '#757575';
    ctx.fillRect(x, y, this.width, this.height);

    // Brick pattern
    ctx.strokeStyle = '#616161';
    ctx.lineWidth = 1;
    const brickHeight = 20;
    const brickWidth = 40;

    for (let by = 0; by < this.height; by += brickHeight) {
      const offset = (Math.floor(by / brickHeight) % 2) * (brickWidth / 2);
      for (let bx = -offset; bx < this.width + brickWidth; bx += brickWidth) {
        ctx.strokeRect(x + bx, y + by, brickWidth, brickHeight);
      }
    }

    // Outline
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.width, this.height);
  }

  private renderDefault(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(x, y, this.width, this.height);
    ctx.strokeStyle = '#616161';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.width, this.height);
  }
}
