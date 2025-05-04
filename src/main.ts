// import './styles/main.scss';

// // ========= Interfaces and Types =========
// type Point = {
// 	x: number;
// 	y: number;
// };

// type KeyCallback = () => void;

// type Direction = Readonly<Point>;

// const MoveDirections = {
// 	Up: { x: 0, y: -1 },
// 	Down: { x: 0, y: 1 },
// 	Left: { x: -1, y: 0 },
// 	Right: { x: 1, y: 0 },
// } as const;

// type DirectionValue = (typeof MoveDirections)[keyof typeof MoveDirections];

// type InputMap = Record<string, DirectionValue>;

// class InputManager {
// 	private keyListeners: Record<string, KeyCallback[]> = {};

// 	public constructor() {
// 		globalThis.addEventListener('keydown', (event: KeyboardEvent) =>
// 			this.keyDown(event),
// 		);
// 	}

// 	public registerKey(key: string, callback: KeyCallback): void {
// 		if (!this.keyListeners[key]) {
// 			this.keyListeners[key] = [];
// 		}
// 		this.keyListeners[key].push(callback);
// 	}

// 	private keyDown(event: KeyboardEvent): void {
// 		if (event.repeat) return;

// 		const key: string = event.key;
// 		const listeners = this.keyListeners[key];

// 		if (listeners) {
// 			listeners.forEach((callback: KeyCallback) => callback());
// 		}
// 	}
// }

// class Player {
// 	public readonly id: number;
// 	public segments: Point[];
// 	public direction: DirectionValue;
// 	public length: number;
// 	public readonly color: string;
// 	public canTurn: boolean;
// 	public moved: boolean;

// 	public constructor(
// 		id: number,
// 		startX: number,
// 		startY: number,
// 		color: string,
// 	) {
// 		this.id = id;
// 		this.segments = [{ x: startX, y: startY }];
// 		this.direction = MoveDirections.Right;
// 		this.length = 2;
// 		this.color = color;
// 		this.canTurn = true;
// 		this.moved = false;
// 	}

// 	public move(boardWidth: number, boardHeight: number): void {
// 		const head: Point = this.segments[0];
// 		const newHead: Point = {
// 			x: head.x + this.direction.x,
// 			y: head.y + this.direction.y,
// 		};

// 		if (newHead.x < 0) newHead.x = boardWidth - 1;
// 		if (newHead.x >= boardWidth) newHead.x = 0;
// 		if (newHead.y < 0) newHead.y = boardHeight - 1;
// 		if (newHead.y >= boardHeight) newHead.y = 0;

// 		this.segments.unshift(newHead);

// 		if (this.segments.length > this.length) {
// 			this.segments.pop();
// 		}
// 	}

// 	public setDirection(newDirection: DirectionValue): void {
// 		if (!this.canTurn) {
// 			console.log(`Player ${this.id}: Нельзя поворачивать в этом ходу`);
// 			return;
// 		}
// 		if (
// 			(newDirection.x !== 0 && newDirection.x === -this.direction.x) ||
// 			(newDirection.y !== 0 && newDirection.y === -this.direction.y)
// 		) {
// 			console.log(`Player ${this.id}: Нельзя поворачивать на 180° сразу`);
// 			return;
// 		}
// 		this.direction = newDirection;
// 		this.canTurn = false;
// 	}
// }

// class Apple implements Point {
// 	public readonly x: number;
// 	public readonly y: number;
// 	public readonly color: string;

// 	public constructor(x: number, y: number, color: string = '#FF000088') {
// 		this.x = x;
// 		this.y = y;
// 		this.color = color;
// 	}
// }

// class Renderer {
// 	private readonly canvas: HTMLCanvasElement;
// 	private readonly ctx: CanvasRenderingContext2D;
// 	private readonly cellSize: number;

// 	public constructor(canvas: HTMLCanvasElement, cellSize: number) {
// 		this.canvas = canvas;
// 		const context = canvas.getContext('2d');
// 		if (!context) {
// 			throw new Error('Не удалось получить 2D контекст для canvas');
// 		}
// 		this.ctx = context;
// 		this.cellSize = cellSize;
// 	}

