// ===========================
// CONFIGURACIÓN INICIAL
// ===========================
const canvas = document.getElementById("catGame");
const ctx = canvas.getContext("2d");

let score = 0;
let lives = 3;
let gameLoopId;

// ===========================
// IMÁGENES
// ===========================
const fondoImg = new Image();
fondoImg.src = "img/fondo3.png";

const gatoImg = new Image();
gatoImg.src = "img/policia 2.png";

// Tesoros buenos (3)
const goodTreasureImgs = [
  Object.assign(new Image(), { src: "img/tesoro1.png" }),
  Object.assign(new Image(), { src: "img/tesoro2.png" }),
  Object.assign(new Image(), { src: "img/tesoro3.png" })
];

// Tesoros malos (2)
const badTreasureImgs = [
  Object.assign(new Image(), { src: "img/trampa1.png" }),
  Object.assign(new Image(), { src: "img/trampa2.png" })
];

// ===========================
// AUDIO
// ===========================
const bgMusic = document.getElementById("bgMusic");
const goodSound = new Audio("audio/catch.mp3");
const badSound = new Audio("audio/ALAN.mp3");
document.addEventListener("keydown", () => {
  if (bgMusic.paused) {
    bgMusic.play().catch(err => console.log("Bloqueado:", err));
  }
}, { once: true });
document.getElementById("musicBtn").addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play().catch(e => console.log("Error música:", e));
  } else {
    bgMusic.pause();
  }
});

// ===========================
// HUD
// ===========================
function updateHUD() {
  document.getElementById("score").textContent = "Puntos: " + score;
  document.getElementById("lives").textContent = "❤️".repeat(lives);
}

// ===========================
// JUGADOR
// ===========================
let cat = { x: 110, y: 500, width: 100, height: 100, vx: 6 };
let keysPressed = {};

document.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});
document.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

function updateCat() {
  if (keysPressed["d"] || keysPressed["arrowright"]) {
    cat.x += cat.vx;
    if (cat.x + cat.width > canvas.width) cat.x = canvas.width - cat.width;
  }
  if (keysPressed["a"] || keysPressed["arrowleft"]) {
    cat.x -= cat.vx;
    if (cat.x < 0) cat.x = 0;
  }
  ctx.drawImage(gatoImg, cat.x, cat.y, cat.width, cat.height);
}

// ===========================
// TESOROS
// ===========================
let treasures = [];

function spawnTreasure() {
  let cantidad = Math.floor(Math.random() * 3) + 2; // 2–4 tesoros
  for (let i = 0; i < cantidad; i++) {
    let isGood = Math.random() < 0.7; // 70% buenos, 30% malos
    let img = isGood
      ? goodTreasureImgs[Math.floor(Math.random() * goodTreasureImgs.length)]
      : badTreasureImgs[Math.floor(Math.random() * badTreasureImgs.length)];

    treasures.push({
      x: Math.random() * (canvas.width - 40),
      y: -50 - Math.random() * 100,
      width: 40,
      height: 40,
      vy: 2 + Math.random() * 3,
      img: img,
      good: isGood
    });
  }
}
setInterval(spawnTreasure, 1200);

function updateTreasures() {
  for (let i = treasures.length - 1; i >= 0; i--) {
    let t = treasures[i];
    t.y += t.vy;
    ctx.drawImage(t.img, t.x, t.y, t.width, t.height);

    // Colisión con jugador
    if (
      t.x < cat.x + cat.width &&
      t.x + t.width > cat.x &&
      t.y < cat.y + cat.height &&
      t.y + t.height > cat.y
    ) {
      treasures.splice(i, 1);

      if (t.good) {
        score++;
        goodSound.currentTime = 0;
        goodSound.play().catch(() => {});
      } else {
        lives--;
        badSound.currentTime = 0;
        badSound.play().catch(() => {});
      }
      updateHUD();

      if (score >= 30) {
        alert("🎉 ¡Ganaste atrapando tesoros!");
        cancelAnimationFrame(gameLoopId);
      }
      if (lives <= 0) {
        alert("💀 Game Over. Te quedaste sin vidas");
        resetGame();
      }
    }

    // Si cae al suelo (solo cuenta si es bueno)
    if (t.y > canvas.height) {
      treasures.splice(i, 1);
      if (t.good) {
        lives--;
        updateHUD();
        if (lives <= 0) {
          alert("💀 Game Over. Te quedaste sin vidas");
          resetGame();
        }
      }
    }
  }
}

// ===========================
// LOOP PRINCIPAL
// ===========================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fondoImg, 0, 0, canvas.width, canvas.height);
  updateCat();
  updateTreasures();
  gameLoopId = requestAnimationFrame(gameLoop);
}

function resetGame() {
  score = 0;
  lives = 3;
  treasures = [];
  updateHUD();
}

updateHUD();
bgMusic.play().catch(() => {});
gameLoop();
