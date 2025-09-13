// ===========================
// NIVEL 2 - Bombas
// ===========================

// Reusar mismo canvas
const canvas = document.getElementById("catGame");
const ctx = canvas.getContext("2d");
const bgMusic = document.getElementById("bgMusic1");
const musicBtn = document.getElementById("musicBtn");

// ===========================
// MÚSICA DE FONDO
// ===========================
document.addEventListener("keydown", () => {
  if (bgMusic.paused) bgMusic.play().catch(e => console.log("No se pudo reproducir:", e));
});

musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.textContent = "🔊 Música ON";
  } else {
    bgMusic.pause();
    musicBtn.textContent = "🔇 Música OFF";
  }
});
// ===========================
// INTRO TIPO STAR WARS
// ===========================
let storyText = [
  "El Perú es un país con oportunidades,",
  " k kommmm baby.."
];
let storyY = canvas.height; 
let storySpeed = 1.5; 

function drawStory() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "yellow";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";

  storyText.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, storyY + index * 40);
  });

  storyY -= storySpeed;

  if (storyY + storyText.length * 40 > 0) {
    requestAnimationFrame(drawStory);
  } else {
    startGame();
  }
}

// ===========================
// MENSAJE DE NIVEL PASADO
// ===========================
function showLevelPassed(callback) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "lime";
  ctx.font = "48px Arial Black";
  ctx.textAlign = "center";
  ctx.fillText("🎉 NIVEL 2 COMPLETADO 🎉", canvas.width / 2, canvas.height / 2);
  setTimeout(callback, 3000);
}

// ===========================
// INICIO DEL JUEGO NIVEL 2
// ===========================
function startGameLevel2() {
  // ===========================
  // CARGA DE IMÁGENES
  // ===========================
  const fondoImg = new Image();
  fondoImg.src = "img/fondo2.png";
  const gatoImg = new Image();
  gatoImg.src = "img/CABO.png";
  const policiaImgs = [new Image(), new Image(), new Image()];
  policiaImgs[0].src = "img/policia.png";
  policiaImgs[2].src = "img/policia 3.png";
// ===========================
  // SONIDO DE ENEMIGO MUERTO
  // ===========================
  const enemyDieSoundPath = "audio/aCUNA.mp3"; // ruta de tu sonido
  const enemyDieSoundPath2 = "audio/TOLEDO.mp3"
  // ===========================
  // VARIABLES
  // ===========================
  let score = 0;
  let lives = 3;
  let gameLoopId;

  // Jugador
  let cat = {
    x: 150,
    y: 230,
    width: 80,
    height: 80,
    vy: 0,
    jumping: false
  };

  let keysPressed = {};

  // Enemigos
  let enemies = [];
  function spawnEnemy() {
    const img = policiaImgs[Math.floor(Math.random() * policiaImgs.length)];
    enemies.push({ x: canvas.width, y: 240, width: 80, height: 80, img: img });
  }
  setInterval(spawnEnemy, 2000);

  // Bombas
  let bombs = [];
  const bombRadius = 100; // radio de explosión

  function launchBomb() {
    bombs.push({
      x: cat.x + cat.width / 2,
      y: cat.y + cat.height / 2,
      timer: 60 // frames antes de explotar (~1s)
    });
  }

  // ===========================
  // CONTROLES
  // ===========================
  document.addEventListener("keydown", (e) => {
    keysPressed[e.key.toLowerCase()] = true;

    if (e.code === "Space" && !cat.jumping) {
      cat.vy = -15;
      cat.jumping = true;
    }

    if (e.key.toLowerCase() === "b") {
      launchBomb();
    }
  });

  document.addEventListener("keyup", (e) => {
    keysPressed[e.key.toLowerCase()] = false;
  });

  // ===========================
  // HUD
  // ===========================
  function updateHUD() {
    document.getElementById("score").textContent = "Puntos: " + score;
    document.getElementById("lives").textContent = "❤️".repeat(lives);

    if (score >= 60) {
      cancelAnimationFrame(gameLoopId);
      showLevelPassed(() => {
        let script = document.createElement("script");
        script.src = "juego8.js"; // siguiente nivel
        document.body.appendChild(script);
      });
    }
  }

  // ===========================
  // MOVIMIENTO GATO
  // ===========================
  function updateCatMovement() {
    if (keysPressed["arrowright"]) {
      cat.x += 5;
      if (cat.x + cat.width > canvas.width) cat.x = canvas.width - cat.width;
    }
    if (keysPressed["arrowleft"]) {
      cat.x -= 5;
      if (cat.x < 0) cat.x = 0;
    }
  }

  // ===========================
  // FONDO EN LOOP
  // ===========================
  let bgX = 0;
  let bgSpeed = 0.5;
  function drawBackground() {
    ctx.drawImage(fondoImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(fondoImg, bgX + canvas.width, 0, canvas.width, canvas.height);
    bgX -= bgSpeed;
    if (bgX <= -canvas.width) bgX = 0;
  }

  // ===========================
  // GAME LOOP
  // ===========================
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    updateCatMovement();

    // Dibujar gato
    ctx.drawImage(gatoImg, cat.x, cat.y, cat.width, cat.height);
    cat.y += cat.vy;
    cat.vy += 0.5;
    if (cat.y >= 230) {
      cat.y = 230;
      cat.vy = 0;
      cat.jumping = false;
    }

    // Enemigos
    enemies.forEach((enemy, i) => {
      enemy.x -= 3;
      ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);

      // Colisión enemigo con gato
      if (
        enemy.x < cat.x + cat.width &&
        enemy.x + enemy.width > cat.x &&
        enemy.y < cat.y + cat.height &&
        enemy.y + enemy.height > cat.y
      ) {
        enemies.splice(i, 1);
        lives--;
        updateHUD();
        if (lives <= 0) {
          alert("😿 GAME OVER en NIVEL 2. Putos: " + score);
          score = 0;
          lives = 3;
          enemies = [];
          updateHUD();
        }
      }
    });

    // Bombas
    bombs.forEach((bomb, i) => {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(bomb.x, bomb.y, 10, 0, Math.PI * 2);
      ctx.fill();

      bomb.timer--;

      if (bomb.timer <= 0) {
        // Dibujar explosión
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, bombRadius, 0, Math.PI * 2);
        ctx.fill();

        // Afectar enemigos
        enemies = enemies.filter((enemy) => {
          let dx = enemy.x + enemy.width / 2 - bomb.x;
          let dy = enemy.y + enemy.height / 2 - bomb.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bombRadius) {
            score++;
          // Elegir audio aleatorio
          const chosenSoundPath = Math.random() < 0.5 ? enemyDieSoundPath : enemyDieSoundPath2;
          const audio = new Audio(chosenSoundPath);

          // Al terminar el audio, soltar el trofeo
          audio.addEventListener('ended', () => {
          dropTreasure(e.x, e.y); // Asegúrate de tener esta función
          });

          // Reproducir el audio
          audio.play();;
            return false;
          }
          return true;
        });

        // Afectar al gato
        let dx = cat.x + cat.width / 2 - bomb.x;
        let dy = cat.y + cat.height / 2 - bomb.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bombRadius) {
          lives--;
          if (lives <= 0) {
            alert("😿 GAME OVER en NIVEL 2. Puntos: " + score);
            cancelAnimationFrame(gameLoopId);
            return;
          }
        }

        bombs.splice(i, 1);
      }
    });

    updateHUD();
    gameLoopId = requestAnimationFrame(gameLoop);
  }

  updateHUD();
  gameLoop();
}

// ===========================
// ARRANCAR NIVEL 2
// ===========================
startGameLevel2();
