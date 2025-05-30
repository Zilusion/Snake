import { MoveDirections } from './constants';
import type { Point, DirectionValue } from './types';

export class Player {
	public readonly id: number;
	public segments: Point[];
	public currentDirection: DirectionValue;
	public length: number;
	public readonly color: string;
	public readonly headColor: string;

	public visualSegments: Point[]; 
    private animationProgress: number = 0; 
    private lastLogicalSegments: Point[]; 

	public constructor(
		id: number,
		startX: number,
		startY: number,
		tailColor: string,
		headColor: string,
	) {
		this.id = id;
		this.segments = [{ x: startX, y: startY }];
		this.currentDirection = MoveDirections.Up;
		this.length = 2;
		this.color = tailColor;
		this.headColor = headColor;

		this.visualSegments = this.segments.map(s => ({ ...s }));
        this.lastLogicalSegments = this.segments.map(s => ({ ...s }));
	}

	public startAnimationTick(): void {
        this.lastLogicalSegments = this.segments.map(s => ({ ...s }));
        this.animationProgress = 0;
	}
	
	public updateVisuals(deltaTime: number, tickDuration: number): void {
        if (this.animationProgress < 1) {
            this.animationProgress += deltaTime / tickDuration;
            this.animationProgress = Math.min(this.animationProgress, 1); 

            this.visualSegments = this.segments.map((currentSeg, index) => {
                const lastSeg = this.lastLogicalSegments[index] || currentSeg; 

                const visualX = lastSeg.x + (currentSeg.x - lastSeg.x) * this.animationProgress;
                const visualY = lastSeg.y + (currentSeg.y - lastSeg.y) * this.animationProgress;
                return { x: visualX, y: visualY };
            });
        } else {
            this.visualSegments = this.segments.map(s => ({ ...s }));
        }
    }

	public performMove(
		direction: DirectionValue,
		isCellOccupied: (
			x: number,
			y: number,
			movingPlayerId: number,
		) => boolean,
		boardWidth: number,
		boardHeight: number,
	): boolean {
		if (
			(direction.x !== 0 && direction.x === -this.currentDirection.x) ||
			(direction.y !== 0 && direction.y === -this.currentDirection.y)
		) {
			return false;
		}

		const head: Point = this.segments[0];
		const newHead: Point = {
			x: head.x + direction.x,
			y: head.y + direction.y,
		};

		if (newHead.x < 0) newHead.x = boardWidth - 1;
		if (newHead.x >= boardWidth) newHead.x = 0;
		if (newHead.y < 0 || newHead.y >= boardHeight) {
			return false;
		}

		if (isCellOccupied(newHead.x, newHead.y, this.id)) {
			return false;
		}

		this.segments.unshift(newHead);
		this.currentDirection = direction;

		if (this.segments.length > this.length) {
			this.segments.pop();
		}
		return true;
	}

	public shiftBy(dx: number, dy: number): void {
		if (dx === 0 && dy === 0) return;
		this.segments.forEach((segment) => {
			segment.x += dx;
			segment.y += dy;
		});
	}
}