// 	public render(players: Player[], apples: Apple[]): void {
// 		this.clear();
// 		apples.forEach((apple: Apple) => this.drawApple(apple));
// 		players.forEach((player: Player) => this.drawPlayer(player));
// 	}

// 	private clear(): void {
// 		this.ctx.fillStyle = '#FFF';
// 		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
// 	}

// 	private getRandomColor(): string {
// 		const o: (n: number) => number = Math.round;
// 		const r: () => number = Math.random;
// 		const s: number = 255;
// 		return `rgba(${o(r() * s)},${o(r() * s)},${o(r() * s)},${r().toFixed(1)})`;
// 	}

// 	private drawPlayer(player: Player): void {
// 		player.segments.forEach((segment: Point, index: number) => {
// 			this.ctx.fillStyle = player.color;
// 			this.ctx.fillRect(
// 				segment.x * this.cellSize,
// 				segment.y * this.cellSize,
// 				this.cellSize,
// 				this.cellSize,
// 			);

// 			if (index === 0) {
// 				this.ctx.fillStyle = '#00b20088';
// 				this.ctx.fillRect(
// 					segment.x * this.cellSize,
// 					segment.y * this.cellSize,
// 					this.cellSize,
// 					this.cellSize,
// 				);
// 			}
// 		});
// 	}

// 	private drawApple(apple: Apple): void {
// 		this.ctx.fillStyle = apple.color;
// 		this.ctx.fillRect(
// 			apple.x * this.cellSize,
// 			apple.y * this.cellSize,
// 			this.cellSize,
// 			this.cellSize,
// 		);
// 	}
// }

// // ========= Input Settings =========

// const inputSettings: InputMap[] = [
// 	{
// 		// Player 0 controls
// 		w: MoveDirections.Up,
// 		s: MoveDirections.Down,
// 		a: MoveDirections.Left,
// 		d: MoveDirections.Right,
// 	},
// 	{
// 		// Player 1 controls
// 		ArrowUp: MoveDirections.Up,
// 		ArrowDown: MoveDirections.Down,
// 		ArrowLeft: MoveDirections.Left,
// 		ArrowRight: MoveDirections.Right,
// 	},
// ];

// // ========= Class: Game =========

// class Game {
// 	private readonly canvas: HTMLCanvasElement;
// 	private readonly boardWidth: number;
// 	private readonly boardHeight: number;
// 	private readonly cellSize: number;
// 	private readonly renderer: Renderer;
// 	private readonly inputManager: InputManager;
// 	private players: Player[];
// 	private apples: Apple[];
// 	private isActive: boolean;
// 	private autoPlay: boolean = false;

// 	public constructor(
// 		boardWidthInCells: number,
// 		boardHeightInCells: number,
// 		cellSize: number,
// 	) {
// 		const canvasWidth: number = boardWidthInCells * cellSize;
// 		const canvasHeight: number = boardHeightInCells * cellSize;

// 		this.canvas = document.createElement('canvas');
// 		this.canvas.width = canvasWidth;
// 		this.canvas.height = canvasHeight;
// 		this.canvas.style.border = '1px solid black';
// 		this.canvas.style.margin = 'auto';
// 		this.canvas.style.display = 'block';

// 		if (!document.body) {
// 			throw new Error(
// 				'Document body не найден. Невозможно добавить canvas.',
// 			);
// 		}
// 		document.body.append(this.canvas);

// 		this.boardWidth = boardWidthInCells;
// 		this.boardHeight = boardHeightInCells;
// 		this.cellSize = cellSize;

// 		this.renderer = new Renderer(this.canvas, this.cellSize);
// 		this.inputManager = new InputManager();
// 		this.players = [];
// 		this.apples = [];
// 		this.isActive = true;
// 		this.autoPlay = false;
// 	}

