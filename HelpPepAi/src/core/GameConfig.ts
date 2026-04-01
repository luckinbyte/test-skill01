export class GameConfig {
  // Logical game size (internal coordinates)
  readonly gameWidth: number = 800;
  readonly gameHeight: number = 600;

  // Scale factors for rendering
  private _scaleX: number = 1;
  private _scaleY: number = 1;

  // Canvas reference
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  updateScale(displayWidth: number, displayHeight: number) {
    this._scaleX = displayWidth / this.gameWidth;
    this._scaleY = displayHeight / this.gameHeight;
  }

  get scaleX(): number {
    return this._scaleX;
  }

  get scaleY(): number {
    return this._scaleY;
  }

  // Convert screen coordinates to game coordinates
  screenToGame(screenX: number, screenY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((screenX - rect.left) / rect.width) * this.gameWidth,
      y: ((screenY - rect.top) / rect.height) * this.gameHeight
    };
  }

  // Physics settings
  get gravity(): { x: number; y: number } {
    return { x: 0, y: 1 };
  }

  // Game settings
  get gameDuration(): number {
    return 10; // seconds
  }

  get maxBees(): number {
    return 6;
  }

  get beeSpawnInterval(): number {
    return 0.3; // seconds
  }

  // Line physics settings
  get lineThickness(): number {
    return 12; // Increased thickness for better collision detection
  }

  get lineDensity(): number {
    return 0.5; // Increased from 0.01 - lines need mass to collide properly
  }

  get lineFriction(): number {
    return 0.8;
  }

  get lineRestitution(): number {
    return 0.1; // Low bounce to prevent jittering
  }

  get lineSlop(): number {
    return 0.05; // Collision tolerance to prevent jittering
  }

  // Bee settings
  get beeSpeed(): number {
    return 3;
  }

  get beeRadius(): number {
    return 15;
  }
}
