const ObjectClass = require('./object');
const Constants = require('../shared/constants');
const Vec2 = require('../shared/vec2');
const { MAP_SIZE } = require('../shared/constants');

const FRICTION = (Constants.PLAYER_ACCELERATION + Constants.GRAVITY_ACCELERATION) / Constants.PLAYER_MAX_SPEED;
const POSITION_MIN = new Vec2(0, 0);
const POSITION_MAX = new Vec2(Constants.MAP_SIZE, Constants.MAP_SIZE);
const GRAVITY_ACCELERATION_VEC = new Vec2(0, Constants.GRAVITY_ACCELERATION);

class Player extends ObjectClass {
  constructor(id, username, x, y) {
    const direction = Math.random() * 2 * Math.PI;
    super(id, x, y, direction, 'lightgreen');
    this.username = username;
    this.hp = Constants.PLAYER_MAX_HP;
    this.score = 0;
    this.direction = direction;
    this.xHistory = [];
    this.yHistory = [];
    this.length = 100;
    console.log(FRICTION);
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    // super.update(dt);

    // const da = (this.directionTarget - this.direction) % (Math.PI * 2);
    // const daLim = (((2 * da) % (Math.PI * 2)) - da);
    // const daLimClamp = Math.max(Math.min(daLim, Constants.PLAYER_TURN_SPEED), -Constants.PLAYER_TURN_SPEED);
    // this.direction = (this.direction + daLimClamp + (Math.PI * 2)) % (Math.PI * 2);
    // this.direction = this.directionTarget;

    const accelerationValue = (this.boost ? Constants.PLAYER_ACCELERATION_BOOST : Constants.PLAYER_ACCELERATION);
    this.acceleration = new Vec2().direction(this.direction).scaleTo(accelerationValue);
    // console.log(this.acceleration.length());

    this.velocity = this.velocity.add(this.acceleration.clone().add(GRAVITY_ACCELERATION_VEC).scale(dt)).scale(1 - (FRICTION * dt)).scaleToMinLength(Constants.PLAYER_MIN_SPEED);
    console.log(this.acceleration.length(), this.velocity.length());
    
    this.position = this.position.add(this.velocity.clone().scale(dt));
    this.position.x = (this.position.x + MAP_SIZE) % MAP_SIZE;
    this.position.y = Math.max(Math.min(this.position.y, MAP_SIZE), 0);

    this.xHistory.push(this.position.x);
    this.yHistory.push(this.position.y);
    if (this.xHistory.length > this.length) {
      this.xHistory = this.xHistory.slice(-this.length);
      this.yHistory = this.yHistory.slice(-this.length);
    }
  }

  setDirection(dir) {
    this.direction = dir;
  }

  setBoost(boost) {
    this.boost = boost;
  }

  addBird() {
    this.score += 1;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      xHistory: this.xHistory,
      yHistory: this.yHistory,
    };
  }
}

module.exports = Player;
