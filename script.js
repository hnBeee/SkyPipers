const bird = document.querySelector("#bird");
const pipeContainer = document.querySelector("#pipe-container");
const pipeTop = document.querySelector("#pipe-top");
const pipeBottom = document.querySelector("#pipe-bottom");
const scoreElement = document.querySelector("#score");
const startScreen = document.querySelector("#start");
const playBtn = document.querySelector("#play-btn");
const gameOverScreen = document.querySelector("#game-over");
const playAgainBtn = document.querySelector("#play-again-btn");
const finalScoreElement = document.querySelector("#final-score");
const bestScoreElement = document.querySelector("#best-score");

const jumpSound = document.getElementById("jump-sound");
const backgroundMusic = document.getElementById("background-music");
const dieSound = document.getElementById("die-sound");

let birdTop = 200;
const gravity = 0.5;
let birdVelocity = 0;
const jumpHeight = 8;
let pipeLeft = 200;
const containerHeight = 600;
const gapSize = 150;
let score = 0;
let pipePassed = false;
let isPlaying = false;

let bestScore = localStorage.getItem("bestScore") || 0;

backgroundMusic.volume = 0.3;
jumpSound.volume = 0.5;
dieSound.volume = 0.7;

dieSound.loop = false;
dieSound.addEventListener("ended", () => {
  dieSound.currentTime = 0;
});

function updateScore() {
  scoreElement.textContent = "Score: " + score;
}
function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
  bestScoreElement.textContent = "Best Score: " + bestScore;
}

function moveBird() {
  if (isPlaying) {
    birdVelocity += gravity;
    birdTop += birdVelocity;
    bird.style.top = birdTop + "px";

    bird.style.transform = `rotate(${Math.min(birdVelocity * 2, 15)}deg)`;

    if (birdTop > containerHeight - 50) {
      birdTop = containerHeight - 50;
      gameOver();
    } else if (birdTop < 0) {
      birdTop = 0;
    }
  }
}

function jump(event) {
  if (isPlaying) {
    if (event === "touchstart") {
      event.preventDefault();
    }
    birdVelocity = -jumpHeight;

    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

document.addEventListener("keydown", jump);
document.addEventListener("touchstart", jump);

function movePipes() {
  pipeLeft -= 3;
  pipeContainer.style.left = pipeLeft + "px";

  if (pipeLeft < -50) {
    pipeLeft = 400;
    const minPipeHeight = 100;
    const maxPipeHeight = containerHeight - gapSize - minPipeHeight;

    const gapPosition =
      Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;

    pipeTop.style.height = gapPosition + "px";
    pipeBottom.style.height = containerHeight - gapPosition - gapSize + "px";
    pipePassed = false;
  }

  if (pipeLeft < 50 && pipeLeft > 0 && !pipePassed) {
    score++;
    pipePassed = true;
    updateScore();
  }

  if (pipeLeft < 50 && pipeLeft > 0) {
    const pipeTopHeight = parseInt(pipeTop.style.height);
    const pipeBottomHeight =
      containerHeight - parseInt(pipeBottom.style.height);

    if (birdTop < pipeTopHeight || birdTop > pipeBottomHeight - 50) {
      gameOver();
    }
  }
}

function isColliding(birdRect, pipeRect) {
  return (
    birdRect.left < pipeRect.right &&
    birdRect.right > pipeRect.left &&
    birdRect.top < pipeRect.bottom &&
    birdRect.bottom > pipeRect.top
  );
}

function checkCollision() {
  const birdRect = bird.getBoundingClientRect();
  const pipeTopRect = pipeTop.getBoundingClientRect();
  const pipeBottomRect = pipeBottom.getBoundingClientRect();

  if (
    isColliding(birdRect, pipeTopRect) ||
    isColliding(birdRect, pipeBottomRect)
  ) {
    birdVelocity = 7;
    birdTop += birdVelocity;
    gameOver();
  }
}

function startGame() {
  isPlaying = true;
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  resetGame();

  backgroundMusic.play();

  gameLoop();
}

playBtn.addEventListener("click", startGame);
playBtn.addEventListener("touchstart", startGame);
playAgainBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("touchstart", startGame);

function gameOver() {
  if (gameOverTriggered) return;
  gameOverTriggered = true;

  isPlaying = false;
  gameOverScreen.style.display = "block";
  finalScoreElement.textContent = "Your Score: " + score;

  updateBestScore();

  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

  dieSound.currentTime = 0;
  dieSound.play();

  let bounceHeight = 0;
  let bounceSpeed = 1;

  function bounce() {
    if (bounceHeight < 5) {
      birdTop -= bounceSpeed;
      birdVelocity = -bounceSpeed;
      bird.style.top = birdTop + "px";
      bounceHeight++;
      requestAnimationFrame(bounce);
    } else {
      let fallSpeed = 10;

      function fall() {
        if (birdTop < containerHeight - 50) {
          birdTop += fallSpeed;
          bird.style.top = birdTop + "px";
          requestAnimationFrame(fall);
        } else {
          setTimeout(() => {
            birdTop = 200;
            birdVelocity = 0;
            updateScore();
          }, 500);
        }
      }
      fall();
    }
  }
  bounce();
}

function resetGame() {
  gameOverTriggered = false;
  birdTop = 200;
  birdVelocity = 0;
  pipeLeft = 400;
  score = 0;
  pipePassed = false;
  updateScore();
  updateBestScore();
  gameOverScreen.style.display = "none";
}

function gameLoop() {
  if (isPlaying) {
    moveBird();
    movePipes();
    checkCollision();
    updateScore();
    updateBestScore();
    requestAnimationFrame(gameLoop);
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    backgroundMusic.pause();
    dieSound.pause();
  } else if (document.visibilityState === "visible") {
    if (isPlaying) {
      backgroundMusic.play();
    }
  }
});

document.body.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);
