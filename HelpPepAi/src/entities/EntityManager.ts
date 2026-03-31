import Matter from 'matter-js';
import { PhysicsEngine } from '../core/PhysicsEngine';
import { GameConfig } from '../core/GameConfig';
import { Pep } from './Pep';
import { Bee } from './Bee';
import { Hive } from './Hive';
import { Terrain } from './Terrain';

export class EntityManager {
  private physics: PhysicsEngine;
  private config: GameConfig;

  private pep: Pep | null = null;
  private bees: Bee[] = [];
  private hives: Hive[] = [];
  private terrains: Terrain[] = [];

  constructor(physics: PhysicsEngine, config: GameConfig) {
    this.physics = physics;
    this.config = config;

    // Setup collision detection
    this.setupCollisionHandlers();
  }

  private setupCollisionHandlers() {
    Matter.Events.on(this.physics.getEngine(), 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (const pair of pairs) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check for bee-line collision
        this.handleBeeLineCollision(bodyA, bodyB);

        // Check for bee-pep collision
        this.handleBeePepCollision(bodyA, bodyB);
      }
    });
  }

  private handleBeeLineCollision(bodyA: Matter.Body, bodyB: Matter.Body) {
    // Check if one is bee and other is line
    const beeBody = bodyA.label === 'bee' ? bodyA : (bodyB.label === 'bee' ? bodyB : null);
    const lineBody = bodyA.label === 'line' ? bodyA : (bodyB.label === 'line' ? bodyB : null);

    if (beeBody && lineBody) {
      // Find the bee instance and trigger retreat
      const bee = this.bees.find(b => b.getBody() === beeBody);
      if (bee) {
        bee.startRetreat();
      }
    }
  }

  private handleBeePepCollision(bodyA: Matter.Body, bodyB: Matter.Body) {
    // Check if one is bee and other is pep
    const beeBody = bodyA.label === 'bee' ? bodyA : (bodyB.label === 'bee' ? bodyB : null);
    const pepBody = bodyA.label === 'pep' ? bodyA : (bodyB.label === 'pep' ? bodyB : null);

    if (beeBody && pepBody && this.pep && !this.pep.isHit()) {
      this.pep.onHit();
    }
  }

  createPep(x: number, y: number): Pep {
    this.pep = new Pep(x, y, this.physics, this.config);
    return this.pep;
  }

  getPep(): Pep | null {
    return this.pep;
  }

  createHive(x: number, y: number): Hive {
    const hive = new Hive(x, y, this.physics, this.config);
    this.hives.push(hive);
    return hive;
  }

  getHives(): Hive[] {
    return this.hives;
  }

  addBee(bee: Bee) {
    this.bees.push(bee);
  }

  createTerrain(x: number, y: number, width: number, height: number, type: string): Terrain {
    const terrain = new Terrain(x, y, width, height, type, this.physics);
    this.terrains.push(terrain);
    return terrain;
  }

  update(deltaTime: number) {
    // Update hives and spawn bees
    if (this.pep) {
      for (const hive of this.hives) {
        const newBee = hive.update(deltaTime);
        if (newBee) {
          this.bees.push(newBee);
        }
      }
    }

    // Update bees
    for (const bee of this.bees) {
      bee.update(deltaTime);
    }

    // Check if pep fell off screen
    if (this.pep && !this.pep.isHit() && this.pep.getY() > this.config.gameHeight + 50) {
      this.pep.onHit();
    }
  }

  checkGameOver(): boolean {
    if (!this.pep) return false;
    return this.pep.isHit();
  }

  render(ctx: CanvasRenderingContext2D) {
    // Render terrains
    for (const terrain of this.terrains) {
      terrain.render(ctx);
    }

    // Render hives
    for (const hive of this.hives) {
      hive.render(ctx);
    }

    // Render pep
    if (this.pep) {
      this.pep.render(ctx);
    }

    // Render bees
    for (const bee of this.bees) {
      bee.render(ctx);
    }
  }

  clear() {
    this.pep = null;
    this.bees = [];
    this.hives = [];
    this.terrains = [];
  }
}
