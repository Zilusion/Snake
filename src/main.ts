import './styles/main.scss';
import { Game } from './game';
import type { LevelData } from './types';
import * as api from './apiService';
import * as authStore from './authStore';
import { loadAllAssets } from './assetLoader';

const CELL_SIZE = 40;
const LS_KEY_SAVED_LEVEL_SERVER_ID = 'snakeGameSavedLevelServerId';

let currentGame: Game | null = null;
let availableServerLevels: {
	id: string;
	name: string;
	is_completed: boolean;
	layout: LevelData;
	is_locked: boolean;
}[] = [];
let currentLevelServerId: string | null = null;
let levelStartTime: number | null = null;

authStore.subscribe((user) => {
    updateAuthHeaderUI(user);
    if (user) {
        showPage('game'); 
        fetchAvailableLevels(); 
    } else {
        updateLevelSelectionUI(); 
        if (currentGame) {
            currentGame.destroy();
            currentGame = null;
        }
        gameCanvasContainer.innerHTML = ''; 
        disableGameControls();
        showPage('auth');
        createAuthForms();
    }
});


const appHeader = document.getElementById('app-header')!;
const authPage = document.getElementById('auth-page') as HTMLElement;
const gamePage = document.getElementById('game-page') as HTMLElement;
const adminPage = document.getElementById('admin-page') as HTMLElement;
const adminContent = document.getElementById('admin-content') as HTMLElement;
const levelSelectionContainer = document.getElementById('level-selection-container') as HTMLElement;
const gameCanvasContainer = document.getElementById('game-canvas-container') as HTMLElement;
const gameControlsContainer = document.getElementById('game-controls-container') as HTMLElement;
const victoryModalContainer = document.getElementById('victory-modal-container') as HTMLElement;

let logoutButton: HTMLButtonElement;
let adminButton: HTMLButtonElement;
let currentUserSpan: HTMLSpanElement;
let startButton: HTMLButtonElement;
let stopButton: HTMLButtonElement;
let resetButton: HTMLButtonElement;


function showPage(pageId: 'auth' | 'game' | 'admin') {
    authPage.style.display = 'none';
	gamePage.style.display = 'none';
	adminPage.style.display = 'none';

    if (pageId === 'auth') {
        authPage.style.display = 'block';
    } else if (pageId === 'game') {
        gamePage.style.display = 'flex';
    } else if (pageId === 'admin') {
		adminPage.style.display = 'block';
		loadAdminStats();
    }
}

async function loadAdminStats() {
    try {
        const overallStats = await api.getAdminOverallStats();
        const usersStats = await api.getAdminUsersStats();
        const levelsStats = await api.getAdminLevelsStats();

		adminContent.innerHTML = '';
        renderOverallStats(overallStats);
        renderUsersStats(usersStats);
        renderLevelsStats(levelsStats);

    } catch (error) {
        adminContent.innerHTML = `<p style="color: red;">Ошибка загрузки статистики: ${error instanceof Error ? error.message : String(error)}</p>`;
    }
}

function renderOverallStats(stats: any) {
    const section = document.createElement('section');
    section.innerHTML = `
        <h3>Общая статистика</h3>
        <p>Всего пользователей: ${stats.usersCount}</p>
        <p>Всего попыток игры: ${stats.totalAttempts}</p>
        <p>Успешных попыток: ${stats.successfulAttempts}</p>
        <p>Среднее время прохождения (успешного): ${stats.averageCompletionTimeMs ? (stats.averageCompletionTimeMs / 1000).toFixed(2) + ' сек' : 'Нет данных'}</p>
        <p>Самый сложный уровень: ${stats.hardestLevel.name} (Успех: ${stats.hardestLevel.success_rate !== null ? stats.hardestLevel.success_rate.toFixed(1) + '%' : 'Нет данных'})</p>
    `;
    adminContent.appendChild(section);
}

