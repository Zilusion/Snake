export interface SpriteAsset {
    id: string; 
    src: string; 
    image?: HTMLImageElement;
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
    return new Promise((resolve) => {
        if (Object.keys(loadedAssets).length === allAssets.length && allAssets.length > 0) {
            resolve(loadedAssets); 
            return;
        }
        if (allAssets.length === 0) {
            resolve({});
            return;
        }

        assetsLoadedCount = 0; 

        allAssets.forEach(asset => {
            if (loadedAssets[asset.id]) {
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
                asset.image = img;
                assetLoaded();
                console.log(`Asset loaded: ${asset.src}`);
                if (assetsLoadedCount === allAssets.length) {
                    resolve(loadedAssets);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load asset: ${asset.src}`);
                assetLoaded();
                if (assetsLoadedCount === allAssets.length) {
                    resolve(loadedAssets);
                }
            };
        });
    });
}

export function getAsset(id: string): HTMLImageElement | undefined {
    return loadedAssets[id];
}

export { spritesToLoad, backgroundsToLoad };