module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_TURN_SPEED: Math.PI / 48,
  PLAYER_MAX_SPEED: 400,
  PLAYER_MIN_SPEED: 200,
  PLAYER_ACCELERATION: 1000,
  PLAYER_ACCELERATION_BOOST: 75,
  GRAVITY_ACCELERATION: 500,

  BIRD_RADIUS: 20,
  BIRD_SPEED: 100,
  BIRD_RADIANS_WIDTH: Math.PI / 4,
  flockmateRadius: 60,
  separationDistance: 30,
  maxVelocity: 1,
  separationForce: 0.06,
  alignmentForce: 0.01,
  cohesionForce: 0.01,

  BIRD_TOTAL: 50,

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 1,

  VIEW_DISTANCE: 800,

  MAP_SIZE: 750,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    DIRECTION_UPDATE: 'direction_update',
    BOOST_UPDATE: 'boost_update',
    GAME_OVER: 'dead',
  },
});
