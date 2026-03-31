import { Level } from './LevelManager';
import { EntityManager } from '../entities/EntityManager';
import { GameConfig } from '../core/GameConfig';
import { Bee } from '../entities/Bee';

export class Level1 implements Level {
  index = 1;
  name = 'First Steps';

  load(entityManager: EntityManager, config: GameConfig): void {
    const gameWidth = config.gameWidth;
    const gameHeight = config.gameHeight;

    // Ground
    entityManager.createTerrain(
      gameWidth / 2, gameHeight - 25,
      gameWidth, 50,
      'ground'
    );

    // Platform for Pep (left side)
    entityManager.createTerrain(
      gameWidth * 0.25, gameHeight - 150,
      100, 20,
      'platform'
    );

    // Create Pep on the platform
    const pep = entityManager.createPep(gameWidth * 0.25, gameHeight - 195);

    // Create Hive (top right)
    const hive = entityManager.createHive(gameWidth * 0.8, 80);
    hive.setTarget(pep);

    // Set bee spawn callback
    hive.setOnSpawnBee((x: number, y: number) => {
      entityManager.addBee(new Bee(x, y, pep, entityManager['physics'], config));
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Draw some clouds
    this.drawCloud(ctx, 100, 80);
    this.drawCloud(ctx, 600, 50);
    this.drawCloud(ctx, 350, 100);

    // Draw sun
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(700, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      ctx.beginPath();
      ctx.moveTo(700 + Math.cos(angle) * 50, 80 + Math.sin(angle) * 50);
      ctx.lineTo(700 + Math.cos(angle) * 65, 80 + Math.sin(angle) * 65);
      ctx.stroke();
    }
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
