// import './styles/main.scss';
// import { Game } from './game';
// import type { LevelData } from './types';
// import * as api from './apiService';
// import * as authStore from './authStore';

// const CELL_SIZE = 40;
// const LS_KEY_SAVED_LEVEL_SERVER_ID = 'snakeGameSavedLevelServerId';

// let currentGame: Game | null = null;
// let availableServerLevels: {
// 	id: string;
// 	name: string;
// 	is_completed: boolean;
// 	layout: LevelData;
// 	is_locked: boolean;
// }[] = [];
// let currentLevelServerId: string | null = null;
// let levelStartTime: number | null = null;

// authStore.subscribe((user) => {
//     updateAuthHeaderUI(user); // Передаем пользователя в функцию обновления UI
//     if (user) {
//         // Если пользователь залогинился (или уже был залогинен при старте)
//         showPage('game');
//         fetchAvailableLevelsAndLoadInitial(); // Загружаем уровни и пытаемся загрузить первый/сохраненный
//     } else {
//         // Если пользователь разлогинился или не был залогинен
//         updateLevelSelectionUI(); // Очищаем список уровней
//         if (currentGame) {
//             currentGame.destroy();
//             currentGame = null;
//             gameCanvasContainer.innerHTML = '';
//         }
//         disableGameControls(); // Деактивируем кнопки Старт/Стоп/Ресет
//         showPage('auth');
//         createAuthForms(); // Убедимся, что формы входа/регистрации отображены
//     }
// });


// const appContainer = document.getElementById('app-container')!;
// const appHeader = document.getElementById('app-header')!;
// const authPage = document.getElementById('auth-page') as HTMLElement;
// const gamePage = document.getElementById('game-page') as HTMLElement;
// const levelSelectionContainer = document.getElementById('level-selection-container') as HTMLElement;
// const gameCanvasContainer = document.getElementById('game-canvas-container') as HTMLElement;
// const gameControlsContainer = document.getElementById('game-controls-container') as HTMLElement;
// const victoryModalContainer = document.getElementById('victory-modal-container') as HTMLElement;

// let logoutButton: HTMLButtonElement;
// let currentUserSpan: HTMLSpanElement;
// // Кнопки Старт/Стоп/Перезапуск игры будут создаваться и добавляться в gameControlsContainer
// let startButton: HTMLButtonElement;
// let stopButton: HTMLButtonElement;
// let resetButton: HTMLButtonElement;


// function showPage(pageId: 'auth' | 'game') {
//     authPage.style.display = 'none';
//     gamePage.style.display = 'none';

//     if (pageId === 'auth') {
//         authPage.style.display = 'block'; // или 'flex' если нужно
//     } else if (pageId === 'game') {
//         gamePage.style.display = 'flex'; // или 'flex'
//     }
// }


// function createHeaderUI() {
//     appHeader.innerHTML = ''; // Очищаем, если обновляем

//     currentUserSpan = document.createElement('span');
//     currentUserSpan.id = 'currentUserSpan';
//     currentUserSpan.classList.add('current-user-display');

//     logoutButton = document.createElement('button');
//     logoutButton.textContent = 'Выход';
//     logoutButton.classList.add('button', 'button-logout'); // Добавляем классы для стилизации
//     logoutButton.addEventListener('click', logout);
//     logoutButton.style.display = 'none'; // Сначала скрыт

//     const title = document.createElement('h1');
//     title.textContent = 'Snake Puzzle Game';
//     title.classList.add('app-title');

//     appHeader.append(title, currentUserSpan, logoutButton);
// }

// function createAuthForms() {
//     authPage.innerHTML = ''; // Очищаем для пересоздания
//     const formContainer = document.createElement('div');
//     formContainer.classList.add('auth-form-container');

//     const title = document.createElement('h2');
//     title.textContent = 'Вход или Регистрация';

//     const usernameLabel = document.createElement('label');
//     usernameLabel.htmlFor = 'username';
//     usernameLabel.textContent = 'Имя пользователя:';
//     const usernameInput = document.createElement('input');
//     usernameInput.type = 'text';
//     usernameInput.id = 'username';
//     usernameInput.placeholder = 'Логин';
//     usernameInput.required = true;

//     const passwordLabel = document.createElement('label');
//     passwordLabel.htmlFor = 'password';
//     passwordLabel.textContent = 'Пароль:';
//     const passwordInput = document.createElement('input');
//     passwordInput.type = 'password';
//     passwordInput.id = 'password';
//     passwordInput.placeholder = 'Пароль';
//     passwordInput.required = true;