// 	public addPlayer(player: Player): void {
// 		if (this.players.length >= inputSettings.length) {
// 			console.warn(
// 				`Не найдены настройки управления для игрока ${player.id}. Добавьте их в inputSettings.`,
// 			);
// 		}
// 		this.players.push(player);
// 	}

// 	public update(): void {
// 		// Проверяем, не заполнилось ли поле полностью
// 		if (this.getFreeCellsCount() === 0 && this.isActive) {
// 			console.log('Все клетки заняты! Игра окончена.');
// 			this.isActive = false;
// 		}

// 		if (!this.isActive) {
// 			return;
// 		}

// 		this.players.forEach((player: Player) => {
// 			if (player.moved) {
// 				player.move(this.boardWidth, this.boardHeight);
// 			}
// 		});

// 		this.players.forEach((player: Player) => {
// 			this.applyGravity(player);
// 		});

// 		this.checkCollisions();

// 		if (!this.isActive) {
// 			return;
// 		}

// 		this.players.forEach((player: Player) => {
// 			if (player.segments.length === 0) return;

// 			const head: Point = player.segments[0];
// 			const eatenAppleIndex: number = this.apples.findIndex(
// 				(apple: Apple) => head.x === apple.x && head.y === apple.y,
// 			);

// 			if (eatenAppleIndex !== -1) {
// 				console.log(`Игрок ${player.id} съел яблоко!`);
// 				player.length++;
// 				this.apples.splice(eatenAppleIndex, 1);
// 				this.addApple();
// 			}
// 		});

// 		this.players.forEach((player: Player) => {
// 			if (!player.canTurn) {
// 				player.canTurn = true;
// 			}
// 		});
// 	}

// 	public start(): void {
// 		this.setupInputs();
// 		this.addApple();
// 		this.renderer.render(this.players, this.apples);
// 		console.log('Игра началась!');
// 	}

// 	private getFreeCellsCount(): number {
// 		const totalCells: number = this.boardWidth * this.boardHeight;
// 		let occupiedCells: number = 0;
// 		this.players.forEach((player: Player) => {
// 			occupiedCells += player.segments.length;
// 		});
// 		// Считаем яблоки как занятые клетки? В оригинале нет, но для надежности можно добавить
// 		// occupiedCells += this.apples.length;
// 		return totalCells - occupiedCells;
// 	}

// 	private addApple(): void {
// 		if (this.getFreeCellsCount() <= 1) {
// 			console.log('Недостаточно места для добавления яблока.');
// 			return;
// 		}

// 		let x: number;
// 		let y: number;
// 		let collision: boolean;

// 		do {
// 			x = Math.floor(Math.random() * this.boardWidth);
// 			y = Math.floor(Math.random() * this.boardHeight);

// 			const playerCollision = this.players.some((player: Player) =>
// 				player.segments.some(
// 					(segment: Point) => segment.x === x && segment.y === y,
// 				),
// 			);
// 			const appleCollision = this.apples.some(
// 				(apple: Apple) => apple.x === x && apple.y === y,
// 			);

// 			collision = playerCollision || appleCollision;
// 		} while (collision);

// 		this.apples.push(new Apple(x, y));
// 	}

// 	private fillApples(): void {
// 		this.apples = [];
// 		for (let y = 0; y < this.boardHeight; y++) {
// 			for (let x = 0; x < this.boardWidth; x++) {
// 				const occupiedByPlayer = this.players.some((player: Player) =>
// 					player.segments.some(
// 						(seg: Point) => seg.x === x && seg.y === y,
// 					),
// 				);
// 				if (!occupiedByPlayer) {
// 					this.apples.push(new Apple(x, y));
// 				}
// 			}
// 		}
// 	}

// 	private applyGravity(player: Player): void {
// 		if (player.segments.length === 0) return;

// 		let lowestY = -1;
// 		player.segments.forEach((segment) => {
// 			if (segment.y > lowestY) {
// 				lowestY = segment.y;
// 			}
// 		});

