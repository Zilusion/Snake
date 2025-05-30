// src/assetLoader.ts

export interface SpriteAsset {
    id: string; // Уникальный идентификатор спрайта
    src: string; // Путь к файлу изображения
    image?: HTMLImageElement; // Загруженное изображение
}

export interface BackgroundAsset {
    id: string;
    src: string;
    image?: HTMLImageElement;
}

const spritesToLoad: SpriteAsset[] = [
    { id: 'block_ground_1', src: '/assets/images/ground1.png' },
    { id: 'block_ground_2', src: '/assets/images/ground2.png' },
    { id: 'block_ground_3', src: '/assets/images/ground3.png' },
    { id: 'block_ground_4', src: '/assets/images/ground4.png' },
    { id: 'block_ground_5', src: '/assets/images/ground5.png' },
];

const backgroundsToLoad: BackgroundAsset[] = [
    { id: 'game_bg_1', src: '/assets/images/background1.png' },
    { id: 'game_bg_2', src: '/assets/images/background2.png' },
    { id: 'game_bg_3', src: '/assets/images/background3.png' },
];

const allAssets: (SpriteAsset | BackgroundAsset)[] = [...spritesToLoad, ...backgroundsToLoad];
const loadedAssets: Record<string, HTMLImageElement> = {};
let assetsLoadedCount = 0;

function assetLoaded() {
    assetsLoadedCount++;
}

export function loadAllAssets(): Promise<Record<string, HTMLImageElement>> {
    return new Promise((resolve, reject) => {
        if (Object.keys(loadedAssets).length === allAssets.length && allAssets.length > 0) {
            resolve(loadedAssets); // Уже загружены
            return;
        }
        if (allAssets.length === 0) {
            resolve({}); // Нет ассетов для загрузки
            return;
        }

        assetsLoadedCount = 0; // Сбрасываем счетчик перед новой загрузкой

        allAssets.forEach(asset => {
            if (loadedAssets[asset.id]) { // Если этот конкретный ассет уже загружен ранее
                assetLoaded();
                if (assetsLoadedCount === allAssets.length) {
                    resolve(loadedAssets);
                }
                return;
            }

            const img = new Image();
            img.src = asset.src;
            img.onload = () => {
                loadedAssets[asset.id] = img;
                asset.image = img; // Сохраняем в оригинальном объекте для удобства (опционально)
                assetLoaded();
                console.log(`Asset loaded: ${asset.src}`);
                if (assetsLoadedCount === allAssets.length) {
                    resolve(loadedAssets);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load asset: ${asset.src}`);
                // Можно либо реджектить промис, либо продолжать без этого ассета
                assetLoaded(); // Считаем его "обработанным", чтобы промис завершился
                if (assetsLoadedCount === allAssets.length) {
                    // Если это была последняя ошибка, и мы решили не реджектить, то резолвим с тем, что есть
                    resolve(loadedAssets);
                }
                // reject(new Error(`Failed to load asset: ${asset.src}`)); // Вариант с реджектом
            };
        });
    });
}

export function getAsset(id: string): HTMLImageElement | undefined {
    return loadedAssets[id];
}

// Экспортируем также сами списки для использования в других модулях, если нужно
export { spritesToLoad, backgroundsToLoad };