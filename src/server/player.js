const ObjectClass = require('./object');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_SPEED);
    this.username = username;
    this.hp = Constants.PLAYER_MAX_HP;
    this.fireCooldown = 0;
    this.score = 0;
    this.directionTarget = this.direction;
    this.acceleration = 0;
    this.xHistory = [];
    this.yHistory = [];
    this.length = 20;
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    // super.update(dt);

    const da = (this.directionTarget - this.direction) % (Math.PI * 2);
    const daLim = (((2 * da) % (Math.PI * 2)) - da);
    const daLimClamp = Math.max(Math.min(daLim, Constants.PLAYER_TURN_SPEED), -Constants.PLAYER_TURN_SPEED);
    this.direction = (this.direction + daLimClamp + (Math.PI * 2)) % (Math.PI * 2);
    
    this.acceleration = -Math.cos(this.direction) * Constants.PLAYER_ACCELERATION;

    this.speed = Math.max(Math.min(this.speed + this.acceleration, Constants.PLAYER_MAX_SPEED), Constants.PLAYER_MIN_SPEED);
    // console.log(this.direction, this.acceleration, this.speed);

    const moveX = (dt * this.speed + 0.5 * this.acceleration * dt * dt) * Math.sin(this.direction);
    const moveY = (dt * this.speed + 0.5 * this.acceleration * dt * dt) * Math.cos(this.direction);

    this.x = (this.x + moveX + Constants.MAP_SIZE) % Constants.MAP_SIZE;
    this.y -= moveY;

    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    this.xHistory.push(this.x);
    this.yHistory.push(this.y);
    if (this.xHistory.length > this.length) {
      this.xHistory = this.xHistory.slice(-this.length);
      this.yHistory = this.yHistory.slice(-this.length);
    }
  }

  setDirection(dir) {
    this.directionTarget = dir;
  }

  addBird() {
    this.length += 1;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      length: this.length,
      xHistory: this.xHistory,
      yHistory: this.yHistory,
    };
  }
}

module.exports = Player;
