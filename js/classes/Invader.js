class Invader {
  constructor({ position }) {
    this.rotation = 0;
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };

    this.image = new Image();
    this.image.src = "./img/invader.png";
    this.image.onload = () => {
      const scale = 1;
      this.width = this.image.width * scale;
      this.height = this.image.height * scale;

      this.position = {
        x: position.x,
        y: position.y,
      };
      this.draw();
    };
    //this.image = {}
  }

  shoot(invaderProjectiles) {
    audio.enemyShoot.play();
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  draw() {
    if (this.image) {
      c.save();

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
    //c.fillStyle = "red";
    //c.fillRect(this.position.x, this.position.y, this.width, this.height);
    //alert(this.image);
  }
}
