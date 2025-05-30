import type { Point } from './types';

export class Block implements Point {
	public readonly x: number;
	public readonly y: number;

	public readonly spriteId: string; 
    public readonly spriteVariationCount: number;
    public readonly chosenSpriteId: string; 

	public constructor(x: number, y: number, baseSpriteId: string, variationCount: number = 1) {
		this.x = x;
		this.y = y;
		this.spriteId = baseSpriteId;
        this.spriteVariationCount = variationCount;

        if (variationCount > 1) {
            const randomIndex = Math.floor(Math.random() * variationCount) + 1;
            this.chosenSpriteId = `${baseSpriteId}_${randomIndex}`;
        } else {
            this.chosenSpriteId = baseSpriteId;
        }
	}
}
