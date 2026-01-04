// --- 🛠️ STUDENT CONFIGURATION ZONE 🛠️ ---

// 1. IDENTITY:
let pilotName = "ROOKIE_1"; 

// 2. THE BUG: Speed is 60 (Too fast). Change to 8 or 10.
let gameSpeed = 60; 

// 3. THE GATE KEY:
// Decrypt using CyberChef: Base64 -> Hex -> Text
const secureStorage = "NDM1OTQyNDU1MjVmNTM0NTQzNWY0OTUzNWY0MzRmNGY0Yw==";

// ------------------------------------------

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width = canvas.width = document.getElementById('game-wrapper').offsetWidth;
  height = canvas.height = document.getElementById('game-wrapper').offsetHeight;
}
window.addEventListener('resize', resize);
resize();

// Game State
let state = 'MENU'; 
let currentLevel = 1;
let killCount = 0;
let score = 0;
let frame = 0;
let gridOffset = 0;

// Entities
const player = { x: 0, y: 0, size: 24 };
let bullets = [];
let enemies = [];

// Input
canvas.addEventListener('mousemove', (e) => {
  if(state === 'MENU') return;
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left;
  player.y = e.clientY - rect.top;
});

// --- CORE FUNCTIONS ---

function initSystem() {
  document.querySelectorAll('.panel').forEach(el => el.classList.add('hidden'));
  document.getElementById('pilot-display').innerText = pilotName;
  document.body.classList.remove('level-2'); 
  
  currentLevel = 1;
  killCount = 0;
  score = 0;
  bullets = [];
  enemies = [];
  state = 'PLAYING';
  
  player.x = width / 2;
  player.y = height - 100;

  updateHUD();
  loop();
}

function updateHUD() {
  document.getElementById('score-display').innerText = score;
  document.getElementById('level-display').innerText = currentLevel;
}

// --- VISUALS ---

function drawGrid() {
  const color = currentLevel === 1 ? '#00f3ff' : '#ff0000';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  
  let speedMultiplier = state === 'JUMPING' ? 5 : 1;
  gridOffset = (gridOffset + gameSpeed * speedMultiplier) % 40;

  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  
  for(let i=0; i<=width; i+=80) {
      ctx.moveTo(width/2 + (i-width/2)*0.1, height/2 - 50); 
      ctx.lineTo(i - (width/2 - i)*3, height);
  }
  
  for(let i=0; i<height; i+=40) {
      let y = i + gridOffset;
      if (y > height) y -= height;
      if(y > height/2 - 50) { 
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// --- LOGIC ---

function spawnEnemy() {
  const angle = Math.random() * Math.PI * 2;
  const isLevel2 = currentLevel === 2;
  
  enemies.push({
    x: width/2, 
    y: height/2 - 50,
    dx: Math.cos(angle) * (Math.random() * 2 + 1),
    dy: Math.sin(angle) * (Math.random() * 2 + 1) + 2,
    size: 2,
    color: isLevel2 ? '#ff0000' : '#ff0055'
  });
}

function loop() {
  if (state === 'MENU' || state === 'GATE' || state === 'GAMEOVER') return;
  requestAnimationFrame(loop);
  
  ctx.clearRect(0, 0, width, height); 
  drawGrid();
  frame++;

  // Player
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = state === 'JUMPING' ? '#fff' : (currentLevel === 1 ? '#00f3ff' : '#ffaa00');
  ctx.shadowBlur = 15;
  ctx.shadowColor = ctx.fillStyle;
  
  ctx.beginPath();
  ctx.moveTo(0, -player.size);
  ctx.lineTo(player.size, player.size);
  ctx.lineTo(0, player.size - 5);
  ctx.lineTo(-player.size, player.size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Shooting
  if (frame % 8 === 0 && state === 'PLAYING') {
    bullets.push({x: player.x, y: player.y - 20});
  }
  
  ctx.fillStyle = '#fff';
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.y -= 25; 
    ctx.fillRect(b.x - 2, b.y, 4, 15);
    if (b.y < 0) bullets.splice(i, 1);
  }

  // Enemies
  if (state === 'PLAYING') {
      let spawnRate = currentLevel === 1 ? 60 : 30; 
      if (frame % spawnRate === 0) spawnEnemy();
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    let e = enemies[i];
    e.x += e.dx * (gameSpeed * 0.15); 
    e.y += e.dy * (gameSpeed * 0.15); 
    e.size += 0.15;

    ctx.fillStyle = e.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = e.color;
    ctx.fillRect(e.x - e.size, e.y - e.size, e.size*2, e.size*2);
    ctx.shadowBlur = 0;

    for (let j = bullets.length - 1; j >= 0; j--) {
        let b = bullets[j];
        if (Math.abs(b.x - e.x) < e.size + 5 && Math.abs(b.y - e.y) < e.size + 5) {
            enemies.splice(i, 1);
            bullets.splice(j, 1);
            score += 100;
            killCount++;
            updateHUD();
            
            if(killCount === 20 && currentLevel === 1) {
                triggerGate();
            }
            break;
        }
    }

    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    if (dist < player.size + e.size && state === 'PLAYING') {
       state = 'GAMEOVER';
       document.getElementById('final-score').innerText = score;
       document.getElementById('game-over').classList.remove('hidden');
    }
  }
}

function triggerGate() {
    state = 'GATE';
    document.getElementById('level-gate').classList.remove('hidden');
}

window.attemptHyperJump = function() {
    const input = document.getElementById('gate-pass').value;
    const hexString = atob(secureStorage); 
    let decryptedPassword = "";
    for (let i = 0; i < hexString.length; i += 2) {
        decryptedPassword += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
    }

    if (input === decryptedPassword) {
        document.getElementById('level-gate').classList.add('hidden');
        startHyperJump();
    } else {
        document.getElementById('gate-msg').innerText = "COORDINATES INVALID";
        document.getElementById('gate-msg').style.color = "red";
    }
};

function startHyperJump() {
    state = 'JUMPING';
    enemies = []; 
    document.body.classList.add('level-2'); 
    
    setTimeout(() => {
        state = 'PLAYING';
        currentLevel = 2;
        killCount = 0; 
        updateHUD();
    }, 2000);
    
    loop();
}
