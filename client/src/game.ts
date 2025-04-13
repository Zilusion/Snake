import { InputManager } from './input-manager';
import { Player } from './player';
import type { Apple } from './apple';
import type { Block } from './block';
import { Renderer } from './renderer';
import { inputSettings, Colors, GameLoopParameters } from './constants';
import type { Point, DirectionValue, LevelData, InputMap } from './types';
import { parseLevelLayout } from './level';

export class Game {
	private readonly canvas: HTMLCanvasElement;
	private readonly boardWidth: number;
	private readonly boardHeight: number;
	private readonly cellSize: number;
	private readonly renderer: Renderer;
	private readonly inputManager: InputManager;

	private players: Player[] = [];
	private apples: Apple[] = [];
	private blocks: Block[] = [];

	private isActive: boolean = false;
	private gameLoopIntervalId: number | null = null;

	private keyActionMap: Map<
		string,
		{ playerId: number; direction: DirectionValue }
	> = new Map();

	public constructor(level: LevelData, cellSize: number) {
		this.boardWidth = level.width;
		this.boardHeight = level.height;
		this.cellSize = cellSize;

		const {
			blocks,
			apples: initialApples,
			playerStarts,
		} = parseLevelLayout(level);
		this.blocks = blocks;
		this.apples = initialApples;

		const canvasWidth: number = this.boardWidth * this.cellSize;
		const canvasHeight: number = this.boardHeight * this.cellSize;
		this.canvas = document.createElement('canvas');
		this.canvas.width = canvasWidth;
		this.canvas.height = canvasHeight;
		this.canvas.style.border = '1px solid black';
		this.canvas.style.margin = 'auto';
		this.canvas.style.display = 'block';

		if (!document.body) throw new Error('Document body не найден.');
		document.body.append(this.canvas);

		this.renderer = new Renderer(this.canvas, this.cellSize);
		this.inputManager = new InputManager();

		this.createPlayers(playerStarts);
		this.setupInputMapping();
	}

	public start(): void {
		if (this.gameLoopIntervalId !== null) return;
		this.isActive = true;
		console.log('Игра началась!');

		let lastTickTime = performance.now();
		this.applyGravityToAllPlayers();
		this.render();

		const gameTick = (currentTime: number): void => {
			if (!this.isActive) {
				this.gameLoopIntervalId = null;
				return;
			}

			const deltaTime = currentTime - lastTickTime;
			if (deltaTime >= GameLoopParameters.TICK_MS) {
				lastTickTime =
					currentTime - (deltaTime % GameLoopParameters.TICK_MS);
				this.update();
				this.render();
			}
			this.gameLoopIntervalId = requestAnimationFrame(gameTick);
		};
		this.gameLoopIntervalId = requestAnimationFrame(gameTick);
	}

	public stop(): void {
		if (this.gameLoopIntervalId !== null) {
			cancelAnimationFrame(this.gameLoopIntervalId);
			this.gameLoopIntervalId = null;
		}
		this.isActive = false;
		console.log('Игра остановлена.');
	}

	private createPlayers(startPositions: Point[]): void {
		const playerColors = [
			{
				tail: Colors.PLAYER_TAIL_DEFAULT,
				head: Colors.PLAYER_HEAD_DEFAULT,
			},
			{ tail: '#FF00FFAA', head: '#A000A0AA' },
		];
		startPositions.forEach((pos, index) => {
			const colors = playerColors[index] ?? playerColors[0];
			this.addPlayer(
				new Player(index, pos.x, pos.y, colors.tail, colors.head),
			);
		});
	}

	private addPlayer(player: Player): void {
		this.players.push(player);
	}

	private setupInputMapping(): void {
		this.players.forEach((player, index) => {
			const playerSettings: InputMap | undefined = inputSettings[index];
			if (playerSettings) {
				Object.entries(playerSettings).forEach(
					([key, direction]: [string, DirectionValue]) => {
						this.keyActionMap.set(key, {
							playerId: player.id,
							direction,
						});
					},
				);
			} else {
				console.warn(
					`Настройки управления для игрока с ID ${player.id} не найдены.`,
				);
			}
		});
	}

	private update(): void {
		if (!this.isActive) return;

		// 1. Получаем И буферизированные нажатия, И зажатые клавиши
		const bufferedKeyPresses = this.inputManager.processBufferedKeys();
		const activeKeys = this.inputManager.getActiveKeys(); // Зажатые клавиши

		// Объединяем оба набора - любая клавиша из них должна вызвать действие
		const keysToCheck = new Set([...bufferedKeyPresses, ...activeKeys]);

		const movedPlayerIds: Set<number> = new Set();

		// 2. Обработка ввода и попытка движения
		keysToCheck.forEach((key) => {
			const action = this.keyActionMap.get(key);
			if (action) {
				const player = this.players.find(
					(p) => p.id === action.playerId,
				);
				// Двигаем игрока, если он еще не двигался в этом тике
				if (player && !movedPlayerIds.has(player.id)) {
					player.performMove(
						action.direction,
						(x, y, movingPlayerId) =>
							this.isCellOccupiedByExternalOrOwnTail(
								x,
								y,
								movingPlayerId,
							),
						this.boardWidth,
						this.boardHeight,
					);
					// Помечаем игрока как обработанного, независимо от успеха хода
					movedPlayerIds.add(player.id);
				}
			}
		});

		// 3. Применение гравитации ко ВСЕМ игрокам ПОСЛЕ всех попыток движения
		this.applyGravityToAllPlayers();

		// 4. Проверка поедания яблок
		this.players.forEach((player) => {
			this.checkAppleEating(player);
		});

		// 5. Проверка условий победы
		if (this.apples.length === 0 && this.isActive) {
			console.log('Победа! Все яблоки съедены!');
			this.stop();
			return;
		}
	}