//     const buttonGroup = document.createElement('div');
//     buttonGroup.classList.add('auth-buttons');

//     const registerButton = document.createElement('button');
//     registerButton.textContent = 'Регистрация';
//     registerButton.classList.add('button');
//     registerButton.addEventListener('click', () => {
//         if (usernameInput.value && passwordInput.value) {
//             register(usernameInput.value, passwordInput.value);
//         } else {
//             alert('Пожалуйста, введите имя пользователя и пароль.');
//         }
//     });

//     const loginButton = document.createElement('button');
//     loginButton.textContent = 'Вход';
//     loginButton.classList.add('button');
//     loginButton.addEventListener('click', () => {
//          if (usernameInput.value && passwordInput.value) {
//             login(usernameInput.value, passwordInput.value);
//         } else {
//             alert('Пожалуйста, введите имя пользователя и пароль.');
//         }
//     });

//     buttonGroup.append(loginButton, registerButton);
//     formContainer.append(title, usernameLabel, usernameInput, passwordLabel, passwordInput, buttonGroup);
//     authPage.append(formContainer);
// }

// function updateAuthHeaderUI(user: { id: number; username: string } | null = null) {
//     if (user) {
//         currentUserSpan.textContent = `Игрок: ${user.username}`;
//         logoutButton.style.display = 'inline-block';
//         showPage('game'); // Переход на страницу игры
//     } else {
//         currentUserSpan.textContent = '';
//         logoutButton.style.display = 'none';
//         showPage('auth'); // Показать страницу аутентификации
//         createAuthForms(); // Пересоздаем формы для чистого состояния
//     }
// }

// function updateLevelSelectionUI() {
//     levelSelectionContainer.innerHTML = '';
//     const user = authStore.getCurrentUser();

//     if (!user) {
//         levelSelectionContainer.innerHTML = '<p>Для доступа к уровням необходимо войти в систему.</p>';
//         disableGameControls();
//         return;
//     }

//     if (!availableServerLevels || availableServerLevels.length === 0) {
//          levelSelectionContainer.innerHTML = '<p>Нет доступных уровней.</p>';
//          disableGameControls();
//          return;
//     }

//     const listTitle = document.createElement('h3');
//     listTitle.textContent = "Выберите уровень:";
//     levelSelectionContainer.append(listTitle);

//     const levelList = document.createElement('div');
//     levelList.classList.add('level-list');

//     availableServerLevels.forEach((serverLevel) => {
//         const levelButton = document.createElement('button');
//         levelButton.classList.add('button', 'level-button');
//         if (serverLevel.is_completed) {
//             levelButton.classList.add('completed');
//         }
//         // is_locked должно приходить с сервера и быть главным.
//         // Если is_locked, то кнопка disabled.
//         if (serverLevel.is_locked) {
//             levelButton.classList.add('locked');
//             levelButton.disabled = true;
//         }

//         levelButton.textContent = `${serverLevel.name}${serverLevel.is_completed ? ' ✔️' : ''}${serverLevel.is_locked ? ' 🔒' : ''}`;

//         // Кликать можно только на незаблокированные уровни, у которых есть layout
//         if (!serverLevel.is_locked && serverLevel.layout) {
//             levelButton.addEventListener('click', () => {
//                 loadLevel(serverLevel.layout, serverLevel.id);
//             });
//         } else {
//             levelButton.disabled = true; // Убедимся, что она disabled, если нет layout или заблокирована
//         }
//         levelList.append(levelButton);
//     });
//     levelSelectionContainer.append(levelList);
// }

// function createGameControls() {
//     gameControlsContainer.innerHTML = ''; // Очищаем

//     startButton = document.createElement('button');
//     startButton.textContent = 'Старт / Продолжить';
//     startButton.classList.add('button');
//     startButton.disabled = true;
//     startButton.addEventListener('click', () => {if (currentGame && !currentGame.isActive) {
// 		currentGame.start();
// 		startButton.disabled = true;
// 		stopButton.disabled = false;
// 		hideVictoryModal();
// 	} });

//     stopButton = document.createElement('button');
//     stopButton.textContent = 'Стоп / Пауза';
//     stopButton.classList.add('button');
//     stopButton.disabled = true;
//     stopButton.addEventListener('click', () => { if (currentGame && currentGame.isActive) {
// 		currentGame.stop();
// 		startButton.disabled = false;
// 		stopButton.disabled = true;
// 	}});

