import { Level } from './LevelManager';
import { EntityManager } from '../entities/EntityManager';
import { GameConfig } from '../core/GameConfig';
import { Bee } from '../entities/Bee';

export class Level3 implements Level {
  index = 3;
  name = 'The Gauntlet';

  load(entityManager: EntityManager, config: GameConfig): void {
    const gameWidth = config.gameWidth;
    const gameHeight = config.gameHeight;

    // Ground with gap
    entityManager.createTerrain(
      gameWidth * 0.2, gameHeight - 25,
      gameWidth * 0.35, 50,
      'ground'
    );

    entityManager.createTerrain(
      gameWidth * 0.8, gameHeight - 25,
      gameWidth * 0.35, 50,
      'ground'
    );

    // Water in the gap
    entityManager.createTerrain(
      gameWidth / 2, gameHeight - 65,
      gameWidth * 0.3, 30,
      'water'
    );

    // Floating platforms
    entityManager.createTerrain(
      gameWidth * 0.15, gameHeight - 150,
      70, 15,
      'platform'
    );

    entityManager.createTerrain(
      gameWidth * 0.5, gameHeight - 220,
      80, 15,
      'platform'
    );

    entityManager.createTerrain(
      gameWidth * 0.85, gameHeight - 150,
      70, 15,
      'platform'
    );

    // Walls
    entityManager.createTerrain(
      25, gameHeight / 2,
      50, gameHeight,
      'wall'
    );

    entityManager.createTerrain(
      gameWidth - 25, gameHeight / 2,
      50, gameHeight,
      'wall'
    );

    // Create Pep on center platform
    const pep = entityManager.createPep(gameWidth * 0.5, gameHeight - 265);

    // Create three Hives for maximum challenge
    const hive1 = entityManager.createHive(gameWidth * 0.2, 50);
    hive1.setTarget(pep);
    hive1.setOnSpawnBee((x: number, y: number) => {
      entityManager.addBee(new Bee(x, y, pep, entityManager['physics'], config));
    });

    const hive2 = entityManager.createHive(gameWidth * 0.5, 40);
    hive2.setTarget(pep);
    hive2.setOnSpawnBee((x: number, y: number) => {
      entityManager.addBee(new Bee(x, y, pep, entityManager['physics'], config));
    });

    const hive3 = entityManager.createHive(gameWidth * 0.8, 50);
    hive3.setTarget(pep);
    hive3.setOnSpawnBee((x: number, y: number) => {
      entityManager.addBee(new Bee(x, y, pep, entityManager['physics'], config));
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw storm clouds
    ctx.fillStyle = 'rgba(100, 100, 120, 0.7)';
    this.drawStormCloud(ctx, 150, 60);
    this.drawStormCloud(ctx, 400, 40);
    this.drawStormCloud(ctx, 650, 60);

    // Darker sun (eclipse effect)
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(400, 120, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(410, 115, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawStormCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 40, y - 15, 35, 0, Math.PI * 2);
    ctx.arc(x + 80, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 40, y + 15, 25, 0, Math.PI * 2);
    ctx.fill();
  }
}
