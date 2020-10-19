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
        // console.log(forces.separation);
      }

      if (distance < Constants.flockmateRadius) {
        forces.cohesion.add(diff).active = true;
        forces.alignment.add(otherBird.velocity).active = true;
      }
    });

    // console.log(this.acceleration.x, this.acceleration.y);

    this.addForceToAcceleration(forces.alignment, Constants.alignmentForce);
    this.addForceToAcceleration(forces.cohesion, Constants.cohesionForce);
    this.addForceToAcceleration(forces.separation, Constants.separationForce);
    
    this.velocity.add(this.acceleration.clone().scale(dt * 60)).truncate(Constants.maxVelocity);

    this.position.add(this.velocity.clone().scale(dt * Constants.BIRD_SPEED));
    // if (this.velocity.x === 0) {
    //   console.log(this.alignment);
    //   console.log(this.acceleration);
    // }

    this.position = this.position.wrap(MAP_SIZE_VEC);
  }

  addForceToAcceleration(force, forceConstant) {
    if (force.active) {
      force.scaleTo(Constants.maxVelocity);
      force.subtract(this.velocity);
      force.truncate(forceConstant);
      // console.log('align', force);
      this.acceleration.add(force);
      // console.log(this.acceleration);
    }
  }

  addPlayer(player) {
    this.playerID = player.id;
    this.color = 'red';
  }
}

module.exports = Bird;
