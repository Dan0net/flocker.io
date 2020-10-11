const Constants = require('../shared/constants');

class Object {
  constructor(id, x, y, dir, speed) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.speed = speed;
  }

  update(dt) {
    this.x = (this.x + dt * this.speed * Math.sin(this.direction) + Constants.MAP_SIZE) % Constants.MAP_SIZE;
    this.y -= dt * this.speed * Math.cos(this.direction);
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));
  }

  distanceToSqrd(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return dx * dx + dy * dy;
  }

  setDirection(dir) {
    this.direction = dir;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      direction: this.direction,
    };
  }
}

module.exports = Object;
