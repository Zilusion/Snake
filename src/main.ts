import './styles/main.scss';
import { Game } from './game';
import type { LevelData } from './types';

const CELL_SIZE = 40;
const LS_KEY_SAVED_LEVEL_SERVER_ID = 'snakeGameSavedLevelServerId';

let currentGame: Game | null = null;
let currentUser: { id: number; username: string } | null = null;
let availableServerLevels: {
	id: string;
	name: string;
	is_completed: boolean;
	layout: LevelData;
	is_locked: boolean;
}[] = [];
let currentLevelServerId: string | null = null;
let levelStartTime: number | null = null;

// --- Элементы UI ---
const gameContainer = document.createElement('div');
gameContainer.classList.add('game-container');
const controlsDiv = document.createElement('div');
controlsDiv.classList.add('controls-container');
const authDiv = document.createElement('div');
authDiv.classList.add('auth-container');
let victoryModal: HTMLElement | null = null;

// --- Вспомогательные функции для API ---
const API_BASE_URL = '/api'; // Будет проксироваться Vite


async function apiRequest(
	endpoint: string,
	method: string = 'GET',
	body?: object,
) {
	const options: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include', // Важно для сессий и кук
	};
	if (body) {
		options.body = JSON.stringify(body);
	}
	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: response.statusText }));
			console.error(
				`API Error ${response.status} for ${method} ${endpoint}:`,
				errorData.message,
			);
			alert(`Ошибка: ${errorData.message || response.statusText}`); // Простое оповещение
			if (response.status === 401 && endpoint !== '/auth/me') {
				// Если не авторизован (и это не проверка /me)
				currentUser = null;
				updateAuthUI(); // Обновить UI, чтобы показать форму входа
			}
			throw new Error(errorData.message || response.statusText);
		}
		if (
			response.status === 204 ||
			response.headers.get('content-length') === '0'
		) {
			// No content
			return null;
		}
		return await response.json();
	} catch (error) {
		console.error(
			`Network or parsing error for ${method} ${endpoint}:`,
			error,
		);
		throw error;
	}
}

// --- Функции аутентификации ---
async function registerUser(username: string, password: string) {
	try {
		const data = await apiRequest('/auth/register', 'POST', {
			username,
			password,
		});
		currentUser = data.user;
		updateAuthUI();
		fetchAvailableLevels(); // Загружаем уровни для нового пользователя
	} catch {
		/* Уже обработано в apiRequest */
	}
}

async function loginUser(username: string, password: string) {
	try {
		const data = await apiRequest('/auth/login', 'POST', {
			username,
			password,
		});
		currentUser = data.user;
		updateAuthUI();
		fetchAvailableLevels();
	} catch {
		/* Уже обработано в apiRequest */
	}
}

async function logoutUser() {
	try {
		await apiRequest('/auth/logout', 'POST');
		currentUser = null;
		updateAuthUI();
		fetchAvailableLevels(); // Загружаем уровни для анонима
	} catch {
		/* Уже обработано в apiRequest */
	}
}

async function fetchCurrentUser() {
	try {
		const data = await apiRequest('/auth/me');
		currentUser = data ? data.user : null;
	} catch {
		currentUser = null; // Ошибка означает, что не авторизован
	}
	updateAuthUI();
	await fetchAvailableLevels(); // Загрузка уровней после определения пользователя
}

