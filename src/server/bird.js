const shortid = require('shortid');
const ObjectClass = require('./object');
const Constants = require('../shared/constants');
const Vec2 = require('../shared/vec2');
const { MAP_SIZE } = require('../shared/constants');

const MAP_SIZE_VEC = new Vec2(MAP_SIZE, MAP_SIZE);
const BIRD_DISTANCE = Constants.PLAYER_RADIUS * 2;

class Bird extends ObjectClass {
  constructor(playerID, x, y, dir) {
    super(shortid(), x, y, dir, 'white');
    this.playerID = playerID;
  }

  update(dt, otherBirds) {
    // super.update(dt);
    // return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;

    const forces = {
      alignment: new Vec2(),
      cohesion: new Vec2(),
      separation: new Vec2(),
    };

    this.acceleration = new Vec2();

    otherBirds.forEach(otherBird => {
      if (this === otherBird) return;

      const diff = otherBird.position.clone().subtract(this.position);
      const distance = diff.length();

      if (distance && distance < BIRD_DISTANCE) {
        forces.separation.add(diff.clone().scaleTo(-1 / distance)).active = true;
      }

      if (distance < Constants.flockmateRadius) {
        forces.cohesion.add(diff).active = true;
        forces.alignment.add(otherBird.velocity).active = true;
      }
    });

    this.addForceToAcceleration(forces.alignment, Constants.alignmentForce);
    this.addForceToAcceleration(forces.cohesion, Constants.cohesionForce);
    this.addForceToAcceleration(forces.separation, Constants.separationForce);
    
    this.velocity.add(this.acceleration.clone().scale(dt * 60)).truncate(Constants.maxVelocity);

    this.position.add(this.velocity.clone().scale(dt * Constants.BIRD_SPEED));

    this.position = this.position.wrap(MAP_SIZE_VEC);
  }

  addForceToAcceleration(force, forceConstant) {
    if (force.active) {
      force.scaleTo(Constants.maxVelocity);
      force.subtract(this.velocity);
      force.truncate(forceConstant);
      this.acceleration.add(force);
    }
  }

  addPlayer(player) {
    this.playerID = player.id;
    this.color = 'red';
  }
}

module.exports = Bird;
