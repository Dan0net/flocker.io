const Constants = require('../shared/constants');
const Vec2 = require('../shared/vec2');

class Object {
  constructor(id, x, y, direction, color) {
    this.id = id;
    this.position = new Vec2(x, y);
    this.velocity = new Vec2(Math.sin(direction), Math.cos(direction)).scaleTo(Constants.maxVelocity);
    this.acceleration = new Vec2();
    this.color = color || 'white';
  }

  update(dt) {
    this.velocity.add(this.acceleration.clone().scale(dt));
    this.position.add(this.velocity.clone().scale(dt));
  }

  serializeForUpdate() {
    return {
      id: this.id,
      positionX: this.position.x,
      positionY: this.position.y,
      velocityX: this.velocity.x,
      velocityY: this.velocity.y,
      accelerationX: this.acceleration.x,
      accelerationY: this.acceleration.y,
      color: this.color,
    };
  }
}

module.exports = Object;
