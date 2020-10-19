const Constants = require('../shared/constants');

const PLAYER_BIRD_DISTANCE_SQRD = (Constants.PLAYER_RADIUS * 2) ** 2;

// Returns an array of bullets to be destroyed.
function applyCollisions(players, birds) {
  const destroyedBirds = [];
  for (let i = 0; i < birds.length; i++) {
    for (let j = 0; j < players.length; j++) {
      const bird = birds[i];
      const player = players[j];
      if (
        bird.parentID !== player.id &&
        player.position.distanceToSqrd(bird.position) <= PLAYER_BIRD_DISTANCE_SQRD
      ) {
        destroyedBirds.push(bird);
        player.addBird();
        bird.addPlayer(player);
        break;
      }
    }
  }
  return destroyedBirds;
}

module.exports = applyCollisions;