//     resetButton = document.createElement('button');
//     resetButton.textContent = 'Перезапуск Уровня';
//     resetButton.classList.add('button');
//     resetButton.disabled = true;
//     resetButton.addEventListener('click', () => { if (currentGame && currentLevelServerId) {
//         const levelToReload = availableServerLevels.find(l => l.id === currentLevelServerId);
//         if (levelToReload && levelToReload.layout) {
// 		    loadLevel(levelToReload.layout, levelToReload.id);
//         } else {
//             console.error("Не удалось перезапустить: данные текущего уровня не найдены");
//         }
// 	} });

//     gameControlsContainer.append(startButton, stopButton, resetButton);
// }

// async function fetchAvailableLevelsAndLoadInitial() {
//     try {
//         const levelsDataFromServer = await api.getLevels();
//         availableServerLevels = levelsDataFromServer || [];
//         updateLevelSelectionUI(); // Обновляем кнопки выбора

//         if (availableServerLevels.length > 0) {
//             let levelToLoad: typeof availableServerLevels[0] | undefined;
//             const savedLevelId = localStorage.getItem(LS_KEY_SAVED_LEVEL_SERVER_ID);

//             if (savedLevelId) {
//                 levelToLoad = availableServerLevels.find(l => l.id === savedLevelId && !l.is_locked && l.layout);
//             }

//             if (!levelToLoad) { // Если сохраненный не найден или заблокирован
//                 // Ищем первый незаблокированный И не пройденный, или просто первый незаблокированный
//                 levelToLoad = availableServerLevels.find(l => !l.is_locked && !l.is_completed && l.layout) ||
//                               availableServerLevels.find(l => !l.is_locked && l.layout);
//             }

//             if (levelToLoad && levelToLoad.layout) {
//                 loadLevel(levelToLoad.layout, levelToLoad.id);
//             } else if (authStore.getCurrentUser()) { // Залогинен, но все доступные уровни пройдены/заблокированы
//                  gameCanvasContainer.innerHTML = `<p style="text-align: center;">Все доступные уровни пройдены или нет доступных для игры!</p>`;
//                  disableGameControls();
//             } else {
//                  console.error('Нет доступных уровней для загрузки!');
//                  gameCanvasContainer.innerHTML = '<p style="color: red; text-align: center;">Нет доступных уровней!</p>';
//                  disableGameControls();
//             }
//         } else {
//             gameCanvasContainer.innerHTML = '<p style="text-align: center;">Уровни не найдены на сервере.</p>';
//             disableGameControls();
//         }
//     } catch (error) {
//         console.error("Ошибка при загрузке списка уровней:", error);
//         gameCanvasContainer.innerHTML = '<p style="color: red; text-align: center;">Ошибка загрузки уровней. См. консоль.</p>';
//         disableGameControls();
//         // Если ошибка 401 при загрузке уровней (если /api/levels защищен), то authStore сам должен был обработать
//     }
// }

// function loadLevel(levelLayout: LevelData, levelIdFromServer: string): void {
// 	if (currentGame) {
// 		currentGame.destroy();
// 		currentGame = null;
// 	}
// 	gameCanvasContainer.innerHTML = ''; // Очищаем контейнер игры
// 	currentLevelServerId = levelIdFromServer;
// 	try {
// 		localStorage.setItem(LS_KEY_SAVED_LEVEL_SERVER_ID, levelIdFromServer);
// 	} catch (error) {
// 		console.error('Ошибка сохранения ID уровня:', error);
// 	}

// 	console.log(`Загрузка уровня: ${levelIdFromServer}`);
// 	try {
// 		levelStartTime = performance.now(); // Начинаем замер времени
// 		api.startAttempt(currentLevelServerId)
// 			.then((data) =>
// 				console.log('Попытка игры начата на сервере:', data),
// 			)
// 			.catch((error) =>
// 				console.error('Ошибка старта попытки на сервере:', error),
// 			);

