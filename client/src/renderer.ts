import type { Player } from './player';
import type { Apple } from './apple';
import type { Block } from './block';
import type { Point } from './types';
import { Colors } from './constants';

export class Renderer {
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly cellSize: number;

	public constructor(canvas: HTMLCanvasElement, cellSize: number) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Не удалось получить 2D контекст для canvas');
		}
		this.ctx = context;
		this.cellSize = cellSize;
	}

	public render(players: Player[], apples: Apple[], blocks: Block[]): void {
		this.clear();
		blocks.forEach((block: Block) => this.drawBlock(block));
		apples.forEach((apple: Apple) => this.drawApple(apple));
		players.forEach((player: Player) => this.drawPlayer(player));
	}

	private clear(): void {
		this.ctx.fillStyle = Colors.BACKGROUND;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private drawPlayer(player: Player): void {
		player.segments.forEach((segment: Point, index: number) => {
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
		this.ctx.fillStyle = block.color; // Можно использовать Colors.BLOCK
		this.ctx.fillRect(
			block.x * this.cellSize,
			block.y * this.cellSize,
			this.cellSize,
			this.cellSize,
		);

		/* УБИРАЕМ ОБВОДКУ
		this.ctx.strokeStyle = Colors.BACKGROUND;
		this.ctx.lineWidth = 1;
		this.ctx.strokeRect(
			block.x * this.cellSize,
			block.y * this.cellSize,
			this.cellSize,
			this.cellSize,
		);
        */
	}
}
