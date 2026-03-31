import { Level } from './LevelManager';
import { EntityManager } from '../entities/EntityManager';
import { GameConfig } from '../core/GameConfig';
import { Bee } from '../entities/Bee';

export class Level2 implements Level {
  index = 2;
  name = 'Double Trouble';

  load(entityManager: EntityManager, config: GameConfig): void {
    const gameWidth = config.gameWidth;
    const gameHeight = config.gameHeight;

    // Ground
    entityManager.createTerrain(
      gameWidth / 2, gameHeight - 25,
      gameWidth, 50,
      'ground'
    );

    // Platform for Pep (center)
    entityManager.createTerrain(
      gameWidth / 2, gameHeight - 180,
      80, 20,
      'platform'
    );

    // Side platforms
    entityManager.createTerrain(
      gameWidth * 0.2, gameHeight - 250,
      60, 15,
      'platform'
    );

    entityManager.createTerrain(
      gameWidth * 0.8, gameHeight - 250,
      60, 15,
      'platform'
    );

    // Create Pep on center platform
    const pep = entityManager.createPep(gameWidth / 2, gameHeight - 225);

    // Create two Hives
    const hive1 = entityManager.createHive(gameWidth * 0.15, 60);
    hive1.setTarget(pep);
    hive1.setOnSpawnBee((x: number, y: number) => {
      entityManager.addBee(new Bee(x, y, pep, entityManager['physics'], config));
    });

    const hive2 = entityManager.createHive(gameWidth * 0.85, 60);
    hive2.setTarget(pep);
    hive2.setOnSpawnBee((x: number, y: number) => {
      entityManager.addBee(new Bee(x, y, pep, entityManager['physics'], config));
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw clouds
    this.drawCloud(ctx, 200, 80);
    this.drawCloud(ctx, 500, 60);

    // Draw two suns for this level
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(700, 100, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 30, y - 10, 30, 0, Math.PI * 2);
    ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 30, y + 10, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}