// 		currentGame = new Game(
// 			levelLayout, // Передаем только layout
// 			CELL_SIZE,
// 			gameCanvasContainer,
// 			(completedLevelLayout) =>
// 				handleVictory(completedLevelLayout, levelIdFromServer), // Передаем и ID
// 		);
// 		currentGame.start();
// 		startButton.disabled = true;
// 		stopButton.disabled = false;
// 		resetButton.disabled = false;
// 		hideVictoryModal();
// 	} catch (error) {
// 		console.error('Ошибка при создании или запуске игры:', error);
// 		gameCanvasContainer.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки игры. См. консоль.</p>`;
// 		startButton.disabled = true;
// 		stopButton.disabled = true;
// 		resetButton.disabled = true;
// 	}
// }



// // --- Функции аутентификации ---
// async function register(username: string, password: string) {
// 	try {
// 		const data = await api.register(username, password);
// 		authStore.setCurrentUser(data.user);
// 	} catch (error) {
// 		console.error('Ошибка регистрации:', error);
// 	}
// }

// async function login(username: string, password: string) {
// 	try {
// 		const data = await api.login(username, password);
// 		authStore.setCurrentUser(data.user);
// 	} catch (error) {
// 		console.error('Ошибка входа:', error);
// 	}
// }

// async function logout() {
// 	try {
// 		await api.logout();
// 		authStore.setCurrentUser(null);
// 	} catch (error) {
// 		console.error('Ошибка выхода:', error);
// 	}
// }

// async function checkInitialAuthStatus() {
// 	try {
//         const data = await api.getMe(); // api.getMe вернет null при 401 без выбрасывания ошибки
//         authStore.setCurrentUser(data ? data.user : null);
//     } catch (error) { // Сюда попадут только другие сетевые/серверные ошибки от apiRequest
//         console.error('Критическая ошибка при проверке сессии:', error);
//         authStore.setCurrentUser(null); // В случае любой другой ошибки тоже разлогиниваем
//     }
// }


// async function handleVictory(_completedLevelLayout: LevelData, completedLevelServerId: string): Promise<void> {
//     console.log(`Победа на уровне: ${completedLevelServerId}!`);
//     const completionTimeMs = levelStartTime ? Math.round(performance.now() - levelStartTime) : 0;
//     levelStartTime = null;

//     if (currentGame) {
//         startButton.disabled = false;
//         stopButton.disabled = true;
//     }

// 	try {
//         await api.completeLevel({
//             levelId: completedLevelServerId,
//             bestTimeMs: completionTimeMs,
//             finalLength: currentGame?.players[0]?.length || 0, // Пример
//         });
//         console.log('Данные о победе отправлены на сервер.');
//         await fetchAvailableLevels(); // Обновляем список уровней (мог открыться следующий)
//     } catch (error) {
//         console.error('Ошибка отправки данных о победе:', error);
//     }
//     showVictoryModal();
// }

// async function fetchAvailableLevels() {
//     console.log('Запрос списка доступных уровней...');
//     try {
//         const levelsDataFromServer = await api.getLevels();
// 		availableServerLevels = levelsDataFromServer || [];
// 		console.log('Доступные уровни:', availableServerLevels);
//         updateLevelSelectionUI();

//         if (availableServerLevels.length > 0) {
//             let levelToLoad: { id: string; name: string; is_completed: boolean; layout: LevelData } | undefined;
//             const savedLevelId = localStorage.getItem(LS_KEY_SAVED_LEVEL_SERVER_ID);

//             if (savedLevelId) {
//                 levelToLoad = availableServerLevels.find(l => l.id === savedLevelId && l.layout);
//             }
//             if (!levelToLoad) { // Если сохраненный не найден или не доступен
//                 levelToLoad = availableServerLevels.find(l => l.layout); // Первый доступный
//             }

//             if (levelToLoad && levelToLoad.layout) {
//                 loadLevel(levelToLoad.layout, levelToLoad.id);
//             } else if (authStore.getCurrentUser() && availableServerLevels.length > 0) {
//                  gameCanvasContainer.innerHTML = `<p style="text-align: center;">Все доступные уровни пройдены! Поздравляем!</p>`;
//                  disableGameControls();
//             } else if (!authStore.getCurrentUser() && availableServerLevels.length > 0 && availableServerLevels[0].layout) {
//                  // Для анонима загружаем первый, если он есть
//                  loadLevel(availableServerLevels[0].layout, availableServerLevels[0].id);
//             } else {
//                  console.error('Нет доступных уровней для загрузки!');
//                  gameCanvasContainer.innerHTML = '<p style="color: red; text-align: center;">Нет доступных уровней!</p>';
//                  disableGameControls();
//             }
//         } else {
//             gameCanvasContainer.innerHTML = '<p style="color: red; text-align: center;">Не удалось загрузить уровни с сервера.</p>';
//             disableGameControls();
//         }
//     } catch (error) {
//         gameCanvasContainer.innerHTML = '<p style="color: red; text-align: center;">Ошибка загрузки уровней. См. консоль.</p>';
//         disableGameControls();
//     }
// }

