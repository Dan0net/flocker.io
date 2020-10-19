class Vec2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s) {
    this.x = this.x * s;
    this.y = this.y * s;
    return this;
  }

  scaleTo(s) {
    const scaleRatio = s / this.length();
    this.x = this.x * scaleRatio;
    this.y = this.y * scaleRatio;
    return this;
  }

  scaleToMinLength(l) {
    const length = this.length();
    if (length < l) {
      const scaleRatio = l / length;
      this.x = this.x * scaleRatio;
      this.y = this.y * scaleRatio;
    }
    return this;
  }

  normalize() {
    const length = this.length();
    this.x = this.x / length;
    this.y = this.y / length;
    return this;
  }

  length() {
    return Math.sqrt(this.lengthSqrd());
  }

  lengthSqrd() {
    return this.x * this.x + this.y * this.y;
  }

  distanceToSqrd(v) {
    return v.clone().subtract(this).lengthSqrd();
  }

  truncate(max) {
    const length = this.length();
    if (length > max) {
      const scaleRatio = max / length;
      this.x = this.x * scaleRatio;
      this.y = this.y * scaleRatio;
    }
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  direction(dir) {
    this.x = Math.sin(dir);
    this.y = -Math.cos(dir);
    return this;
  }

  min(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }

  max(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }

  wrap(v) {
    this.x = (this.x + v.x) % v.x;
    this.y = (this.y + v.y) % v.y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }
}

module.exports = Vec2;
