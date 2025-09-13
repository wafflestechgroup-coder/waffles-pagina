// ===========================
// CONFIGURACIÓN INICIAL
// ===========================
const canvas = document.getElementById("catGame");
const ctx = canvas.getContext("2d");

const bgMusic = document.getElementById("bgMusic");
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
  "pero la corrupción atacó uwu xdxd",
  "Sin embargo, un héroe se levanta..."
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
// INICIAR EL JUEGO
// ===========================
function startGame() {

  // ===========================
  // CARGA DE IMÁGENES
  // ===========================
  const fondoImg = new Image();
  fondoImg.src = "img/fondo.png";

  const gatoImg = new Image();
  gatoImg.src = "img/castillo.png";

  const policiaImgs = [new Image(), new Image(), new Image()];
  policiaImgs[0].src = "img/policia.png";
  policiaImgs[1].src = "img/policia 2.png";
  policiaImgs[2].src = "img/policia 3.png";

  const birdImg = new Image();
  birdImg.src = "img/bird.png";

  const projectileImg = new Image();
  projectileImg.src = "img/proyectil.png";

  // ===========================
  // SONIDO DE ENEMIGO MUERTO
  // ===========================
  const enemyDieSoundPath = "audio/alan.mp3";
  const enemyDieSoundPath2 = "audio/acuna.mp3";

  // ===========================
  // HUD
  // ===========================
  let score = 0;
  let lives = 3;
  let gameLoopId; 
  function updateHUD() {
    document.getElementById("score").textContent = "Puntos: " + score;
    document.getElementById("lives").textContent = "❤️".repeat(lives);
  }

  // ===========================
  // JUGADOR
  // ===========================
  let cat = { x: 150, y: 160, width: 80, height: 80, vy: 0, jumping: false, attacking: false };
  let keysPressed = {};

  // ===========================
  // ENEMIGOS
  // ===========================
  let enemies = [];
  function spawnEnemy() {
    const img = policiaImgs[Math.floor(Math.random() * policiaImgs.length)];
    enemies.push({ x: 600, y: 240, width: 80, height: 80, img: img });
  }
  let enemySpawner = setInterval(spawnEnemy, 2000);

  // ===========================
  // OBJETO VOLADOR (AVE)
  // ===========================
  let bird = { x: canvas.width + Math.random() * 200, y: Math.random() * 100 + 50, width: 60, height: 60, vx: 1 };
  function drawBird() {
    ctx.shadowColor = "rgba(255,255,0,0.7)";
    ctx.shadowBlur = 20;
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    ctx.shadowBlur = 0;

    bird.x -= bird.vx;
    if (bird.x + bird.width < 0) {
      bird.x = canvas.width + Math.random() * 100;
      bird.y = Math.random() * 100 + 50;
    }
  }

  // ===========================
  // PROYECTILES
  // ===========================
  let projectiles = [];
  function shootProjectile() {
    projectiles.push({ x: cat.x + cat.width / 2, y: cat.y + cat.height / 2, width: 40, height: 40, vx: 8, angle: 0 });
  }
  function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      let p = projectiles[i];
      p.x += p.vx;
      p.angle += 0.3;

      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      ctx.rotate(p.angle);
      ctx.shadowColor = "rgba(255,255,255,0.9)";
      ctx.shadowBlur = 30;
      ctx.drawImage(projectileImg, -p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();

      // Colisión con enemigos
      for (let j = enemies.length - 1; j >= 0; j--) {
        let e = enemies[j];
        if (
          p.x < e.x + e.width &&
          p.x + p.width > e.x &&
          p.y < e.y + e.height &&
          p.y + p.height > e.y
        ) {
          enemies.splice(j, 1);
          projectiles.splice(i, 1);
          score++;
          updateHUD();

          // Elegir audio aleatorio
          const chosenSoundPath = Math.random() < 0.5 ? enemyDieSoundPath : enemyDieSoundPath2;
          const audio = new Audio(chosenSoundPath);
          audio.play();

          break;
        }
      }

      if (p.x > canvas.width) projectiles.splice(i, 1);
    }
  }

  // ===========================
  // CONTROLES
  // ===========================
  function keyDownHandler(e) {
    keysPressed[e.key.toLowerCase()] = true;

    if (e.key.toLowerCase() === "a" && !keysPressed['s']) {
      cat.attacking = true;
      setTimeout(() => (cat.attacking = false), 300);
    }
    if (e.code === "Space" && !cat.jumping) {
      cat.vy = -15;
      cat.jumping = true;
    }
    if (e.key.toLowerCase() === "x") shootProjectile();
  }

  function keyUpHandler(e) {
    keysPressed[e.key.toLowerCase()] = false;
  }

  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  // ===========================
  // MOVIMIENTO DEL GATO
  // ===========================
  function updateCatMovement() {
    if (keysPressed['arrowright']) { cat.x += 5; if (cat.x + cat.width > canvas.width) cat.x = canvas.width - cat.width; }
    if (keysPressed['arrowleft']) { cat.x -= 5; if (cat.x < 0) cat.x = 0; }
    if (keysPressed['a'] && keysPressed['s'] && !cat.jumping) { cat.vy = -25; cat.jumping = true; }
  }

  // ===========================
  // FONDO EN LOOP
  // ===========================
  let bgX = 0; let bgSpeed = 0.5;
  function drawBackground() {
    ctx.drawImage(fondoImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(fondoImg, bgX + canvas.width, 0, canvas.width, canvas.height);
    bgX -= bgSpeed;
    if (bgX <= -canvas.width) bgX = 0;
  }

  // ===========================
  // LOOP PRINCIPAL
  // ===========================
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    updateCatMovement();
    ctx.drawImage(gatoImg, cat.x, cat.y, cat.width, cat.height);

    cat.y += cat.vy;
    cat.vy += 0.5;
    if (cat.y >= 230) { cat.y = 230; cat.vy = 0; cat.jumping = false; }

    enemies.forEach((enemy, i) => {
      enemy.x -= 3;
      ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);

      if (cat.attacking && enemy.x < cat.x + cat.width + 20 && enemy.x > cat.x && enemy.y === 240) {
        enemies.splice(i, 1); score++; updateHUD();
        new Audio(enemyDieSoundPath).play();
      }

      if (enemy.x < cat.x + cat.width && enemy.x + enemy.width > cat.x &&
          enemy.y < cat.y + cat.height && enemy.y + enemy.height > cat.y) {
        enemies.splice(i, 1); lives--; updateHUD();
        if (lives <= 0) {
          alert("😿 Game Over. Puntos: " + score);
          score = 0; lives = 3; enemies = []; updateHUD();
        }
      }
    });

    updateProjectiles();
    drawBird();

    // 🔥 Condición de cambio de nivel
    if (score >= 60) {
      endLevel(); // limpiar timers y eventos
      setTimeout(() => {
        cargarSiguienteNivel();
      }, 500); // pausa para que no se corte brusco
      return;
    }

    gameLoopId = requestAnimationFrame(gameLoop);
  }

  updateHUD();
  gameLoopId = requestAnimationFrame(gameLoop);

  // ===========================
  // FUNCIONES DE LIMPIEZA
  // ===========================
  function endLevel() {
    clearInterval(enemySpawner);
    enemies = [];
    projectiles = [];
    keysPressed = {};
    document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);
    cancelAnimationFrame(gameLoopId);
  }
}

// ===========================
// CAMBIO DE NIVEL
// ===========================
function cargarSiguienteNivel() {
  alert("🚀 ¡Pasaste al siguiente nivel!");

  // Pausar música nivel 1
  const music1 = document.getElementById("bgMusic");
  if (music1) music1.pause();

  // Reproducir música nivel 2
  const music2 = document.getElementById("bgMusic1");
  if (music2) music2.play().catch(err => console.log("No se pudo reproducir:", err));

  // Cargar script del nivel 2
  const newScript = document.createElement("script");
  newScript.src = "js/game6.js";
  newScript.onload = () => console.log("Nivel 2 cargado 🚀");
  document.body.appendChild(newScript);
}

// ===========================
// INICIAR CON INTRO
// ===========================
drawStory();