// 		while (lowestY < this.boardHeight - 1) {
// 			const isSupported = player.segments.some((segment) => {
// 				return (
// 					segment.y === lowestY &&
// 					player.segments.some(
// 						(support) =>
// 							support.x === segment.x &&
// 							support.y === segment.y + 1,
// 					)
// 				);
// 			});

// 			if (isSupported) {
// 				break;
// 			} else {
// 				player.segments.forEach((segment: Point) => {
// 					segment.y += 1;
// 				});
// 				lowestY++;
// 			}
// 		}
// 	}

// 	private setupInputs(): void {
// 		if (this.autoPlay) return;

// 		for (let i = 0; i < this.players.length; i++) {
// 			const playerSettings: InputMap | undefined = inputSettings[i];
// 			const currentPlayer: Player | undefined = this.players[i];

// 			if (playerSettings && currentPlayer) {
// 				Object.entries(playerSettings).forEach(
// 					([key, direction]: [string, DirectionValue]) => {
// 						this.inputManager.registerKey(key, () => {
// 							if (!this.isActive) return;

// 							currentPlayer.setDirection(direction);
// 							currentPlayer.moved = true; // Помечаем, что игрок должен двигаться в этом обновлении
// 							// Важно: Обновление и рендер вызываются СРАЗУ после нажатия клавиши.
// 							// Это event-driven подход, а не классический game loop.
// 							this.update(); // Запускаем логику обновления немедленно
// 							currentPlayer.moved = false; // Сбрасываем флаг moved после обновления
// 							this.renderer.render(this.players, this.apples); // Перерисовываем немедленно
// 						});
// 					},
// 				);
// 			} else {
// 				// Предупреждаем, если настройки не найдены (но не прерываем игру)
// 				console.warn(
// 					`Настройки управления для игрока с индексом ${i} не найдены.`,
// 				);
// 			}
// 		}
// 	}

// 	// Приватный метод для проверки всех коллизий
// 	private checkCollisions(): void {
// 		// 1. Проверка столкновений игроков самих с собой
// 		for (const player of this.players) {
// 			if (player.segments.length < 2) continue; // Нельзя столкнуться с собой, если сегментов меньше 2

// 			const head: Point = player.segments[0];
// 			// Проверяем столкновение головы с остальными сегментами (начиная с индекса 1)
// 			for (let i = 1; i < player.segments.length; i++) {
// 				const segment: Point = player.segments[i];
// 				if (head.x === segment.x && head.y === segment.y) {
// 					console.log(
// 						`Игрок ${player.id} столкнулся сам с собой! Игра окончена.`,
// 					);
// 					this.isActive = false;
// 					return; // Завершаем проверку, игра окончена
// 				}
// 			}
// 		}

// 		// Если игра уже неактивна после первой проверки, выходим
// 		if (!this.isActive) return;

// 		// 2. Проверка столкновений между разными игроками
// 		for (let i = 0; i < this.players.length; i++) {
// 			const playerA: Player = this.players[i];
// 			if (playerA.segments.length === 0) continue; // Пропускаем игрока без сегментов
// 			const headA: Point = playerA.segments[0];

// 			for (let j = 0; j < this.players.length; j++) {
// 				if (i === j) continue; // Не проверяем игрока самого с собой здесь

// 				const playerB: Player = this.players[j];
// 				// Проверяем столкновение головы игрока A со всеми сегментами игрока B
// 				for (const segmentB of playerB.segments) {
// 					if (headA.x === segmentB.x && headA.y === segmentB.y) {
// 						console.log(
// 							`Игрок ${playerA.id} столкнулся с игроком ${playerB.id}! Игра окончена.`,
// 						);
// 						this.isActive = false;
// 						return; // Завершаем проверку, игра окончена
// 					}
// 				}
// 			}
// 		}
// 	}
// }

// // ========= Initialization =========

// // Создаем экземпляр игры (поле 10x10, размер ячейки 50px)
// const game = new Game(10, 10, 50);

// // Добавляем игроков
// game.addPlayer(new Player(0, 1, 1, '#00FF00AA')); // Зеленый игрок (чуть сдвинул от края)
// game.addPlayer(new Player(1, 8, 8, '#FF00FFAA')); // Фиолетовый игрок (чуть сдвинул от края)

