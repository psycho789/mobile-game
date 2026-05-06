export class AnimationController {
  constructor({ frames, frameDuration = 0.09, initialState = "run" }) {
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.state = initialState;
    this.time = 0;
    this.index = 0;
    this.lockTimer = 0;
  }

  setState(state, { lockFor = 0, restart = false } = {}) {
    if (this.lockTimer > 0 && state !== this.state) return;
    if (this.state !== state || restart) {
      this.state = state;
      this.time = 0;
      this.index = 0;
    }
    this.lockTimer = Math.max(this.lockTimer, lockFor);
  }

  update(dt) {
    this.lockTimer = Math.max(0, this.lockTimer - dt);
    const stateFrames = this.frames[this.state] || this.frames.run;
    if (!stateFrames || !stateFrames.length) return undefined;

    this.time += dt;
    while (this.time >= this.frameDuration) {
      this.time -= this.frameDuration;
      this.index = (this.index + 1) % stateFrames.length;
    }
    return stateFrames[this.index];
  }
}
