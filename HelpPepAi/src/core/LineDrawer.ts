import Matter from 'matter-js';
import { PhysicsEngine } from './PhysicsEngine';
import { GameConfig } from './GameConfig';

interface DrawnLine {
  body: Matter.Body;
}

export class LineDrawer {
  private canvas: HTMLCanvasElement;
  private physics: PhysicsEngine;
  private config: GameConfig;

  private isDrawing: boolean = false;
  private currentPoints: { x: number; y: number }[] = [];
  private drawnLines: DrawnLine[] = [];

  // Drawing settings
  private minPointDistance: number = 5;
  private lineColor: string = '#333333';

  // Callback when drawing is complete
  onDrawingComplete: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, physics: PhysicsEngine, config: GameConfig) {
    this.canvas = canvas;
    this.physics = physics;
    this.config = config;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onPointerUp(e));
    this.canvas.addEventListener('mouseleave', (e) => this.onPointerUp(e));

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    this.canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e), { passive: false });
  }

  private getPointerPosition(e: MouseEvent): { x: number; y: number } {
    return this.config.screenToGame(e.clientX, e.clientY);
  }

  private getTouchPosition(e: TouchEvent): { x: number; y: number } {
    const touch = e.touches[0] || e.changedTouches[0];
    return this.config.screenToGame(touch.clientX, touch.clientY);
  }

  private onPointerDown(e: MouseEvent) {
    const pos = this.getPointerPosition(e);
    this.startDrawing(pos.x, pos.y);
  }

  private onPointerMove(e: MouseEvent) {
    const pos = this.getPointerPosition(e);
    this.continueDrawing(pos.x, pos.y);
  }

  private onPointerUp(_e: MouseEvent) {
    this.endDrawing();
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault();
    const pos = this.getTouchPosition(e);
    this.startDrawing(pos.x, pos.y);
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault();
    const pos = this.getTouchPosition(e);
    this.continueDrawing(pos.x, pos.y);
  }

  private onTouchEnd(e: TouchEvent) {
    e.preventDefault();
    this.endDrawing();
  }

  private startDrawing(x: number, y: number) {
    // Check if starting point is inside an existing body
    const hitBody = this.physics.testPoint(x, y);
    if (hitBody) {
      return; // Don't start drawing inside an object
    }

    this.isDrawing = true;
    this.currentPoints = [{ x, y }];
  }

  private continueDrawing(x: number, y: number) {
    if (!this.isDrawing) return;

    const lastPoint = this.currentPoints[this.currentPoints.length - 1];
    const distance = Math.sqrt(
      Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
    );

    // Skip if too close to last point
    if (distance < this.minPointDistance) return;

    // Raycast to check if line crosses any obstacle
    if (this.physics.raycast(lastPoint.x, lastPoint.y, x, y)) {
      return; // Stop drawing if hitting an obstacle
    }

    this.currentPoints.push({ x, y });
  }

  private endDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    // Need at least 2 points to create a line
    if (this.currentPoints.length < 2) {
      this.currentPoints = [];
      return;
    }

    // Create a single rigid body with all line segments as parts
    const thickness = this.config.lineThickness;
    const parts: Matter.Body[] = [];

    for (let i = 0; i < this.currentPoints.length - 1; i++) {
      const p1 = this.currentPoints[i];
      const p2 = this.currentPoints[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const centerX = (p1.x + p2.x) / 2;
      const centerY = (p1.y + p2.y) / 2;

      // Create a segment as a part with collision filter
      const part = Matter.Bodies.rectangle(centerX, centerY, length, thickness, {
        angle: angle,
        isStatic: false,
        collisionFilter: {
          category: 0x0004, // CollisionCategory.LINE
          mask: 0x0001 | 0x0002 | 0x0008 // DEFAULT | BEE | PEP
        }
      });
      parts.push(part);
    }

    // Create a single body from all parts
    const compoundBody = Matter.Body.create({
      parts: parts,
      friction: this.config.lineFriction,
      restitution: this.config.lineRestitution,
      density: this.config.lineDensity,
      slop: this.config.lineSlop,
      label: 'line'
    });

    // Add to world
    Matter.World.add(this.physics.getWorld(), compoundBody);

    this.drawnLines.push({ body: compoundBody });
    this.currentPoints = [];

    // Notify that drawing is complete
    if (this.onDrawingComplete) {
      this.onDrawingComplete();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    // Draw completed lines
    ctx.fillStyle = this.lineColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const drawnLine of this.drawnLines) {
      const body = drawnLine.body;
      // Render all parts of the compound body
      for (const part of body.parts) {
        if (part === body) continue; // Skip the parent body
        const vertices = part.vertices;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j++) {
          ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw current drawing line
    if (this.isDrawing && this.currentPoints.length > 0) {
      ctx.strokeStyle = this.lineColor;
      ctx.lineWidth = this.config.lineThickness;

      ctx.beginPath();
      ctx.moveTo(this.currentPoints[0].x, this.currentPoints[0].y);

      for (let i = 1; i < this.currentPoints.length; i++) {
        ctx.lineTo(this.currentPoints[i].x, this.currentPoints[i].y);
      }
      ctx.stroke();
    }
  }

  clear() {
    for (const drawnLine of this.drawnLines) {
      Matter.World.remove(this.physics.getWorld(), drawnLine.body);
    }
    this.drawnLines = [];
    this.currentPoints = [];
    this.isDrawing = false;
  }
}