// // Запускаем игру
// game.start();

// import './styles/main.scss'; // Импорт стилей
// import { Game } from './game';
// import { level1 } from './level'; // Импортируем наш уровень

// const CELL_SIZE = 100; // Размер ячейки в пикселях

// // Создаем и запускаем игру с первым уровнем
// const game = new Game(level1, CELL_SIZE);
// game.start();

// // Дополнительно: можно добавить кнопки управления Start/Stop/Reset
// const controlsDiv = document.createElement('div');
// controlsDiv.style.display = 'flex';
// controlsDiv.style.justifyContent = 'center';
// controlsDiv.style.gap = '10px';
// controlsDiv.style.textAlign = 'center';
// controlsDiv.style.marginTop = '10px';
// controlsDiv.style.color = 'black';

// const startButton = document.createElement('button');
// startButton.textContent = 'Start';
// startButton.addEventListener('click', () => game.start());

// const stopButton = document.createElement('button');
// stopButton.textContent = 'Stop';
// stopButton.addEventListener('click', () => game.stop());

// // Кнопка Reset потребует больше логики (пересоздание Game или метод reset())
// // const resetButton = document.createElement('button');
// // resetButton.textContent = 'Reset';
// // resetButton.onclick = () => { /* Логика сброса */ };

// controlsDiv.append(startButton, stopButton);
// document.body.append(controlsDiv);

import './styles/main.scss';
import { Game } from './game';
import { allLevels } from './level';
import type { LevelData } from './types';

const CELL_SIZE = 40;
const LS_KEY_CURRENT_LEVEL = 'snakeGameCurrentLevelIndex';

let currentGame: Game | null = null;
const gameContainer = document.createElement('div');
const controlsDiv = document.createElement('div');
let victoryModal: HTMLElement | null = null;
controlsDiv.classList.add('controls-container');

