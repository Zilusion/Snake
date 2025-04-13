import type { Point } from './types';

export class Block implements Point {
	public readonly x: number;
	public readonly y: number;
	public readonly color: string;

	public constructor(x: number, y: number, color: string) {
		this.x = x;
		this.y = y;
		this.color = color;
	}
}
