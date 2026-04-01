import Matter from 'matter-js';
import { PhysicsEngine, CollisionCategory } from '../core/PhysicsEngine';
import { GameConfig } from '../core/GameConfig';
import { Pep } from './Pep';

export class Bee {
  private body: Matter.Body;
  private target: Pep;

  private speed: number;
  private radius: number;
  private randomOffset: { x: number; y: number };

  private isRetreating: boolean = false;
  private retreatTimer: number = 0;
  private readonly RETREAT_DURATION: number = 0.3;

  constructor(
    x: number, y: number,
    target: Pep,
    physics: PhysicsEngine,
    config: GameConfig
  ) {
    this.target = target;

    this.speed = config.beeSpeed;
    this.radius = config.beeRadius;

    // Random offset for natural movement
    this.randomOffset = {
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5
    };

    this.body = physics.createDynamicCircle(x, y, this.radius, {
      label: 'bee',
      friction: 0.1,
      restitution: 0.5,
      density: 0.001,
      frictionAir: 0.05,
      // IMPORTANT: Set collision filter so bee collides with lines
      collisionFilter: {
        category: CollisionCategory.BEE,
        mask: CollisionCategory.DEFAULT | CollisionCategory.LINE | CollisionCategory.PEP
      },
      render: {
        fillStyle: '#FFD700'
      }
    });

    console.log(`🐝 Created bee body:`, {
      position: { x, y },
      radius: this.radius,
      collisionFilter: this.body.collisionFilter
    });

    // Make bee not affected by gravity (bees fly!)
    Matter.Body.set(this.body, 'gravityScale', 0);
  }

  getBody(): Matter.Body {
    return this.body;
  }

  isCollidingWith(pep: Pep): boolean {
    const pepBody = pep.getBody();
    const dx = this.body.position.x - pepBody.position.x;
    const dy = this.body.position.y - pepBody.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.radius + pep.getRadius();
  }

  startRetreat() {
    if (this.isRetreating) return;
    this.isRetreating = true;
    this.retreatTimer = 0;

    // Calculate retreat direction (away from target)
    const retreatDir = {
      x: this.body.position.x - this.target.getX(),
      y: this.body.position.y - this.target.getY()
    };

    // Normalize
    const length = Math.sqrt(retreatDir.x * retreatDir.x + retreatDir.y * retreatDir.y);
    if (length > 0) {
      retreatDir.x /= length;
      retreatDir.y /= length;
    }

    // Add random offset
    retreatDir.x += (Math.random() - 0.5) * 0.5;
    retreatDir.y += (Math.random() - 0.5) * 0.5;

    // Normalize again
    const newLength = Math.sqrt(retreatDir.x * retreatDir.x + retreatDir.y * retreatDir.y);
    if (newLength > 0) {
      retreatDir.x /= newLength;
      retreatDir.y /= newLength;
    }

    // Apply retreat velocity
    Matter.Body.setVelocity(this.body, {
      x: retreatDir.x * 8,
      y: retreatDir.y * 8
    });
  }

  update(deltaTime: number) {
    // Handle retreat
    if (this.isRetreating) {
      this.retreatTimer += deltaTime;
      if (this.retreatTimer >= this.RETREAT_DURATION) {
        this.isRetreating = false;
      }
      return;
    }

    // Calculate direction to target
    const targetX = this.target.getX();
    const targetY = this.target.getY();

    let dirX = targetX - this.body.position.x;
    let dirY = targetY - this.body.position.y;

    // Normalize
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    if (length > 0) {
      dirX /= length;
      dirY /= length;
    }

    // Add random offset for natural movement
    dirX += this.randomOffset.x;
    dirY += this.randomOffset.y;

    // Normalize again
    const newLength = Math.sqrt(dirX * dirX + dirY * dirY);
    if (newLength > 0) {
      dirX /= newLength;
      dirY /= newLength;
    }

    // Apply force towards target
    const force = {
      x: dirX * this.speed * 0.01,
      y: dirY * this.speed * 0.01
    };

    Matter.Body.applyForce(this.body, this.body.position, force);

    // Limit max speed
    const velocity = this.body.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    const maxSpeed = 5;
    if (speed > maxSpeed) {
      Matter.Body.setVelocity(this.body, {
        x: (velocity.x / speed) * maxSpeed,
        y: (velocity.y / speed) * maxSpeed
      });
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const x = this.body.position.x;
    const y = this.body.position.y;
    const r = this.radius;

    // Wing animation (simple oscillation)
    const wingAngle = Math.sin(Date.now() * 0.02) * 0.3;

    // Wings
    ctx.fillStyle = 'rgba(200, 200, 255, 0.7)';
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.ellipse(-r * 0.8, -r * 0.2, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-wingAngle);
    ctx.beginPath();
    ctx.ellipse(r * 0.8, -r * 0.2, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Body (yellow and black stripes)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stripes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * r * 0.4, y - r * 0.7);
      ctx.lineTo(x + i * r * 0.4, y + r * 0.7);
      ctx.stroke();
    }

    // Head
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + r * 0.6, y - r * 0.2, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + r * 0.7, y - r * 0.35, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Stinger
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x - r * 1.4, y + r * 0.1);
    ctx.lineTo(x - r, y + r * 0.2);
    ctx.closePath();
    ctx.fill();
  }
}
