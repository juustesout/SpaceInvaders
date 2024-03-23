class Particle {
  constructor({ position, velocity, radius, color, fades = true }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    //added :
    c.save();
    c.globalAlpha = this.opacity;

    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();

    c.restore();
  }

  update() {
    if (this.fades) this.opacity -= 0.01;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
