class Player {
  constructor() {
    this.rotation = 0;
    this.opacity = 1;
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.particles = [];
    this.frames = 0;
    this.image = new Image();
    this.image.src = "./img/spaceship.png";
    this.image.onload = () => {
      const scale = 0.15;
      this.width = this.image.width * scale;
      this.height = this.image.height * scale;

      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
      this.draw();
    };
    //this.image = {}
  }

  draw() {
    if (this.image) {
      c.save();
      c.globalAlpha = this.opacity;

      c.translate(
        player.position.x + player.width / 2,
        player.position.y + player.height / 2
      );

      c.rotate(this.rotation);

      c.translate(
        -player.position.x - player.width / 2,
        -player.position.y - player.height / 2
      );

      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }

    c.restore();
  }

  update() {
    if (!this.image) return;

    this.draw();
    this.position.x += this.velocity.x;

    this.frames++;

    if (this.opacity !== 1) return;
    //working
    if (this.frames % 2 === 0) {
      this.particles.push(
        new Particle({
          position: {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height,
          },
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: 1.4,
          },
          radius: Math.random() * 2,
          color: "white",
          fades: true,
        })
      );
    }
  }
}
