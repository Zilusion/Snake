export type Point = {
	x: number;
	y: number;
};

export type KeyCallback = () => void;

export type Direction = Readonly<Point>;

export type DirectionValue = Readonly<Record<'x' | 'y', number>>;

export type InputMap = Record<string, DirectionValue>;

export type CellType = 'empty' | 'block' | 'apple' | 'player_start';

export type LevelData = {
	width: number;
	height: number;
	layout: string[];
	playerStartPositions: Point[];
	initialApplePositions?: Point[];
};