// function disableGameControls() {
//     startButton.disabled = true;
//     stopButton.disabled = true;
//     resetButton.disabled = true;
// }

// function createVictoryModal(): void {
// 	victoryModalContainer.className = 'modal victory-modal';
// 	victoryModalContainer.style.display = 'none';

// 	const modalContent = document.createElement('div');
// 	modalContent.className = 'modal-content';

// 	const title = document.createElement('h2');
// 	title.textContent = 'Победа!';
// 	title.className = 'modal-title';

// 	const message = document.createElement('p');
// 	message.textContent = 'Все яблоки съедены!';
// 	message.className = 'modal-message';

// 	const buttonContainer = document.createElement('div');
// 	buttonContainer.className = 'modal-buttons';

// 	const nextLevelButton = document.createElement('button');
// 	nextLevelButton.textContent = 'Следующий уровень';
// 	nextLevelButton.className = 'modal-button next-level-button';
// 	nextLevelButton.addEventListener('click', async () => {
// 		hideVictoryModal();
//             await fetchAvailableLevels(); // Перезагружаем уровни, чтобы найти следующий доступный
//             // Логика поиска *действительно* следующего доступного уровня после победы
//             const currentLevelIndexInAvailable = availableServerLevels.findIndex(l => l.id === currentLevelServerId);
//             if (currentLevelIndexInAvailable !== -1) {
//                 for (let i = currentLevelIndexInAvailable + 1; i < availableServerLevels.length; i++) {
//                     if (availableServerLevels[i].layout) { // Нашли следующий доступный
//                         loadLevel(availableServerLevels[i].layout, availableServerLevels[i].id);
//                         return;
//                     }
//                 }
//                 // Если дошли до конца и не нашли, возможно, все пройдено или это был последний
//                 console.log("Все доступные уровни после этого пройдены или это был последний.");
//                 // Можно показать сообщение "Все уровни пройдены" или вернуться к выбору
//                  gameCanvasContainer.innerHTML = `<p style="text-align: center;">Поздравляем! Возможно, это был последний доступный уровень.</p>`;
//                  disableGameControls();
//             }
// 	});

// 	const selectLevelButton = document.createElement('button');
// 	selectLevelButton.textContent = 'Выбрать уровень';
// 	selectLevelButton.className = 'modal-button select-level-button';
// 	selectLevelButton.addEventListener('click', hideVictoryModal);

// 	buttonContainer.append(nextLevelButton, selectLevelButton);
// 	modalContent.append(title, message, buttonContainer);
// 	victoryModalContainer.append(modalContent);
// 	document.body.append(victoryModalContainer);
// }

// function showVictoryModal(): void {
// 	if (!victoryModalContainer) return;

// 	victoryModalContainer.style.display = 'flex';
// }

// function hideVictoryModal(): void {
// 	if (victoryModalContainer) {
// 		victoryModalContainer.style.display = 'none';
// 	}
// }

// async function initializeApp() {
//     createHeaderUI();
//     createGameControls();
//     createVictoryModal();
//     await checkInitialAuthStatus();
// }

// initializeApp();
// main.ts
import './styles/main.scss';
import { Game } from './game';
import type { LevelData } from './types';
import * as api from './apiService';
import * as authStore from './authStore';

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
        showPage('game'); // Показываем "игровую страницу"
        fetchAvailableLevels(); // Просто загружаем и отображаем список уровней
        // НЕ загружаем уровень автоматически здесь
    } else {
        updateLevelSelectionUI(); // Очистит список, покажет сообщение о необходимости входа
        if (currentGame) {
            currentGame.destroy();
            currentGame = null;
        }
        gameCanvasContainer.innerHTML = ''; // Очищаем канвас контейнер
        disableGameControls();
        showPage('auth');
        createAuthForms();
    }
});


