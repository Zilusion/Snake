import type { LevelData, Point } from './types';
import { Colors } from './constants';
import { Apple } from './apple';
import { Block } from './block';

export function parseLevelLayout(levelData: LevelData): {
	blocks: Block[];
	apples: Apple[];
	playerStarts: Point[];
} {
	const blocks: Block[] = [];
	const apples: Apple[] = [];
	const playerStarts: Point[] = [];

	levelData.playerStartPositions = [];

	levelData.layout.forEach((rowString, y) => {
		[...rowString].forEach((char, x) => {
			const point = { x, y };
			switch (char) {
				case '#': {
					blocks.push(new Block(x, y, 'block_ground', 2));
					break;
				}
				case 'A': {
					apples.push(new Apple(x, y, Colors.APPLE));
					break;
				}
				case '0':
				case '1':
				case '2': {
					const playerId = Number.parseInt(char, 10);
					while (playerStarts.length <= playerId) {
						playerStarts.push({ x: -1, y: -1 });
					}
					playerStarts[playerId] = point;
					break;
				}
				case '.': {
					break;
				}
				default: {
					console.warn(
						`Неизвестный символ '${char}' в раскладке уровня на ${x},${y}`,
					);
				}
			}
		});
	});

	levelData.playerStartPositions = playerStarts.filter(
		(p) => p.x !== -1 && p.y !== -1,
	);

	if (levelData.playerStartPositions.length !== playerStarts.length) {
		console.warn(
			'Не для всех ID игроков (0, 1, ...) найдены стартовые позиции.',
		);
	}

	if (levelData.playerStartPositions.length === 0) {
		console.warn(
			`На уровне нет стартовых позиций для игроков ('0', '1', ...)!`,
		);
	}

	return {
		blocks,
		apples,
		playerStarts: levelData.playerStartPositions,
	};
}
