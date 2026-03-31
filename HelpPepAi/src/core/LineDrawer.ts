import Matter from 'matter-js';
import { PhysicsEngine } from './PhysicsEngine';
import { GameConfig } from './GameConfig';

interface LineSegment {
  body: Matter.Body;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export class LineDrawer {
  private canvas: HTMLCanvasElement;
  private physics: PhysicsEngine;
  private config: GameConfig;

  private isDrawing: boolean = false;
  private currentPoints: { x: number; y: number }[] = [];
  private lines: LineSegment[] = [];

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

    // Create physics bodies for each line segment
    for (let i = 0; i < this.currentPoints.length - 1; i++) {
      const p1 = this.currentPoints[i];
      const p2 = this.currentPoints[i + 1];

      const body = this.physics.createLineBody(p1.x, p1.y, p2.x, p2.y);
      this.lines.push({
        body,
        startX: p1.x,
        startY: p1.y,
        endX: p2.x,
        endY: p2.y
      });
    }

    this.currentPoints = [];

    // Notify that drawing is complete
    if (this.onDrawingComplete) {
      this.onDrawingComplete();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    // Draw completed lines
    ctx.strokeStyle = this.lineColor;
    ctx.lineWidth = this.config.lineThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const line of this.lines) {
      ctx.beginPath();
      ctx.moveTo(line.startX, line.startY);
      ctx.lineTo(line.endX, line.endY);
      ctx.stroke();
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
    this.physics.clearLines();
    this.lines = [];
    this.currentPoints = [];
    this.isDrawing = false;
  }
}
