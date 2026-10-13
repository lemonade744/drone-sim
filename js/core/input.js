export class Input {
  constructor() {
    this.keys = {};
    this._pressedThisFrame = new Set();

    addEventListener('keydown', e => {
      if (!this.keys[e.code]) this._pressedThisFrame.add(e.code);
      this.keys[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
  }

  consumePress(code) {
    if (this._pressedThisFrame.has(code)) {
      this._pressedThisFrame.delete(code);
      return true;
    }
    return false;
  }

  readControls() {
    const k = this.keys;
    let thrust = 0, yaw = 0, pitch = 0, roll = 0;
    if (k['KeyW']) thrust += 1;
    if (k['KeyS']) thrust -= 1;
    if (k['KeyA']) yaw += 1;
    if (k['KeyD']) yaw -= 1;
    if (k['ArrowUp'])    pitch -= 1;
    if (k['ArrowDown'])  pitch += 1;
    if (k['ArrowLeft'])  roll += 1;
    if (k['ArrowRight']) roll -= 1;
    return { thrust, yaw, pitch, roll };
  }

  readCameraKeys() {
    return {
      cycleCamera: this.consumePress('KeyC'),
      respawn:     this.consumePress('KeyR'),
      menu:        this.consumePress('KeyM'),
      debug:       this.consumePress('KeyH'),
    };
  }
}