const appContainer = document.getElementById('app-container')!;
const appHeader = document.getElementById('app-header')!;
const authPage = document.getElementById('auth-page') as HTMLElement;
const gamePage = document.getElementById('game-page') as HTMLElement;
const levelSelectionContainer = document.getElementById('level-selection-container') as HTMLElement;
const gameCanvasContainer = document.getElementById('game-canvas-container') as HTMLElement;
const gameControlsContainer = document.getElementById('game-controls-container') as HTMLElement;
const victoryModalContainer = document.getElementById('victory-modal-container') as HTMLElement;

let logoutButton: HTMLButtonElement;
let currentUserSpan: HTMLSpanElement;
let startButton: HTMLButtonElement;
let stopButton: HTMLButtonElement;
let resetButton: HTMLButtonElement;


function showPage(pageId: 'auth' | 'game') {
    authPage.style.display = 'none';
    gamePage.style.display = 'none';

    if (pageId === 'auth') {
        authPage.style.display = 'block';
    } else if (pageId === 'game') {
        gamePage.style.display = 'flex'; // Используем flex для gamePage, чтобы элементы располагались
    }
}


function createHeaderUI() {
    appHeader.innerHTML = '';
    currentUserSpan = document.createElement('span');
    currentUserSpan.id = 'currentUserSpan';
    currentUserSpan.classList.add('current-user-display');

    logoutButton = document.createElement('button');
    logoutButton.textContent = 'Выход';
    logoutButton.classList.add('button', 'button-logout');
    logoutButton.addEventListener('click', logout); // Используем logout из main.ts
    logoutButton.style.display = 'none';

    const title = document.createElement('h1');
    title.textContent = 'Snake Puzzle Game';
    title.classList.add('app-title');

    appHeader.append(title, currentUserSpan, logoutButton);
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

    const registerButtonElement = document.createElement('button'); // Переименовал, чтобы не конфликтовать с функцией
    registerButtonElement.textContent = 'Регистрация';
    registerButtonElement.classList.add('button');
    registerButtonElement.addEventListener('click', () => {
        if (usernameInput.value && passwordInput.value) {
            register(usernameInput.value, passwordInput.value); // Используем register из main.ts
        } else {
            alert('Пожалуйста, введите имя пользователя и пароль.');
        }
    });

    const loginButtonElement = document.createElement('button'); // Переименовал
    loginButtonElement.textContent = 'Вход';
    loginButtonElement.classList.add('button');
    loginButtonElement.addEventListener('click', () => {
         if (usernameInput.value && passwordInput.value) {
            login(usernameInput.value, passwordInput.value); // Используем login из main.ts
        } else {
            alert('Пожалуйста, введите имя пользователя и пароль.');
        }
    });

    buttonGroup.append(loginButtonElement, registerButtonElement);
    formContainer.append(title, usernameLabel, usernameInput, passwordLabel, passwordInput, buttonGroup);
    authPage.append(formContainer);
}

function updateAuthHeaderUI(user: { id: number; username: string } | null = null) {
    // Эта функция теперь в основном меняет только шапку
    // Логика смены страниц (showPage) и загрузки данных (fetchAvailableLevels)
    // перенесена в authStore.subscribe
    if (user) {
        currentUserSpan.textContent = `Игрок: ${user.username}`;
        logoutButton.style.display = 'inline-block';
    } else {
        currentUserSpan.textContent = '';
        logoutButton.style.display = 'none';
    }
}

function updateLevelSelectionUI() {
    levelSelectionContainer.innerHTML = ''; // Очищаем
    const user = authStore.getCurrentUser();

    if (!user) {
        // Это состояние обрабатывается в authStore.subscribe -> showPage('auth')
        // Здесь можно дополнительно очистить, если нужно
        levelSelectionContainer.innerHTML = '<p class="auth-required-message">Для доступа к уровням необходимо войти в систему.</p>';
        gameCanvasContainer.innerHTML = ''; // Очищаем и контейнер игры
        disableGameControls();
        return;
    }

    if (!availableServerLevels || availableServerLevels.length === 0) {
         levelSelectionContainer.innerHTML = '<p class="no-levels-message">Нет доступных уровней или ошибка загрузки.</p>';
         gameCanvasContainer.innerHTML = ''; // Очищаем и контейнер игры
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
                // При клике на уровень, скрываем список уровней и кнопки управления игрой
                // (если они были видимы от предыдущей игры, хотя loadLevel это и так сделает)
                levelSelectionContainer.style.display = 'none';
                gameControlsContainer.style.display = 'flex'; // Показываем кнопки игры
                loadLevel(serverLevel.layout, serverLevel.id);
            });
        }
        levelList.append(levelButton);
    });
    levelSelectionContainer.append(levelList);
    levelSelectionContainer.style.display = 'flex'; // Показываем список уровней
    gameCanvasContainer.innerHTML = '<p class="select-level-prompt">Выберите уровень, чтобы начать игру.</p>'; // Заглушка для канваса
    disableGameControls(); // Кнопки игры по умолчанию выключены, пока уровень не запущен
}