function loadLevel(levelData: LevelData): void {
	if (currentGame) {
		console.log(`Остановка предыдущей игры.`);
		currentGame.destroy();
		currentGame = null;
		gameContainer.innerHTML = '';
	}

	// --- СОХРАНЕНИЕ УРОВНЯ ---
	const levelIndex = allLevels.indexOf(levelData);
	if (levelIndex === -1) {
		console.warn(
			'Не удалось найти индекс загружаемого уровня для сохранения.',
		);
	} else {
		try {
			localStorage.setItem(LS_KEY_CURRENT_LEVEL, levelIndex.toString());
			console.log(`Сохранен индекс уровня: ${levelIndex}`);
		} catch (error) {
			console.error(
				'Не удалось сохранить уровень в localStorage:',
				error,
			);
		}
	}

	console.log(`Загрузка уровня...`);
	try {
		currentGame = new Game(
			levelData,
			CELL_SIZE,
			gameContainer,
			handleVictory,
		);
		currentGame.start();
		startButton.disabled = true;
		stopButton.disabled = false;
		resetButton.disabled = false;
		hideVictoryModal();
	} catch (error) {
		console.error('Ошибка при создании или запуске игры:', error);
		gameContainer.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки игры. См. консоль.</p>`;
		startButton.disabled = true;
		stopButton.disabled = true;
		resetButton.disabled = true;
	}
}

function handleVictory(completedLevelData: LevelData): void {
	console.log('Победа на уровне!');
	if (currentGame) {
		startButton.disabled = false;
		stopButton.disabled = true;
	}
	showVictoryModal(completedLevelData);
}

function createVictoryModal(): void {
	victoryModal = document.createElement('div');
	victoryModal.className = 'modal victory-modal';
	victoryModal.style.display = 'none';

	const modalContent = document.createElement('div');
	modalContent.className = 'modal-content';

	const title = document.createElement('h2');
	title.textContent = 'Победа!';
	title.className = 'modal-title';

	const message = document.createElement('p');
	message.textContent = 'Все яблоки съедены!';
	message.className = 'modal-message';

	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'modal-buttons';

	const nextLevelButton = document.createElement('button');
	nextLevelButton.textContent = 'Следующий уровень';
	nextLevelButton.className = 'modal-button next-level-button';
	nextLevelButton.addEventListener('click', () => {
		if (!currentGame) return;
		const currentLevelIndex = allLevels.indexOf(currentGame.levelData);
		if (currentLevelIndex === -1) {
			hideVictoryModal();
		} else {
			const nextLevelIndex = (currentLevelIndex + 1) % allLevels.length;
			loadLevel(allLevels[nextLevelIndex]);
		}
	});

	const selectLevelButton = document.createElement('button');
	selectLevelButton.textContent = 'Выбрать уровень';
	selectLevelButton.className = 'modal-button select-level-button';
	selectLevelButton.addEventListener('click', hideVictoryModal);

	buttonContainer.append(nextLevelButton, selectLevelButton);
	modalContent.append(title, message, buttonContainer);
	victoryModal.append(modalContent);
	document.body.append(victoryModal);
}

function showVictoryModal(completedLevelData: LevelData): void {
	if (!victoryModal) return;

	const nextLevelButton =
		victoryModal.querySelector<HTMLButtonElement>('.next-level-button');
	if (nextLevelButton) {
		const currentLevelIndex = allLevels.indexOf(completedLevelData);
		console.log(currentLevelIndex);
		nextLevelButton.style.display = 'inline-block';
	}

	victoryModal.style.display = 'flex';
}

function hideVictoryModal(): void {
	if (victoryModal) {
		victoryModal.style.display = 'none';
	}
}

const startButton = document.createElement('button');
startButton.textContent = 'Старт';
startButton.disabled = true;
startButton.addEventListener('click', () => {
	if (currentGame && !currentGame.isActive) {
		currentGame.start();
		startButton.disabled = true;
		stopButton.disabled = false;
		hideVictoryModal();
	}
});

const stopButton = document.createElement('button');
stopButton.textContent = 'Стоп';
stopButton.disabled = true;
stopButton.addEventListener('click', () => {
	if (currentGame && currentGame.isActive) {
		currentGame.stop();
		startButton.disabled = false;
		stopButton.disabled = true;
	}
});

const resetButton = document.createElement('button');
resetButton.textContent = 'Перезапуск';
resetButton.disabled = true;
resetButton.addEventListener('click', () => {
	if (currentGame) {
		loadLevel(currentGame.levelData);
	}
});

allLevels.forEach((level, index) => {
	const levelButton = document.createElement('button');
	levelButton.textContent = `Уровень ${index + 1}`;
	levelButton.addEventListener('click', () => loadLevel(level));
	controlsDiv.append(levelButton);
});

controlsDiv.append(startButton, stopButton, resetButton);

document.body.append(controlsDiv);
document.body.append(gameContainer);
createVictoryModal();

let startingLevelIndex = 0;
try {
	const savedIndexString = localStorage.getItem(LS_KEY_CURRENT_LEVEL);
	if (savedIndexString !== null) {
		const savedIndex = Number.parseInt(savedIndexString, 10);

		if (
			!Number.isNaN(savedIndex) &&
			savedIndex >= 0 &&
			savedIndex < allLevels.length
		) {
			startingLevelIndex = savedIndex;
			console.log(
				`Загружен сохраненный индекс уровня: ${startingLevelIndex}`,
			);
		} else {
			console.warn(
				'Сохраненный индекс уровня невалиден, используется уровень 0.',
			);
			localStorage.removeItem(LS_KEY_CURRENT_LEVEL);
		}
	}
} catch (error) {
	console.error('Не удалось прочитать уровень из localStorage:', error);
}

if (allLevels.length > 0) {
	if (startingLevelIndex >= allLevels.length) {
		startingLevelIndex = 0;
	}
	loadLevel(allLevels[startingLevelIndex]);
} else {
	console.error('Нет доступных уровней для загрузки!');
	controlsDiv.innerHTML = '<p style="color: red;">Нет уровней!</p>';
}
