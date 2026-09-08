const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

const WIN_SCORE = 7;

let running = false;
let gameOver = false;
let playerScore = 0;
let cpuScore = 0;

const paddle = {
    width: 14,
    height: 95,
    speed: 7
};

const player = {
    x: 30,
    y: canvas.height / 2 - paddle.height / 2,
    dy: 0
};

const cpu = {
    x: canvas.width - 30 - paddle.width,
    y: canvas.height / 2 - paddle.height / 2
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    dx: 5,
    dy: 3
};

const keys = {
    up: false,
    down: false
};

function resetBall(direction = 1) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    const angle = (Math.random() * 1.2) - 0.6;
    ball.speed = 5;
    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

function resetMatch() {
    playerScore = 0;
    cpuScore = 0;
    gameOver = false;
    player.y = canvas.height / 2 - paddle.height / 2;
    cpu.y = canvas.height / 2 - paddle.height / 2;
    updateScore();
    resetBall(Math.random() > 0.5 ? 1 : -1);
    statusEl.textContent = "Jugando";
    running = true;
}

function updateScore() {
    playerScoreEl.textContent = playerScore;
    cpuScoreEl.textContent = cpuScore;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function update() {
    if (!running || gameOver) return;

    // Jugador
    player.dy = 0;
    if (keys.up) player.dy = -paddle.speed;
    if (keys.down) player.dy = paddle.speed;

    player.y += player.dy;
    player.y = clamp(player.y, 0, canvas.height - paddle.height);

    // CPU: sigue la pelota con una pequeña imperfección
    const cpuCenter = cpu.y + paddle.height / 2;
    const target = ball.y;
    const error = 18;
    const cpuSpeed = 4.35;

    if (target < cpuCenter - error) cpu.y -= cpuSpeed;
    if (target > cpuCenter + error) cpu.y += cpuSpeed;

    cpu.y = clamp(cpu.y, 0, canvas.height - paddle.height);

    // Pelota
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Techo / piso
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.dy *= -1;
        ball.y = clamp(ball.y, ball.radius, canvas.height - ball.radius);
    }

    // Colisión jugador
    if (
        ball.dx < 0 &&
        ball.x - ball.radius <= player.x + paddle.width &&
        ball.x + ball.radius >= player.x &&
        ball.y >= player.y &&
        ball.y <= player.y + paddle.height
    ) {
        bounceFromPaddle(player, 1);
    }

    // Colisión CPU
    if (
        ball.dx > 0 &&
        ball.x + ball.radius >= cpu.x &&
        ball.x - ball.radius <= cpu.x + paddle.width &&
        ball.y >= cpu.y &&
        ball.y <= cpu.y + paddle.height
    ) {
        bounceFromPaddle(cpu, -1);
    }

    // Punto CPU
    if (ball.x + ball.radius < 0) {
        cpuScore++;
        updateScore();
        checkWinner();
        if (!gameOver) resetBall(1);
    }

    // Punto jugador
    if (ball.x - ball.radius > canvas.width) {
        playerScore++;
        updateScore();
        checkWinner();
        if (!gameOver) resetBall(-1);
    }
}

function bounceFromPaddle(targetPaddle, direction) {
    const paddleCenter = targetPaddle.y + paddle.height / 2;
    const relative = (ball.y - paddleCenter) / (paddle.height / 2);

    ball.speed = Math.min(ball.speed + 0.35, 10);
    ball.dx = direction * ball.speed;
    ball.dy = relative * ball.speed * 0.9;

    if (direction > 0) {
        ball.x = targetPaddle.x + paddle.width + ball.radius;
    } else {
        ball.x = targetPaddle.x - ball.radius;
    }
}

function checkWinner() {
    if (playerScore >= WIN_SCORE || cpuScore >= WIN_SCORE) {
        gameOver = true;
        running = false;
        statusEl.textContent =
            playerScore > cpuScore
                ? "🏆 ¡Ganaste!"
                : "🤖 Ganó la CPU";
    }
}

function drawCourt() {
    ctx.fillStyle = "#090b12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Línea central
    ctx.strokeStyle = "rgba(255,255,255,.28)";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 18]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Círculo central
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPaddle(x, y, accent = false) {
    ctx.fillStyle = accent ? "#74d379" : "#d9c9ff";
    ctx.fillRect(x, y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#33b4e7";
    ctx.fill();
}

function draw() {
    drawCourt();
    drawPaddle(player.x, player.y, true);
    drawPaddle(cpu.x, cpu.y, false);
    drawBall();

    if (!running && !gameOver) {
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "700 34px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText("PONG", canvas.width / 2, canvas.height / 2 - 10);

        ctx.font = "18px Segoe UI";
        ctx.fillStyle = "#cfc9dd";
        ctx.fillText("ESPACIO para comenzar", canvas.width / 2, canvas.height / 2 + 30);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "arrowup" || key === "w") {
        keys.up = true;
        e.preventDefault();
    }

    if (key === "arrowdown" || key === "s") {
        keys.down = true;
        e.preventDefault();
    }

    if (e.code === "Space") {
        e.preventDefault();

        if (!running || gameOver) {
            resetMatch();
        }
    }
});

document.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();

    if (key === "arrowup" || key === "w") keys.up = false;
    if (key === "arrowdown" || key === "s") keys.down = false;
});

startBtn.addEventListener("click", resetMatch);

draw();
loop();
