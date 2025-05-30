import type { Player } from './player';
import type { Apple } from './apple';
import type { Block } from './block';
import type { Point } from './types';
import { Colors } from './constants';
import { getAsset } from './assetLoader';

export class Renderer {
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly cellSize: number;
	private bgLayer1: HTMLImageElement | undefined;
    private bgLayer2: HTMLImageElement | undefined;
    private bgLayer3: HTMLImageElement | undefined;

	public constructor(canvas: HTMLCanvasElement, cellSize: number) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Не удалось получить 2D контекст для canvas');
		}
		this.ctx = context;
		this.cellSize = cellSize;
		this.bgLayer1 = getAsset('game_bg_1');
		this.bgLayer2 = getAsset('game_bg_2');
		this.bgLayer3 = getAsset('game_bg_3');
	}

	public render(players: Player[], apples: Apple[], blocks: Block[]): void {
		this.clearAndDrawBackground();
        blocks.forEach((block: Block) => this.drawBlock(block)); 
        apples.forEach((apple: Apple) => this.drawApple(apple));
        players.forEach((player: Player) => this.drawPlayer(player)); 
    }

	private clearAndDrawBackground(): void {
		this.ctx.fillStyle = Colors.BACKGROUND;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.bgLayer1) {
            this.drawBackgroundImage(this.bgLayer1);
        }
        if (this.bgLayer2) {
            this.drawBackgroundImage(this.bgLayer2);
        }
        if (this.bgLayer3) {
            this.drawBackgroundImage(this.bgLayer3);
        }
	}

	private drawBackgroundImage(image: HTMLImageElement): void {
        const pattern = this.ctx.createPattern(image, 'repeat');
        if (pattern) {
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

	private drawPlayer(player: Player): void {
		player.visualSegments.forEach((segment: Point, index: number) => {
			this.ctx.fillStyle = index === 0 ? player.headColor : player.color;
			this.ctx.fillRect(
				segment.x * this.cellSize,
				segment.y * this.cellSize,
				this.cellSize, // Ширина
				this.cellSize, // Высота
			);

			/* УБИРАЕМ ОБВОДКУ
			this.ctx.strokeStyle = Colors.BACKGROUND;
			this.ctx.lineWidth = 1;
			this.ctx.strokeRect(
				segment.x * this.cellSize,
				segment.y * this.cellSize,
				this.cellSize,
				this.cellSize,
			);
            */
		});
	}

	private drawApple(apple: Apple): void {
		this.ctx.fillStyle = apple.color; // Можно использовать Colors.APPLE
		this.ctx.fillRect(
			apple.x * this.cellSize,
			apple.y * this.cellSize,
			this.cellSize,
			this.cellSize,
		);

		/* УБИРАЕМ ОБВОДКУ
		this.ctx.strokeStyle = Colors.BACKGROUND;
		this.ctx.lineWidth = 1;
		this.ctx.strokeRect(
			apple.x * this.cellSize,
			apple.y * this.cellSize,
			this.cellSize,
			this.cellSize,
		);
        */
	}

	private drawBlock(block: Block): void {
        const sprite = getAsset(block.chosenSpriteId); // Получаем конкретный спрайт для этого блока
        if (sprite) {
            this.ctx.drawImage(
                sprite,
                block.x * this.cellSize,
                block.y * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        } else {
            console.warn(`Sprite not found for block: ${block.chosenSpriteId}. Drawing with fallback color.`);
            this.ctx.fillStyle = Colors.BLOCK;
            this.ctx.fillRect(
                block.x * this.cellSize,
                block.y * this.cellSize,
                this.cellSize,
                this.cellSize,
            );
        }
	}
}