function createGameControls() {
    gameControlsContainer.innerHTML = '';
    gameControlsContainer.style.display = 'none'; // Изначально скрыты

    startButton = document.createElement('button');
    startButton.textContent = 'Старт'; // Текст может меняться
    startButton.classList.add('button', 'game-control-button');
    startButton.disabled = true;
    startButton.addEventListener('click', () => {
        if (currentGame && !currentGame.isActive) {
            currentGame.start();
            startButton.textContent = 'Старт'; // Если была пауза
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
        if (currentLevelServerId) { // Перезапускаем текущий выбранный уровень
            const levelToReload = availableServerLevels.find(l => l.id === currentLevelServerId);
            if (levelToReload && levelToReload.layout) {
                hideVictoryModal(); // Если была открыта модалка
                levelSelectionContainer.style.display = 'none'; // Скрываем выбор уровней
                gameControlsContainer.style.display = 'flex';  // Показываем кнопки игры
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
        disableGameControls(); // Сбрасываем состояние кнопок
        currentLevelServerId = null; // Сбрасываем текущий уровень
        localStorage.removeItem(LS_KEY_SAVED_LEVEL_SERVER_ID); // Очищаем сохраненный уровень
    });

    gameControlsContainer.append(startButton, stopButton, resetButton, backToLevelsButton);
}

// УДАЛЯЕМ fetchAvailableLevelsAndLoadInitial, т.к. автозагрузка уровня не нужна

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
		api.startAttempt(currentLevelServerId) // Нет нужды ждать этот промис для старта игры
			.then((data) => console.log('Попытка игры начата на сервере:', data?.attemptId))
			.catch((error) => console.error('Ошибка старта попытки на сервере:', error));

		currentGame = new Game(
			levelLayout,
			CELL_SIZE,
			gameCanvasContainer, // Передаем контейнер для canvas
			(_completedLevelLayout) => handleVictory(levelIdFromServer), // Передаем только ID
		);
		currentGame.start();

        // Обновляем состояние кнопок управления игрой
		startButton.disabled = true;
		stopButton.disabled = false;
		resetButton.disabled = false;
        gameControlsContainer.style.display = 'flex'; // Убедимся, что кнопки видны
        levelSelectionContainer.style.display = 'none'; // Скрываем список уровней
		hideVictoryModal();
	} catch (error) {
		console.error('Ошибка при создании или запуске игры:', error);
		gameCanvasContainer.innerHTML = `<p class="error-message">Ошибка загрузки игры. См. консоль.</p>`;
		disableGameControls();
        gameControlsContainer.style.display = 'flex'; // Кнопки должны быть видны, чтобы можно было вернуться
        levelSelectionContainer.style.display = 'none';
	}
}

// --- Функции аутентификации (остаются те же, что вы предоставили) ---
async function register(username: string, password: string) {
	try {
		const data = await api.register(username, password);
		authStore.setCurrentUser(data.user); // Это вызовет subscribe и нужные обновления UI
	} catch (error) {
		console.error('Ошибка регистрации:', error);
        // Alert уже в apiRequest
	}
}

async function login(username: string, password: string) {
	try {
		const data = await api.login(username, password);
		authStore.setCurrentUser(data.user); // Это вызовет subscribe
	} catch (error) {
		console.error('Ошибка входа:', error);
	}
}

async function logout() {
	try {
		await api.logout();
		authStore.setCurrentUser(null); // Это вызовет subscribe
	} catch (error) {
		console.error('Ошибка выхода:', error);
	}
}

async function checkInitialAuthStatus() { // Переименованная функция
	try {
        const data = await api.getMe();
        authStore.setCurrentUser(data ? data.user : null); // Это вызовет subscribe
    } catch (error) {
        console.error('Ошибка проверки сессии:', error);
        authStore.setCurrentUser(null); // Это вызовет subscribe
    }
}

async function handleVictory(completedLevelServerId: string): Promise<void> {
    console.log(`Победа на уровне: ${completedLevelServerId}!`);
    const completionTimeMs = levelStartTime ? Math.round(performance.now() - levelStartTime) : 0;
    levelStartTime = null;

    // Деактивируем игровые кнопки, но не кнопку "Продолжить" или "К выбору уровней"
    if (currentGame) {
        // startButton.disabled = false; // Будет управляться модалкой
        stopButton.disabled = true;
        // resetButton.disabled = false; // Можно оставить активной
    }

	try {
        await api.completeLevel({
            levelId: completedLevelServerId,
            bestTimeMs: completionTimeMs,
            finalLength: currentGame?.players[0]?.length || 0,
        });
        console.log('Данные о победе отправлены на сервер.');
        // Не загружаем уровни здесь, модалка предложит "след. уровень" или "выбрать"
        // await fetchAvailableLevels();
    } catch (error) {
        console.error('Ошибка отправки данных о победе:', error);
    }
    showVictoryModal(completedLevelServerId); // Передаем ID для кнопки "след. уровень"
}

async function fetchAvailableLevels() { // Эта функция теперь только загружает и обновляет UI списка
    const user = authStore.getCurrentUser();
    if (!user) {
        availableServerLevels = []; // Очищаем для неавторизованного
        updateLevelSelectionUI();
        return;
    }

    console.log('Запрос списка доступных уровней...');
    try {
        const levelsDataFromServer = await api.getLevels();
		availableServerLevels = levelsDataFromServer || [];
		console.log('Доступные уровни:', availableServerLevels);
        updateLevelSelectionUI();
        // Автоматическую загрузку уровня убрали отсюда
        // Если активной игры нет, gameCanvasContainer покажет заглушку "Выберите уровень"
        if (!currentGame) {
            gameCanvasContainer.innerHTML = '<p class="select-level-prompt">Выберите уровень, чтобы начать игру.</p>';
            disableGameControls(); // Убедимся, что игровые кнопки выключены
            gameControlsContainer.style.display = 'none'; // Скрываем кнопки управления игрой, если нет игры
            levelSelectionContainer.style.display = 'flex'; // Показываем список уровней
        }

    } catch (error) {
        console.error("Ошибка при загрузке списка уровней:", error);
        availableServerLevels = [];
        updateLevelSelectionUI(); // Покажет сообщение об ошибке
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
	victoryModalContainer.innerHTML = ''; // Очищаем для пересоздания
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
	// Обработчик будет добавлен в showVictoryModal, т.к. зависит от completedLevelServerId

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
        fetchAvailableLevels(); // Обновить список и показать его
        gameControlsContainer.style.display = 'none'; // Скрыть кнопки игры
        disableGameControls();
        currentLevelServerId = null;
    });

	buttonContainer.append(nextLevelButton, selectLevelButton);
	modalContent.append(title, message, buttonContainer);
	victoryModalContainer.append(modalContent);
	// document.body.append(victoryModalContainer); // Уже в HTML
}