function loadLevel(levelLayout: LevelData, levelIdFromServer: string): void {
	if (currentGame) {
		currentGame.destroy();
		currentGame = null;
		gameContainer.innerHTML = '';
	}
	currentLevelServerId = levelIdFromServer;
	try {
		localStorage.setItem(LS_KEY_SAVED_LEVEL_SERVER_ID, levelIdFromServer);
	} catch (error) {
		console.error('Ошибка сохранения ID уровня:', error);
	}

	console.log(`Загрузка уровня: ${levelIdFromServer}`);
	try {
		levelStartTime = performance.now(); // Начинаем замер времени
		apiRequest('/game/start_attempt', 'POST', {
			levelId: currentLevelServerId,
		})
			.then((data) =>
				console.log('Попытка игры начата на сервере:', data),
			)
			.catch((error) =>
				console.error('Ошибка старта попытки на сервере:', error),
			);

		currentGame = new Game(
			levelLayout, // Передаем только layout
			CELL_SIZE,
			gameContainer,
			(completedLevelLayout) =>
				handleVictory(completedLevelLayout, levelIdFromServer), // Передаем и ID
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
async function handleVictory(_completedLevelLayout: LevelData, completedLevelServerId: string): Promise<void> {
    console.log(`Победа на уровне: ${completedLevelServerId}!`);
    const completionTimeMs = levelStartTime ? Math.round(performance.now() - levelStartTime) : 0;
    levelStartTime = null;

    if (currentGame) {
        startButton.disabled = false;
        stopButton.disabled = true;
    }

    try {
        await apiRequest('/game/complete_level', 'POST', {
            levelId: completedLevelServerId,
            bestTimeMs: completionTimeMs,
            finalLength: currentGame?.players[0]?.length || 0, // Пример
        });
        console.log('Данные о победе отправлены на сервер.');
        await fetchAvailableLevels(); // Обновляем список уровней (мог открыться следующий)
    } catch (error) {
        console.error('Ошибка отправки данных о победе:', error);
    }
    showVictoryModal();
}

async function fetchAvailableLevels() {
    console.log('Запрос списка доступных уровней...');
    try {
        const levelsDataFromServer = await apiRequest('/levels') as { id: string; name: string; is_completed: boolean; layout: LevelData, is_locked: boolean }[];
		availableServerLevels = levelsDataFromServer || [];
		console.log('Доступные уровни:', availableServerLevels);
        updateLevelSelectionUI();

        if (availableServerLevels.length > 0) {
            let levelToLoad: { id: string; name: string; is_completed: boolean; layout: LevelData } | undefined;
            const savedLevelId = localStorage.getItem(LS_KEY_SAVED_LEVEL_SERVER_ID);

            if (savedLevelId) {
                levelToLoad = availableServerLevels.find(l => l.id === savedLevelId && l.layout);
            }
            if (!levelToLoad) { // Если сохраненный не найден или не доступен
                levelToLoad = availableServerLevels.find(l => l.layout); // Первый доступный
            }

            if (levelToLoad && levelToLoad.layout) {
                loadLevel(levelToLoad.layout, levelToLoad.id);
            } else if (currentUser && availableServerLevels.length > 0) {
                 gameContainer.innerHTML = `<p style="text-align: center;">Все доступные уровни пройдены! Поздравляем!</p>`;
                 disableGameControls();
            } else if (!currentUser && availableServerLevels.length > 0 && availableServerLevels[0].layout) {
                 // Для анонима загружаем первый, если он есть
                 loadLevel(availableServerLevels[0].layout, availableServerLevels[0].id);
            } else {
                 console.error('Нет доступных уровней для загрузки!');
                 gameContainer.innerHTML = '<p style="color: red; text-align: center;">Нет доступных уровней!</p>';
                 disableGameControls();
            }
        } else {
            gameContainer.innerHTML = '<p style="color: red; text-align: center;">Не удалось загрузить уровни с сервера.</p>';
            disableGameControls();
        }
    } catch (error) {
        gameContainer.innerHTML = '<p style="color: red; text-align: center;">Ошибка загрузки уровней. См. консоль.</p>';
        disableGameControls();
    }
}

function disableGameControls() {
    startButton.disabled = true;
    stopButton.disabled = true;
    resetButton.disabled = true;
}

// --- UI Создание и Обновление ---
function createAuthUI() {
    const usernameLabel = document.createElement('label');
    usernameLabel.htmlFor = 'username';
    usernameLabel.textContent = 'Имя:';
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Имя пользователя';

    const passwordLabel = document.createElement('label');
    passwordLabel.htmlFor = 'password';
    passwordLabel.textContent = 'Пароль:';
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Пароль';

    const registerButton = document.createElement('button');
    registerButton.textContent = 'Регистрация';
    registerButton.addEventListener('click', () => registerUser(usernameInput.value, passwordInput.value));

    const loginButton = document.createElement('button');
    loginButton.textContent = 'Вход';
    loginButton.addEventListener('click', () => loginUser(usernameInput.value, passwordInput.value));

    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Выход';
    logoutButton.addEventListener('click', logoutUser);
    logoutButton.style.display = 'none'; // Сначала скрыт

    const currentUserSpan = document.createElement('span');
    currentUserSpan.id = 'currentUserSpan';
    currentUserSpan.style.marginLeft = '10px';

    authDiv.append(
        usernameLabel, usernameInput, passwordLabel, passwordInput,
        registerButton, loginButton, logoutButton, currentUserSpan
    );
    document.body.prepend(authDiv); // Добавляем в начало body
}

function updateAuthUI() {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const registerBtn = authDiv.querySelector('button:nth-of-type(1)') as HTMLButtonElement;
    const loginBtn = authDiv.querySelector('button:nth-of-type(2)') as HTMLButtonElement;
    const logoutBtn = authDiv.querySelector('button:nth-of-type(3)') as HTMLButtonElement;
    const currentUserSpan = document.getElementById('currentUserSpan') as HTMLSpanElement;

    if (currentUser) {
        if (usernameInput) usernameInput.style.display = 'none';
        if (passwordInput) passwordInput.style.display = 'none';
        authDiv.querySelector('label[for="username"]')?.remove();
        authDiv.querySelector('label[for="password"]')?.remove();
        if (registerBtn) registerBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (currentUserSpan) currentUserSpan.textContent = `Привет, ${currentUser.username}!`;
    } else {
        if (usernameInput) { usernameInput.style.display = 'inline-block'; usernameInput.value = ''; }
        if (passwordInput) { passwordInput.style.display = 'inline-block'; passwordInput.value = ''; }
        // Восстанавливаем label, если они были удалены (или просто не удаляем)
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (currentUserSpan) currentUserSpan.textContent = '';
    }
}

function updateLevelSelectionUI() {
    controlsDiv.innerHTML = ''; // Очищаем старые кнопки уровней
    availableServerLevels.forEach((serverLevel) => {
        if (serverLevel.layout) { // Показываем кнопку только если уровень доступен (layout есть)
            const levelButton = document.createElement('button');
            levelButton.textContent = `${serverLevel.name}${serverLevel.is_completed ? ' ✔️' : ''}`;
            levelButton.disabled = serverLevel.is_locked;
            levelButton.addEventListener('click', () => loadLevel(serverLevel.layout, serverLevel.id));
            controlsDiv.append(levelButton);
        } else { // Если уровень заблокирован сервером
            const lockedLevelDiv = document.createElement('div');
            lockedLevelDiv.textContent = `${serverLevel.name} (Заблокировано)`;
            lockedLevelDiv.style.padding = '8px 15px';
            lockedLevelDiv.style.color = '#777';
            controlsDiv.append(lockedLevelDiv);
        }
    });
    controlsDiv.append(startButton, stopButton, resetButton);
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
	nextLevelButton.addEventListener('click', async () => {
		hideVictoryModal();
            await fetchAvailableLevels(); // Перезагружаем уровни, чтобы найти следующий доступный
            // Логика поиска *действительно* следующего доступного уровня после победы
            const currentLevelIndexInAvailable = availableServerLevels.findIndex(l => l.id === currentLevelServerId);
            if (currentLevelIndexInAvailable !== -1) {
                for (let i = currentLevelIndexInAvailable + 1; i < availableServerLevels.length; i++) {
                    if (availableServerLevels[i].layout) { // Нашли следующий доступный
                        loadLevel(availableServerLevels[i].layout, availableServerLevels[i].id);
                        return;
                    }
                }
                // Если дошли до конца и не нашли, возможно, все пройдено или это был последний
                console.log("Все доступные уровни после этого пройдены или это был последний.");
                // Можно показать сообщение "Все уровни пройдены" или вернуться к выбору
                 gameContainer.innerHTML = `<p style="text-align: center;">Поздравляем! Возможно, это был последний доступный уровень.</p>`;
                 disableGameControls();
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

function showVictoryModal(): void {
	if (!victoryModal) return;

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
	if (currentGame && currentLevelServerId) {
        const levelToReload = availableServerLevels.find(l => l.id === currentLevelServerId);
        if (levelToReload && levelToReload.layout) {
		    loadLevel(levelToReload.layout, levelToReload.id);
        } else {
            console.error("Не удалось перезапустить: данные текущего уровня не найдены");
        }
	}
});

document.body.append(controlsDiv);
document.body.append(gameContainer);
createAuthUI();
createVictoryModal();
fetchCurrentUser();

