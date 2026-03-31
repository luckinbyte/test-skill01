import Matter from 'matter-js';
import { PhysicsEngine } from '../core/PhysicsEngine';
import { GameConfig } from '../core/GameConfig';

export class Pep {
  private body: Matter.Body;
  private hit: boolean = false;
  private radius: number = 25;

  constructor(x: number, y: number, physics: PhysicsEngine, _config: GameConfig) {
    this.body = physics.createDynamicCircle(x, y, this.radius, {
      label: 'pep',
      friction: 0.5,
      restitution: 0.3,
      density: 0.003,
      render: {
        fillStyle: '#FFD700'
      }
    });
  }

  getBody(): Matter.Body {
    return this.body;
  }

  getX(): number {
    return this.body.position.x;
  }

  getY(): number {
    return this.body.position.y;
  }

  getRadius(): number {
    return this.radius;
  }

  isHit(): boolean {
    return this.hit;
  }

  onHit() {
    this.hit = true;
  }

  setStatic(isStatic: boolean) {
    Matter.Body.setStatic(this.body, isStatic);
  }

  update(_deltaTime: number) {
    // Pep physics is handled by Matter.js
  }

  render(ctx: CanvasRenderingContext2D) {
    const x = this.body.position.x;
    const y = this.body.position.y;
    const radius = this.radius;

    // Body (golden circle)
    ctx.fillStyle = this.hit ? '#FF6B6B' : '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    const eyeOffset = radius * 0.3;
    const eyeRadius = radius * 0.15;

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - eyeOffset, y - eyeOffset * 0.5, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y - eyeOffset * 0.5, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Smile or sad face
    if (!this.hit) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + eyeOffset * 0.3, radius * 0.4, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else {
      // Sad face when hit
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + eyeOffset * 1.5, radius * 0.3, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();
    }

    // Ears
    ctx.fillStyle = this.hit ? '#FF6B6B' : '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x - radius * 0.7, y - radius * 0.8, radius * 0.25, radius * 0.35, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(x + radius * 0.7, y - radius * 0.8, radius * 0.25, radius * 0.35, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
