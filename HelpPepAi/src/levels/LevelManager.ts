import { EntityManager } from '../entities/EntityManager';
import { GameConfig } from '../core/GameConfig';
import { Level1 } from './Level1';
import { Level2 } from './Level2';
import { Level3 } from './Level3';

export interface Level {
  index: number;
  name: string;
  load(entityManager: EntityManager, config: GameConfig): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export class LevelManager {
  private entityManager: EntityManager;
  private config: GameConfig;
  private levels: Level[] = [];
  private _currentLevel: number = 1;

  constructor(entityManager: EntityManager, config: GameConfig) {
    this.entityManager = entityManager;
    this.config = config;

    // Register levels
    this.levels = [
      new Level1(),
      new Level2(),
      new Level3()
    ];
  }

  get currentLevel(): number {
    return this._currentLevel;
  }

  loadLevel(index: number) {
    if (index > this.levels.length) {
      // All levels completed, restart from 1
      index = 1;
    }

    this._currentLevel = index;
    const level = this.levels[index - 1];
    if (level) {
      level.load(this.entityManager, this.config);
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const level = this.levels[this._currentLevel - 1];
    if (level) {
      level.render(ctx);
    }
  }
}
