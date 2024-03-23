function randomBetween(min, max) {
  //max = canvas.width - bomb.radius >  c.w - b.r * 2 becomes max - min
  return Math.floor(Math.random() * (max - min) + min);
}

//create background stars : use createParticles code
function createBackground() {
  for (let n = 1; n <= 100; n++) {
    particles.push(
      new Particle({
        position: {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
        },
        velocity: {
          x: 0,
          y: 0.5,
        },
        radius: Math.random() * 3,
        color: "white",
        fades: false,
      })
    );
  }
}

function createParticles({ object, color = "#BAABDE", fades = true }) {
  for (let n = 1; n <= 15; n++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: color || "#BAABDE",
        fades: fades,
      })
    );
  }
}

function fncCreateScoreLabel({ score = 100, invader }) {
  //create dynamic score label
  const scoreLabel = document.createElement("label");
  scoreLabel.innerHTML = "100";
  //left corner
  scoreLabel.style.top = invader.position.y + "px";
  scoreLabel.style.left = invader.position.x + "px";
  scoreLabel.style.position = "absolute";
  scoreLabel.style.color = "pink";

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => {
      document.querySelector("#parentDiv").removeChild(scoreLabel);
    },
  });

  document.querySelector("#parentDiv").appendChild(scoreLabel);
}

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y && //bottom projectile, topplayer
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x && //projectile right, player left
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width //projectile right, player right
  );
}
