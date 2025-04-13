export class InputManager {
	private activeKeys: Set<string> = new Set();
	// Buffer for keys pressed at least once since the last check
	private pressedKeysBuffer: Set<string> = new Set();

	public constructor() {
		globalThis.addEventListener('keydown', this.handleKeyDown.bind(this));
		globalThis.addEventListener('keyup', this.handleKeyUp.bind(this));
		globalThis.addEventListener('blur', this.clearActiveKeys.bind(this));
	}

	/**
	 * Returns the keys currently held down.
	 */
	public getActiveKeys(): ReadonlySet<string> {
		return this.activeKeys;
	}

	/**
	 * Processes buffered key presses. Should be called once per game tick.
	 * Returns the set of keys pressed since the last call and clears the buffer.
	 * @returns A ReadonlySet of keys pressed at least once since the last call.
	 */
	public processBufferedKeys(): ReadonlySet<string> {
		// Create a copy to return, as we're about to clear the original
		const pressedKeys = new Set(this.pressedKeysBuffer);
		// Clear the buffer for the next tick
		this.pressedKeysBuffer.clear();
		return pressedKeys;
	}

	private handleKeyDown(event: KeyboardEvent): void {
		// Only buffer the *initial* press, ignore repeats for single-press logic
		if (!event.repeat) {
			this.pressedKeysBuffer.add(event.key); // Add to buffer for next tick processing
			this.activeKeys.add(event.key); // Still track held keys
		}
		// Prevent default scrolling etc.
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
		// We don't remove from pressedKeysBuffer on keyup,
		// it should register the press happened until processed.
	}

	private clearActiveKeys(): void {
		// Clear both held keys and the buffer on blur
		this.activeKeys.clear();
		this.pressedKeysBuffer.clear();
	}
}
