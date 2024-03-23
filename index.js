const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#scoreEl");

const c = canvas.getContext("2d");
c.canvas.width = 1024; //window.innerWidth; //window.innerWidth; window is inferred
c.canvas.height = 576; //window.innerHeight;

let speedUp = 1.1;
let player = new Player();
let projectiles = [];
let grids = [new Grid()];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
let powerUps = [];
let frames = 0;
let score = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
  over: false,
  active: true,
};

let keys = {
  a: { pressed: false },
  d: { pressed: false },
  space: { pressed: false },
};

let spawnBuffer = 500;
let msPrev = window.performance.now();
let fps = 60;
let fpsInterval = 1000 / fps;

function init() {
  player = new Player();
  projectiles = [];
  grids = [new Grid()];
  invaderProjectiles = [];
  particles = [];
  bombs = [];
  powerUps = [];

  frames = 0;
  score = 0;
  randomInterval = Math.floor(Math.random() * 500 + 500);
  game = {
    over: false,
    active: true,
  };

  keys = {
    a: { pressed: false },
    d: { pressed: false },
    space: { pressed: false },
  };

  createBackground();
}

player.draw();

function animate() {
  if (game.active === false) return;
  requestAnimationFrame(animate);

  const msNow = window.performance.now();
  const elapsed = msNow - msPrev;

  if (elapsed < fpsInterval) return;

  msPrev = msNow - (elapsed % 16.66);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  for (let i = powerUps.length - 1; i >= 0; i--) {
    let powerUp = powerUps[i];
    if (powerUp.position.x - powerUp.radius > canvas.width) {
      powerUps.splice(i, 1);
    } else {
      powerUp.update();
    }
  }
  //spawn powerUps
  if (frames % 500 === 0) {
    powerUps.push(
      new PowerUp({
        position: {
          x: 0,
          y: Math.random() * 300 + 15, //15 = powerup radius
        },
        velocity: {
          x: 5,
          y: 0,
        },
      })
    );
  }

  if (frames % 200 === 0 || bombs.length < 3) {
    bombs.push(
      new Bomb({
        position: {
          x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
          y: randomBetween(Bomb.radius, canvas.height - Bomb.radius) - 100,
        },
        velocity: {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
        },
      })
    );
  }

  //draw bombs
  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    if (bomb.opacity <= 0) bombs.splice(i, 1);
    else bomb.update();
  }

  player.update();

  for (let i = player.particles.length - 1; i >= 0; i--) {
    const particle = player.particles[i];
    particle.update();
    if (player.opacity === 0) particles.splice(i, 1);
  }

  particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }
  });

  particles.forEach((particle, pind) => {
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(pind, 1);
      }, 0);
    } else particle.update();
  });

  invaderProjectiles.forEach((invaderProjectile, invaderProjectileIndex) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(invaderProjectileIndex, 1);
      }, 0);
    } else invaderProjectile.update();

    if (
      rectangularCollision({
        rectangle1: invaderProjectile,
        rectangle2: player,
      })
    ) {
      invaderProjectiles.splice(invaderProjectileIndex, 1);
      endGame();
    }
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];

    //check if we hit a bomb
    for (let j = bombs.length - 1; j >= 0; j--) {
      const bomb = bombs[j];
      if (
        Math.hypot(
          projectile.position.x - bomb.position.x,
          projectile.position.y - bomb.position.y
        ) <
          projectile.radius + bomb.radius &&
        !bomb.active //bomb is active when it explodes
      ) {
        projectiles.splice(i, 1);
        bomb.explode();
      }
    }

    //check if we hit a bomb
    for (let j = powerUps.length - 1; j >= 0; j--) {
      const powerUp = powerUps[j];
      if (
        Math.hypot(
          projectile.position.x - powerUp.position.x,
          projectile.position.y - powerUp.position.y
        ) <
          projectile.radius + powerUp.radius &&
        !powerUp.active //bomb is active when it explodes
      ) {
        projectiles.splice(i, 1);
        powerUps.splice(j, 1);
        audio.bonus.play();
        player.powerUp = "MachineGun";
        setTimeout(() => {
          player.powerUp = null;
        }, 5000);
      }
    }

    //if y < 0 > remove invader's projectiles
    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(i, 1);
    } else projectile.update();
  }

  grids.forEach((grid, gridIndex) => {
    grid.update();

    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    for (let n = grid.invaders.length - 1; n >= 0; n--) {
      const invader = grid.invaders[n];
      const invaderRadius = 15; //sneaky

      invader.update({ velocity: grid.velocity });

      //check if we hit a bomb
      for (let j = bombs.length - 1; j >= 0; j--) {
        const bomb = bombs[j];
        //if bomb touches invader, remove invader
        if (
          Math.hypot(
            invader.position.x - bomb.position.x,
            invader.position.y - bomb.position.y
          ) <
            invaderRadius + bomb.radius &&
          bomb.active //bomb is active when it explodes
        ) {
          //536
          grid.invaders.splice(n, 1);

          //only 50 points per invader killed by bomb
          score += 50;
          scoreEl.innerHTML = score;
          fncCreateScoreLabel({ invader, score: 50 });
        }
      }

      //check if projectiles hit enemy
      projectiles.forEach((projectile, p) => {
        let topProjectile = projectile.position.y - projectile.radius;
        let bottomInvader = invader.position.y + invader.height;

        let rightProjectile = projectile.position.x + projectile.radius;
        let leftInvader = invader.position.x;

        let bottomProjectile = projectile.position.y + projectile.radius;
        let leftProjectile = projectile.position.x - projectile.radius;

        let topInvader = invader.position.y;
        let rightInvader = invader.position.x + invader.width;

        if (
          topProjectile <= bottomInvader &&
          rightProjectile >= leftInvader &&
          leftProjectile <= rightInvader &&
          bottomProjectile >= topInvader
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((inv) => {
              return inv === invader;
            });

            const projectileFound = projectiles.find(
              (prj) => prj === projectile
            );

            //remove invader & projectile
            if (invaderFound && projectileFound) {
              createParticles({ object: invader });
              //update score
              score += 100;
              scoreEl.innerHTML = score;

              fncCreateScoreLabel({ invader });

              //remove invader and projectile
              grid.invaders.splice(n, 1);
              audio.explode.play();
              projectiles.splice(p, 1);
              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1]; //0 based, length is 1 based
                grid.width =
                  lastInvader.position.x -
                  firstInvader.position.x +
                  lastInvader.width;
                grid.position.x = firstInvader.position.x;
              } else {
                grids.splice(gridIndex, 1);
              }
            }
          }, 0);
        }
      });

      if (
        rectangularCollision({
          rectangle1: invader,
          rectangle2: player,
        }) &&
        !game.over
      ) {
        endGame();
      }
    }
  });

  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  } else {
    if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
      player.velocity.x = +5;
      player.rotation = +0.15;
    } else {
      player.velocity.x = 0;
      player.rotation = +0.0;
    }
  }

  frames++;

  if (frames % randomInterval === 0) {
    if (spawnBuffer >= 100) {
      spawnBuffer -= 50;
    } else {
      if (spawnBuffer < 0) spawnBuffer = -spawnBuffer;
      spawnBuffer += 100;
    }
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500 + 100 + spawnBuffer);
    frames = 0;
  }

  if (
    keys.space.pressed &&
    player.powerUp === "MachineGun" &&
    frames % 2 === 0 &&
    !game.over
  ) {
    if (frames % 6 === 0) audio.shoot.play();
    projectiles.push(
      new Projectile({
        position: {
          x: player.position.x + player.width / 2,
          y: player.position.y,
        },
        velocity: {
          x: 0,
          y: -10,
        },
      })
    );
  }
}

//animate();

document.querySelector("#startButton").addEventListener("click", () => {
  audio.backgroundMusic.play();
  audio.start.play();
  document.querySelector("#startScreen").style.display = "none";
  document.querySelector("#scoreContainer").style.display = "block";
  init();
  animate();
});

document.querySelector("#restartButton").addEventListener("click", () => {
  document.querySelector("#restartScreen").style.display = "none";
  document.querySelector("#scoreContainer").style.display = "block";
  audio.select.play();
  init();
  animate();
});

addEventListener("keypress", ({ key }) => {
  if (game.over) return;

  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case " ":
      if (keys.space.pressed) return;
      keys.space.pressed = true;

      if (player.powerUp === "MachineGun") return;

      audio.shoot.play();

      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
          color: "cyan",
        })
      );

      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case " ":
      keys.space.pressed = false;
      break;
  }
});

function endGame() {
  //console.log("you loose");
  setTimeout(() => {
    player.opacity = 0;
    game.over = true;
    audio.gameOver.play();
  }, 0);

  setTimeout(() => {
    game.active = false;
    document.querySelector("#restartScreen").style.display = "flex";
  }, 2000);

  createParticles({ object: player, color: "blue", fades: true });
}
