import type { DirectionValue, InputMap } from './types';

export const MoveDirections = {
	Up: { x: 0, y: -1 },
	Down: { x: 0, y: 1 },
	Left: { x: -1, y: 0 },
	Right: { x: 1, y: 0 },
} as const;

function checkDirectionValue(
	direction: (typeof MoveDirections)[keyof typeof MoveDirections],
): DirectionValue {
	return direction;
}
checkDirectionValue(MoveDirections.Up);

// Настройки управления для игроков
export const inputSettings: InputMap[] = [
	{
		// Player 0 controls
		w: MoveDirections.Up,
		s: MoveDirections.Down,
		a: MoveDirections.Left,
		d: MoveDirections.Right,
	},
	{
		// Player 1 controls
		ArrowUp: MoveDirections.Up,
		ArrowDown: MoveDirections.Down,
		ArrowLeft: MoveDirections.Left,
		ArrowRight: MoveDirections.Right,
	},
];

export const Colors = {
	BACKGROUND: '#FFF',
	BLOCK: '#555',
	APPLE: '#FF0000BB',
	PLAYER_HEAD_DEFAULT: '#00b200BB',
	PLAYER_TAIL_DEFAULT: '#00FF00BB',
} as const;

export const GameLoopParameters = {
	TICK_MS: 150,
} as const;
