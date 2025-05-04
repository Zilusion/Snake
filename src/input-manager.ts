export class InputManager {
	private activeKeys: Set<string> = new Set();
	private pressedKeysBuffer: Set<string> = new Set();

	private readonly handleKeyDownBound = this.handleKeyDown.bind(this);
	private readonly handleKeyUpBound = this.handleKeyUp.bind(this);
	private readonly clearActiveKeysBound = this.clearActiveKeys.bind(this);

	public constructor() {
		globalThis.addEventListener('keydown', this.handleKeyDown.bind(this));
		globalThis.addEventListener('keyup', this.handleKeyUp.bind(this));
		globalThis.addEventListener('blur', this.clearActiveKeys.bind(this));
	}

	public destroy(): void {
		globalThis.removeEventListener('keydown', this.handleKeyDownBound);
		globalThis.removeEventListener('keyup', this.handleKeyUpBound);
		globalThis.removeEventListener('blur', this.clearActiveKeysBound);
		console.log('InputManager обработчики удалены');
	}

	public getActiveKeys(): ReadonlySet<string> {
		return this.activeKeys;
	}

	public processBufferedKeys(): ReadonlySet<string> {
		const pressedKeys = new Set(this.pressedKeysBuffer);
		this.pressedKeysBuffer.clear();
		return pressedKeys;
	}

	private handleKeyDown(event: KeyboardEvent): void {
		if (!event.repeat) {
			this.pressedKeysBuffer.add(event.key);
			this.activeKeys.add(event.key);
		}
		if (
			[
				'w',
				'a',
				's',
				'd',
				'ArrowUp',
				'ArrowDown',
				'ArrowLeft',
				'ArrowRight',
			].includes(event.key)
		) {
			event.preventDefault();
		}
	}

	private handleKeyUp(event: KeyboardEvent): void {
		this.activeKeys.delete(event.key);
	}

	private clearActiveKeys(): void {
		this.activeKeys.clear();
		this.pressedKeysBuffer.clear();
	}
}