function renderUsersStats(users: any[]) {
    const section = document.createElement('section');
    section.innerHTML = '<h3>Статистика по пользователям</h3>';
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Всего попыток</th>
                <th>Успешных</th>
                <th>Прогресс по уровням (ID: Попыток / Время)</th>
            </tr>
        </thead>
        <tbody>
        ${users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.totalAttempts}</td>
                <td>${user.successfulAttempts}</td>
                <td>
                    ${user.levelProgress.map((p: any) =>
                        `${p.level_name}: ${p.attempts} / ${p.is_completed ? (p.best_time_ms / 1000).toFixed(1) + 'с' : '-'}`
                    ).join('<br>')}
                </td>
            </tr>
        `).join('')}
        </tbody>
    `;
    section.appendChild(table);
    adminContent.appendChild(section);
}

function renderLevelsStats(levels: any[]) {
    const section = document.createElement('section');
    section.innerHTML = '<h3>Статистика по уровням</h3>';
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Всего попыток</th>
                <th>Успешных</th>
                <th>% Прохождения</th>
                <th>Среднее время (успех)</th>
            </tr>
        </thead>
        <tbody>
        ${levels.map(level => `
            <tr>
                <td>${level.id}</td>
                <td>${level.name}</td>
                <td>${level.total_attempts || 0}</td>
                <td>${level.successful_completions || 0}</td>
                <td>${level.success_percentage !== null ? level.success_percentage.toFixed(1) + '%' : 'N/A'}</td>
                <td>${level.avg_completion_time_ms ? (level.avg_completion_time_ms / 1000).toFixed(2) + ' сек' : '-'}</td>
            </tr>
        `).join('')}
        </tbody>
    `;
    section.appendChild(table);
    adminContent.appendChild(section);
}


function createHeaderUI() {
    appHeader.innerHTML = '';
    currentUserSpan = document.createElement('span');
    currentUserSpan.id = 'currentUserSpan';
    currentUserSpan.classList.add('current-user-display');

    logoutButton = document.createElement('button');
    logoutButton.textContent = 'Выход';
    logoutButton.classList.add('button', 'button-logout');
    logoutButton.addEventListener('click', logout); 
    logoutButton.style.display = 'none';

    const title = document.createElement('h1');
    title.textContent = 'Змеепад';
	title.classList.add('app-title');
	
	adminButton = document.createElement('button');
	adminButton.textContent = 'Админка';
	adminButton.classList.add('button', 'button-admin');
	adminButton.addEventListener('click', () => showPage('admin'));
	adminButton.style.display = 'none';

    appHeader.append(title, currentUserSpan, logoutButton, adminButton);
}

function createAuthForms() {
    authPage.innerHTML = '';
    const formContainer = document.createElement('div');
    formContainer.classList.add('auth-form-container');

    const title = document.createElement('h2');
    title.textContent = 'Вход или Регистрация';

    const usernameLabel = document.createElement('label');
    usernameLabel.htmlFor = 'username';
    usernameLabel.textContent = 'Имя пользователя:';
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Логин';
    usernameInput.required = true;

    const passwordLabel = document.createElement('label');
    passwordLabel.htmlFor = 'password';
    passwordLabel.textContent = 'Пароль:';
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Пароль';
    passwordInput.required = true;

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('auth-buttons');

    const registerButtonElement = document.createElement('button'); 
    registerButtonElement.textContent = 'Регистрация';
    registerButtonElement.classList.add('button');
    registerButtonElement.addEventListener('click', () => {
        if (usernameInput.value && passwordInput.value) {
            register(usernameInput.value, passwordInput.value);
        } else {
            alert('Пожалуйста, введите имя пользователя и пароль.');
        }
    });

    const loginButtonElement = document.createElement('button'); 
    loginButtonElement.textContent = 'Вход';
    loginButtonElement.classList.add('button');
    loginButtonElement.addEventListener('click', () => {
         if (usernameInput.value && passwordInput.value) {
            login(usernameInput.value, passwordInput.value);
        } else {
            alert('Пожалуйста, введите имя пользователя и пароль.');
        }
    });

    buttonGroup.append(loginButtonElement, registerButtonElement);
    formContainer.append(title, usernameLabel, usernameInput, passwordLabel, passwordInput, buttonGroup);
    authPage.append(formContainer);
}

function updateAuthHeaderUI(user: { id: number; username: string } | null = null) {
    if (user) {
        currentUserSpan.textContent = `Игрок: ${user.username}`;
		logoutButton.style.display = 'inline-block';
		adminButton.style.display = 'inline-block';
    } else {
        currentUserSpan.textContent = '';
        logoutButton.style.display = 'none';
    }
}

function updateLevelSelectionUI() {
    levelSelectionContainer.innerHTML = '';
    const user = authStore.getCurrentUser();

    if (!user) {
        levelSelectionContainer.innerHTML = '<p class="auth-required-message">Для доступа к уровням необходимо войти в систему.</p>';
        gameCanvasContainer.innerHTML = '';
        disableGameControls();
        return;
    }

    if (!availableServerLevels || availableServerLevels.length === 0) {
         levelSelectionContainer.innerHTML = '<p class="no-levels-message">Нет доступных уровней или ошибка загрузки.</p>';
         gameCanvasContainer.innerHTML = '';
         disableGameControls();
         return;
    }

    const listTitle = document.createElement('h3');
    listTitle.textContent = "Выберите уровень для игры:";
    listTitle.classList.add('level-selection-title');
    levelSelectionContainer.append(listTitle);

    const levelList = document.createElement('div');
    levelList.classList.add('level-list');

    availableServerLevels.forEach((serverLevel) => {
        const levelButton = document.createElement('button');
        levelButton.classList.add('button', 'level-button');
        if (serverLevel.is_completed) levelButton.classList.add('completed');
        if (serverLevel.is_locked) levelButton.classList.add('locked');

        levelButton.textContent = `${serverLevel.name}${serverLevel.is_completed ? ' ✔️' : ''}${serverLevel.is_locked ? ' 🔒' : ''}`;
        levelButton.disabled = serverLevel.is_locked;

        if (!serverLevel.is_locked && serverLevel.layout) {
            levelButton.addEventListener('click', () => {
                levelSelectionContainer.style.display = 'none';
                gameControlsContainer.style.display = 'flex'; 
                loadLevel(serverLevel.layout, serverLevel.id);
            });
        }
        levelList.append(levelButton);
    });
    levelSelectionContainer.append(levelList);
    levelSelectionContainer.style.display = 'flex';
    gameCanvasContainer.innerHTML = '<p class="select-level-prompt">Выберите уровень, чтобы начать игру.</p>';
    disableGameControls();
}

function createGameControls() {
    gameControlsContainer.innerHTML = '';
    gameControlsContainer.style.display = 'none'; 

    startButton = document.createElement('button');
    startButton.textContent = 'Старт';
    startButton.classList.add('button', 'game-control-button');
    startButton.disabled = true;
    startButton.addEventListener('click', () => {
        if (currentGame && !currentGame.isActive) {
            currentGame.start();
            startButton.textContent = 'Старт';
            startButton.disabled = true;
            stopButton.disabled = false;
            hideVictoryModal();
        }
    });

    stopButton = document.createElement('button');
    stopButton.textContent = 'Стоп';
    stopButton.classList.add('button', 'game-control-button');
    stopButton.disabled = true;
    stopButton.addEventListener('click', () => {
        if (currentGame && currentGame.isActive) {
            currentGame.stop();
            startButton.textContent = 'Продолжить';
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    });

    resetButton = document.createElement('button');
    resetButton.textContent = 'Перезапуск Уровня';
    resetButton.classList.add('button', 'game-control-button');
    resetButton.disabled = true;
    resetButton.addEventListener('click', () => {
        if (currentLevelServerId) { 
            const levelToReload = availableServerLevels.find(l => l.id === currentLevelServerId);
            if (levelToReload && levelToReload.layout) {
                hideVictoryModal(); 
                levelSelectionContainer.style.display = 'none'; 
                gameControlsContainer.style.display = 'flex'; 
                loadLevel(levelToReload.layout, levelToReload.id);
            } else {
                console.error("Не удалось перезапустить: данные текущего уровня не найдены");
            }
        }
	});

    const backToLevelsButton = document.createElement('button');
    backToLevelsButton.textContent = 'К выбору уровней';
    backToLevelsButton.classList.add('button', 'game-control-button');
    backToLevelsButton.addEventListener('click', () => {
        if (currentGame) {
            currentGame.destroy();
            currentGame = null;
        }
        gameCanvasContainer.innerHTML = '<p class="select-level-prompt">Выберите уровень, чтобы начать игру.</p>';
        levelSelectionContainer.style.display = 'flex';
        gameControlsContainer.style.display = 'none';
        disableGameControls();
        currentLevelServerId = null; 
        localStorage.removeItem(LS_KEY_SAVED_LEVEL_SERVER_ID); 
    });

    gameControlsContainer.append(startButton, stopButton, resetButton, backToLevelsButton);
}


function loadLevel(levelLayout: LevelData, levelIdFromServer: string): void {
	if (currentGame) {
		currentGame.destroy();
		currentGame = null;
	}
	gameCanvasContainer.innerHTML = '';
	currentLevelServerId = levelIdFromServer;
	try {
		localStorage.setItem(LS_KEY_SAVED_LEVEL_SERVER_ID, levelIdFromServer);
	} catch (error) {
		console.error('Ошибка сохранения ID уровня:', error);
	}

	console.log(`Загрузка уровня: ${levelIdFromServer}`);
	try {
		levelStartTime = performance.now();
		api.startAttempt(currentLevelServerId)
			.then((data) => console.log('Попытка игры начата на сервере:', data?.attemptId))
			.catch((error) => console.error('Ошибка старта попытки на сервере:', error));

		currentGame = new Game(
			levelLayout,
			CELL_SIZE,
			gameCanvasContainer, 
			(_completedLevelLayout) => handleVictory(levelIdFromServer),
		);
		currentGame.start();

		startButton.disabled = true;
		stopButton.disabled = false;
		resetButton.disabled = false;
        gameControlsContainer.style.display = 'flex'; 
        levelSelectionContainer.style.display = 'none';
		hideVictoryModal();
	} catch (error) {
		console.error('Ошибка при создании или запуске игры:', error);
		gameCanvasContainer.innerHTML = `<p class="error-message">Ошибка загрузки игры. См. консоль.</p>`;
		disableGameControls();
        gameControlsContainer.style.display = 'flex';
        levelSelectionContainer.style.display = 'none';
	}
}

async function register(username: string, password: string) {
	try {
		const data = await api.register(username, password);
		authStore.setCurrentUser(data.user);
	} catch (error) {
		console.error('Ошибка регистрации:', error);
	}
}

async function login(username: string, password: string) {
	try {
		const data = await api.login(username, password);
		authStore.setCurrentUser(data.user);
	} catch (error) {
		console.error('Ошибка входа:', error);
	}
}

async function logout() {
	try {
		await api.logout();
		authStore.setCurrentUser(null);
	} catch (error) {
		console.error('Ошибка выхода:', error);
	}
}

async function checkInitialAuthStatus() {
	try {
        const data = await api.getMe();
        authStore.setCurrentUser(data ? data.user : null);
    } catch (error) {
        console.error('Ошибка проверки сессии:', error);
        authStore.setCurrentUser(null);
    }
}

async function handleVictory(completedLevelServerId: string): Promise<void> {
    console.log(`Победа на уровне: ${completedLevelServerId}!`);
    const completionTimeMs = levelStartTime ? Math.round(performance.now() - levelStartTime) : 0;
    levelStartTime = null;

    if (currentGame) {
        stopButton.disabled = true;
    }

	try {
        await api.completeLevel({
            levelId: completedLevelServerId,
            bestTimeMs: completionTimeMs,
            finalLength: currentGame?.players[0]?.length || 0,
        });
        console.log('Данные о победе отправлены на сервер.');
    } catch (error) {
        console.error('Ошибка отправки данных о победе:', error);
    }
    showVictoryModal(completedLevelServerId);
}

async function fetchAvailableLevels() {
    const user = authStore.getCurrentUser();
    if (!user) {
        availableServerLevels = [];
        updateLevelSelectionUI();
        return;
    }

    console.log('Запрос списка доступных уровней...');
    try {
        const levelsDataFromServer = await api.getLevels();
		availableServerLevels = levelsDataFromServer || [];
		console.log('Доступные уровни:', availableServerLevels);
        updateLevelSelectionUI();
        if (!currentGame) {
            gameCanvasContainer.innerHTML = '<p class="select-level-prompt">Выберите уровень, чтобы начать игру.</p>';
            disableGameControls(); 
            gameControlsContainer.style.display = 'none';
            levelSelectionContainer.style.display = 'flex';
        }

    } catch (error) {
        console.error("Ошибка при загрузке списка уровней:", error);
        availableServerLevels = [];
        updateLevelSelectionUI();
        gameCanvasContainer.innerHTML = '<p class="error-message">Ошибка загрузки уровней. См. консоль.</p>';
        disableGameControls();
    }
}

function disableGameControls() {
    if (startButton) startButton.disabled = true;
    if (stopButton) stopButton.disabled = true;
    if (resetButton) resetButton.disabled = true;
}

function createVictoryModal(): void {
	victoryModalContainer.innerHTML = '';
	victoryModalContainer.className = 'modal victory-modal';
	victoryModalContainer.style.display = 'none';

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

	const selectLevelButton = document.createElement('button');
	selectLevelButton.textContent = 'Выбрать уровень';
	selectLevelButton.className = 'modal-button select-level-button';
	selectLevelButton.addEventListener('click', () => {
        hideVictoryModal();
        if (currentGame) {
            currentGame.destroy();
            currentGame = null;
        }
        gameCanvasContainer.innerHTML = '<p class="select-level-prompt">Выберите уровень, чтобы начать игру.</p>';
        fetchAvailableLevels();
        gameControlsContainer.style.display = 'none';
        disableGameControls();
        currentLevelServerId = null;
    });

	buttonContainer.append(nextLevelButton, selectLevelButton);
	modalContent.append(title, message, buttonContainer);
	victoryModalContainer.append(modalContent);
}

let nextLevelButtonHandler: (() => void) | null = null;

function showVictoryModal(completedLevelId: string): void {
	if (!victoryModalContainer) return;
    const nextLevelButton = victoryModalContainer.querySelector('.next-level-button') as HTMLButtonElement;

    if (nextLevelButtonHandler && nextLevelButton) {
        nextLevelButton.removeEventListener('click', nextLevelButtonHandler);
    }

    nextLevelButtonHandler = async () => {
		hideVictoryModal();
        await fetchAvailableLevels();
        const currentIdx = availableServerLevels.findIndex(l => l.id === completedLevelId);
        let nextPlayableLevel: typeof availableServerLevels[0] | undefined;
        if (currentIdx !== -1) {
            for (let i = currentIdx + 1; i < availableServerLevels.length; i++) {
                if (availableServerLevels[i].layout && !availableServerLevels[i].is_locked) {
                    nextPlayableLevel = availableServerLevels[i];
                    break;
                }
            }
        }

        if (nextPlayableLevel) {
            levelSelectionContainer.style.display = 'none'; 
            gameControlsContainer.style.display = 'flex'; 
            loadLevel(nextPlayableLevel.layout, nextPlayableLevel.id);
        } else {
            console.log("Больше нет доступных уровней или это был последний.");
            gameCanvasContainer.innerHTML = `<p class="all-levels-completed-message">Поздравляем! Все доступные уровни пройдены!</p>`;
            levelSelectionContainer.style.display = 'flex';
            gameControlsContainer.style.display = 'none';
            disableGameControls();
            if (currentGame) { currentGame.destroy(); currentGame = null;}
            currentLevelServerId = null;
        }
	};

    if (nextLevelButton) {
	    nextLevelButton.addEventListener('click', nextLevelButtonHandler);
    }
	victoryModalContainer.style.display = 'flex';
}

function hideVictoryModal(): void {
	if (victoryModalContainer) {
		victoryModalContainer.style.display = 'none';
	}
}

async function initializeApp() {
    try {
        console.log('Загрузка ассетов...');
        await loadAllAssets();
        console.log('Ассеты загружены.');

        createHeaderUI();
        createGameControls();
        createVictoryModal();
        await checkInitialAuthStatus();
    } catch (error) {
        console.error("Ошибка при инициализации приложения или загрузке ассетов:", error);
        document.body.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки приложения. Пожалуйста, обновите страницу или попробуйте позже.</p>`;
    }
}


initializeApp();