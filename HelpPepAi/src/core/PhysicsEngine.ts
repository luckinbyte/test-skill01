import Matter from 'matter-js';
import { GameConfig } from './GameConfig';

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private config: GameConfig;
  private lineBodies: Matter.Body[] = [];
  private enabled: boolean = true;

  constructor(config: GameConfig) {
    this.config = config;
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    // Set gravity
    const gravity = this.config.gravity;
    this.engine.world.gravity.x = gravity.x;
    this.engine.world.gravity.y = gravity.y;
  }

  getWorld(): Matter.World {
    return this.world;
  }

  getEngine(): Matter.Engine {
    return this.engine;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  update(deltaTime: number) {
    if (!this.enabled) return;
    Matter.Engine.update(this.engine, deltaTime * 1000);
  }

  addBody(body: Matter.Body) {
    Matter.World.add(this.world, body);
  }

  removeBody(body: Matter.Body) {
    Matter.World.remove(this.world, body);
  }

  addBodies(bodies: Matter.Body[]) {
    Matter.World.add(this.world, bodies);
  }

  // Create a line segment as a physics body
  createLineBody(
    x1: number, y1: number,
    x2: number, y2: number,
    thickness: number = this.config.lineThickness
  ): Matter.Body {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    const body = Matter.Bodies.rectangle(centerX, centerY, length, thickness, {
      angle: angle,
      friction: this.config.lineFriction,
      restitution: this.config.lineRestitution,
      density: this.config.lineDensity,
      render: {
        fillStyle: '#333333'
      },
      label: 'line'
    });

    this.lineBodies.push(body);
    this.addBody(body);
    return body;
  }

  // Create static rectangle (walls, ground, platforms)
  createStaticRect(
    x: number, y: number,
    width: number, height: number,
    options: Matter.IBodyDefinition = {}
  ): Matter.Body {
    const body = Matter.Bodies.rectangle(x, y, width, height, {
      isStatic: true,
      friction: 0.8,
      restitution: 0.2,
      ...options
    });
    this.addBody(body);
    return body;
  }

  // Create dynamic circle (for characters)
  createDynamicCircle(
    x: number, y: number,
    radius: number,
    options: Matter.IBodyDefinition = {}
  ): Matter.Body {
    const body = Matter.Bodies.circle(x, y, radius, {
      friction: 0.5,
      restitution: 0.3,
      density: 0.002,
      ...options
    });
    this.addBody(body);
    return body;
  }

  // Clear all line bodies
  clearLines() {
    for (const body of this.lineBodies) {
      Matter.World.remove(this.world, body);
    }
    this.lineBodies = [];
  }

  // Clear everything
  clear() {
    Matter.World.clear(this.world, false);
    this.lineBodies = [];
  }

  // Check if a point is inside any body
  testPoint(x: number, y: number): Matter.Body | null {
    const bodies = Matter.Composite.allBodies(this.world);
    for (const body of bodies) {
      if (Matter.Bounds.contains(body.bounds, { x, y })) {
        if (Matter.Vertices.contains(body.vertices, { x, y })) {
          return body;
        }
      }
    }
    return null;
  }

  // Raycast to check for obstacles
  raycast(x1: number, y1: number, x2: number, y2: number): boolean {
    const bodies = Matter.Composite.allBodies(this.world);
    const collisions = Matter.Query.ray(bodies, { x: x1, y: y1 }, { x: x2, y: y2 });

    // Filter out line bodies (we don't want lines to block drawing)
    const obstacles = collisions.filter(c =>
      c.bodyA.label !== 'line' &&
      c.bodyA.label !== 'pep' &&
      c.bodyA.label !== 'bee'
    );

    return obstacles.length > 0;
  }
}