let nextLevelButtonHandler: (() => void) | null = null; // Для удаления старого обработчика

function showVictoryModal(completedLevelId: string): void {
	if (!victoryModalContainer) return;
    const nextLevelButton = victoryModalContainer.querySelector('.next-level-button') as HTMLButtonElement;

    // Удаляем предыдущий обработчик, если он был
    if (nextLevelButtonHandler && nextLevelButton) {
        nextLevelButton.removeEventListener('click', nextLevelButtonHandler);
    }

    nextLevelButtonHandler = async () => {
		hideVictoryModal();
        await fetchAvailableLevels(); // Обновляем список, т.к. могли открыться новые уровни
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
            levelSelectionContainer.style.display = 'none'; // Скрываем выбор уровней
            gameControlsContainer.style.display = 'flex';  // Показываем кнопки игры
            loadLevel(nextPlayableLevel.layout, nextPlayableLevel.id);
        } else {
            console.log("Больше нет доступных уровней или это был последний.");
            gameCanvasContainer.innerHTML = `<p class="all-levels-completed-message">Поздравляем! Все доступные уровни пройдены!</p>`;
            levelSelectionContainer.style.display = 'flex'; // Показываем список (где будет видно, что все пройдено)
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
    createHeaderUI();
    createGameControls();
    createVictoryModal();
    await checkInitialAuthStatus(); // Это вызовет subscribe и дальнейшую логику
                                   // (показ authPage или gamePage со списком уровней)
}

initializeApp();