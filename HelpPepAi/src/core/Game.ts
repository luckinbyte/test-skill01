import { PhysicsEngine } from './PhysicsEngine';
import { LineDrawer } from './LineDrawer';
import { EntityManager } from '../entities/EntityManager';
import { LevelManager } from '../levels/LevelManager';
import { GameConfig } from './GameConfig';

export type GameState = 'idle' | 'drawing' | 'playing' | 'win' | 'lose';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: GameConfig;
  private physics: PhysicsEngine;
  private lineDrawer: LineDrawer;
  private entityManager: EntityManager;
  private levelManager: LevelManager;

  private gameState: GameState = 'idle';
  private timeLeft: number = 10;
  private lastTime: number = 0;

  // UI Elements
  private timerEl: HTMLElement | null;
  private levelEl: HTMLElement | null;
  private startUI: HTMLElement | null;
  private winUI: HTMLElement | null;
  private loseUI: HTMLElement | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2d context');
    this.ctx = ctx;

    this.config = new GameConfig(canvas);
    this.physics = new PhysicsEngine(this.config);
    this.lineDrawer = new LineDrawer(canvas, this.physics, this.config);
    this.entityManager = new EntityManager(this.physics, this.config);
    this.levelManager = new LevelManager(this.entityManager, this.config);

    // Cache UI elements
    this.timerEl = document.getElementById('timer');
    this.levelEl = document.getElementById('level-indicator');
    this.startUI = document.getElementById('start-ui');
    this.winUI = document.getElementById('win-ui');
    this.loseUI = document.getElementById('lose-ui');

    this.setupEventListeners();
    this.resizeCanvas();
  }

  private setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', () => this.resizeCanvas());

    // Button handlers
    document.getElementById('start-btn')?.addEventListener('click', () => this.startGame());
    document.getElementById('next-level-btn')?.addEventListener('click', () => this.nextLevel());
    document.getElementById('retry-btn')?.addEventListener('click', () => this.restartLevel());

    // Line drawing complete callback
    this.lineDrawer.onDrawingComplete = () => {
      if (this.gameState === 'drawing') {
        this.gameState = 'playing';
        this.physics.enable();
      }
    };
  }

  private resizeCanvas() {
    const container = this.canvas.parentElement;
    if (!container) return;

    // Get container size
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate game size (maintain aspect ratio)
    const aspectRatio = this.config.gameWidth / this.config.gameHeight;
    let width = containerWidth;
    let height = containerWidth / aspectRatio;

    if (height > containerHeight) {
      height = containerHeight;
      width = containerHeight * aspectRatio;
    }

    // Set canvas size
    this.canvas.width = this.config.gameWidth;
    this.canvas.height = this.config.gameHeight;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Update config scale
    this.config.updateScale(width, height);
  }

  init() {
    this.loadLevel(1);
    this.gameLoop(0);
  }

  private loadLevel(levelIndex: number) {
    this.physics.clear();
    this.entityManager.clear();
    this.lineDrawer.clear();

    this.levelManager.loadLevel(levelIndex);

    if (this.levelEl) {
      this.levelEl.textContent = `Level ${levelIndex}`;
    }

    this.timeLeft = 10;
    this.updateTimerDisplay();
  }

  private startGame() {
    this.gameState = 'drawing'; // Allow drawing first
    this.startUI?.classList.add('hidden');
    this.winUI?.classList.add('hidden');
    this.loseUI?.classList.add('hidden');

    // Physics starts disabled, will enable after drawing
    this.physics.disable();
  }

  private nextLevel() {
    this.loadLevel(this.levelManager.currentLevel + 1);
    this.gameState = 'idle';
    this.startUI?.classList.remove('hidden');
  }

  private restartLevel() {
    this.loadLevel(this.levelManager.currentLevel);
    this.gameState = 'idle';
    this.startUI?.classList.remove('hidden');
  }

  private gameLoop(timestamp: number) {
    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(deltaTime: number) {
    // Always update physics for visual
    this.physics.update(deltaTime);

    if (this.gameState === 'playing') {
      // Update timer
      this.timeLeft -= deltaTime;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.onWin();
        return;
      }

      // Update entities
      this.entityManager.update(deltaTime);

      // Check game over
      if (this.entityManager.checkGameOver()) {
        this.onLose();
      }
    } else if (this.gameState === 'drawing') {
      // Still update entities for visual, but no physics
      this.entityManager.update(0);
    }
  }

  private updateTimerDisplay() {
    if (this.timerEl) {
      this.timerEl.textContent = Math.ceil(Math.max(0, this.timeLeft)).toString();
    }
  }

  private onWin() {
    this.gameState = 'win';
    this.physics.disable();
    this.winUI?.classList.remove('hidden');
  }

  private onLose() {
    this.gameState = 'lose';
    this.physics.disable();
    this.loseUI?.classList.remove('hidden');
  }

  private render() {
    // Clear canvas with sky blue
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background decorations
    this.levelManager.render(this.ctx);

    // Draw terrain and entities
    this.entityManager.render(this.ctx);

    // Draw lines on top
    this.lineDrawer.render(this.ctx);
  }
}