	private render(): void {
		this.renderer.render(this.players, this.apples, this.blocks);
	}

	// --- Новая логика проверки коллизий и гравитации ---

	/**
	 * Проверяет, занята ли ячейка чем-то "внешним" по отношению к игроку `excludePlayerId`.
	 * Внешнее = Земля (граница), блок или *другой* игрок.
	 * @param x Координата X
	 * @param y Координата Y
	 * @param excludePlayerId ID игрока, чьи сегменты ИГНОРИРУЮТСЯ при проверке.
	 * @returns true, если ячейка занята внешним объектом.
	 */
	private isCellOccupiedByExternal(
		x: number,
		y: number,
		excludePlayerId: number,
	): boolean {
		if (x < 0 || x >= this.boardWidth || y < 0 || y >= this.boardHeight) {
			return true;
		}

		if (this.blocks.some((block) => block.x === x && block.y === y)) {
			return true;
		}

		for (const player of this.players) {
			if (
				player.id !== excludePlayerId &&
				player.segments.some((seg) => seg.x === x && seg.y === y)
			) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Специальная проверка для метода performMove.
	 * Позволяет голове двигаться на место своего хвоста, но не на блоки/других игроков.
	 * @param x Координата X для проверки
	 * @param y Координата Y для проверки
	 * @param movingPlayerId ID игрока, который пытается сделать ход
	 * @returns true если клетка занята блоком, другим игроком, или хвостом СВОЕГО ЖЕ игрока (кроме головы)
	 */
	private isCellOccupiedByExternalOrOwnTail(
		x: number,
		y: number,
		movingPlayerId: number,
	): boolean {
		if (this.isCellOccupiedByExternal(x, y, movingPlayerId)) {
			return true;
		}

		const movingPlayer = this.players.find((p) => p.id === movingPlayerId);
		if (movingPlayer) {
			for (let i = 1; i < movingPlayer.segments.length; i++) {
				if (
					movingPlayer.segments[i].x === x &&
					movingPlayer.segments[i].y === y
				) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Проверяет, есть ли под указанной точкой (x, y) внешняя опора.
	 * Игнорирует сегменты игрока с ID = ownPlayerId.
	 * @param x Координата X
	 * @param y Координата Y
	 * @param ownPlayerId ID игрока, для которого проверяется опора
	 * @returns true, если есть внешняя опора непосредственно под (x, y).
	 */
	private hasExternalSupportBelow(
		x: number,
		y: number,
		ownPlayerId: number,
	): boolean {
		const belowY = y + 1;
		// Проверка земли
		if (belowY >= this.boardHeight) {
			return true;
		}
		return this.isCellOccupiedByExternal(x, belowY, ownPlayerId);
	}

	/**
	 * Находит расстояние до ближайшего ВНЕШНЕГО препятствия строго вниз от (x, y).
	 * Игнорирует сегменты игрока ownPlayerId.
	 * Возвращает boardHeight - y, если препятствий нет до самого дна.
	 * @param x Координата X
	 * @param y Координата Y
	 * @param ownPlayerId ID игрока, чьи сегменты игнорировать
	 * @returns Расстояние (1 = препятствие прямо под клеткой).
	 */
	private findDistanceToExternalObstacleBelow(
		x: number,
		y: number,
		ownPlayerId: number,
	): number {
		let distance = 1;
		while (true) {
			const checkY = y + distance;
			if (checkY >= this.boardHeight) {
				return distance;
			}
			if (this.isCellOccupiedByExternal(x, checkY, ownPlayerId)) {
				return distance;
			}
			distance++;
			if (distance > this.boardHeight) {
				console.error('Ошибка в расчете дистанции падения!');
				return 1;
			}
		}
	}

	private applyGravityToPlayer(player: Player): void {
		if (player.segments.length === 0) return;

		let isSupportedExternally = false;
		for (const segment of player.segments) {
			if (this.hasExternalSupportBelow(segment.x, segment.y, player.id)) {
				isSupportedExternally = true;
				break;
			}
		}

		if (!isSupportedExternally) {
			let minFallDistance = this.boardHeight;

			for (const segment of player.segments) {
				const distance = this.findDistanceToExternalObstacleBelow(
					segment.x,
					segment.y,
					player.id,
				);
				minFallDistance = Math.min(minFallDistance, distance);
			}

			const fallAmount = minFallDistance - 1;

			if (fallAmount > 0) {
				player.shiftBy(0, fallAmount);
			}
		}
	}

	private applyGravityToAllPlayers(): void {
		this.players.forEach((player) => this.applyGravityToPlayer(player));
	}

	private checkAppleEating(player: Player): void {
		if (player.segments.length === 0) return;
		const head: Point = player.segments[0];

		const eatenAppleIndex: number = this.apples.findIndex(
			(apple: Apple) => head.x === apple.x && head.y === apple.y,
		);

		if (eatenAppleIndex !== -1) {
			console.log(`Игрок ${player.id} съел яблоко!`);
			player.length++;
			this.apples.splice(eatenAppleIndex, 1);
		}
	}
}
