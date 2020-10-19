module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_TURN_SPEED: Math.PI / 48,
  PLAYER_MAX_SPEED: 400,
  PLAYER_MIN_SPEED: 200,
  PLAYER_ACCELERATION: 1000,
  PLAYER_ACCELERATION_BOOST: 1500,
  GRAVITY_ACCELERATION: 500,

  BIRD_RADIUS: 20,
  BIRD_SPEED: 20,
  BIRD_RADIANS_WIDTH: Math.PI / 4,
  flockmateRadius: 60,
  separationDistance: 30,
  maxVelocity: 1,
  separationForce: 0.06,
  alignmentForce: 0.02,
  cohesionForce: 0.02,

  BIRD_TOTAL: 500,

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 1,

  VIEW_DISTANCE: 800,
  CHUNK_SIZE: 100,

  MAP_SIZE: 6000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    DIRECTION_UPDATE: 'direction_update',
    BOOST_UPDATE: 'boost_update',
    GAME_OVER: 'dead',
  },
});
