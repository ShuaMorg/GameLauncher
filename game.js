const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const popSound = document.getElementById('popSound');

let balls = [{
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dx: 2,
    dy: 2,
    color: 'red'
}];

let square = {
    x: 50,
    y: 50,
    size: 30,
    speed: 10 // Increase the speed of the square
};

let gameOver = false;
let safePeriod = false;
let ballCreationTimer = null;
let elapsedTime = 0;
let shrinkTimer = null;
let speedIncreaseTimer = null;

document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    switch(event.key) {
        case 'ArrowUp':
            square.y -= square.speed;
            break;
        case 'ArrowDown':
            square.y += square.speed;
            break;
        case 'ArrowLeft':
            square.x -= square.speed;
            break;
        case 'ArrowRight':
            square.x += square.speed;
            break;
    }
});

canvas.addEventListener('click', (event) => {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        const distance = Math.hypot(mouseX - ball.x, mouseY - ball.y);
        if (distance < ball.radius) {
            splitBall(ball, i);
            if (balls.length === 1) {
                startBallCreationTimer();
                startShrinkTimer();
                startSpeedIncreaseTimer();
            }
            break;
        }
    }
});

function splitBall(ball, index) {
    if (ball.radius > 10) {
        const newRadius = ball.radius / 2;
        balls.splice(index, 1);

        balls.push({
            x: ball.x,
            y: ball.y,
            radius: newRadius,
            dx: ball.dx,
            dy: -ball.dy,
            color: ball.color
        });

        balls.push({
            x: ball.x,
            y: ball.y,
            radius: newRadius,
            dx: -ball.dx,
            dy: ball.dy,
            color: ball.color
        });
    }
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function updateBall(ball) {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        popSound.play();
    }

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        popSound.play();
    }
}

function drawSquare() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(square.x, square.y, square.size, square.size);
}

function checkCollision(ball) {
    const distX = Math.abs(ball.x - square.x - square.size / 2);
    const distY = Math.abs(ball.y - square.y - square.size / 2);

    if (distX <= (square.size / 2 + ball.radius) && distY <= (square.size / 2 + ball.radius)) {
        if (ball.color === 'green' && !safePeriod) {
            gameOver = true;
            displayGameOver();
        } else if (ball.color === 'red') {
            ball.color = 'green';
            splitBall(ball, balls.indexOf(ball));
            safePeriod = true;
            setTimeout(() => {
                safePeriod = false;
            }, 2000); // 2 seconds safe period
        }
    }
}

function displayGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('You Lose Mother Fucker!!!', canvas.width / 2, canvas.height / 2);
}

function drawCountdown() {
    const countdown = Math.ceil((5000 - elapsedTime) / 1000);
    ctx.fillStyle = 'black';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Next shrink in: ${countdown} seconds`, canvas.width - 10, 30);
}

function draw() {
    if (gameOver) return;

    elapsedTime += 16; // Increment elapsed time
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
        drawBall(ball);
        updateBall(ball);
        checkCollision(ball);
    });
    drawSquare();
    drawCountdown();
    requestAnimationFrame(draw);
}

function shrinkPlayArea() {
    canvas.width -= 50;
    canvas.height -= 50;
    square.x = Math.min(square.x, canvas.width - square.size);
    square.y = Math.min(square.y, canvas.height - square.size);
}

function startShrinkTimer() {
    shrinkTimer = setInterval(() => {
        shrinkPlayArea();
    }, 5000); // Shrink play area every 5 seconds
}

function stopShrinkTimer() {
    clearInterval(shrinkTimer);
}

function increaseBallSpeed() {
    balls.forEach(ball => {
        if (ball.color === 'green') {
            ball.dx *= 1.1;
            ball.dy *= 1.1;
        }
    });
}

function startSpeedIncreaseTimer() {
    speedIncreaseTimer = setInterval(() => {
        increaseBallSpeed();
    }, 1000); // Increase ball speed every second
}

function stopSpeedIncreaseTimer() {
    clearInterval(speedIncreaseTimer);
}

function createBalls(numBalls) {
    for (let i = 0; i < numBalls; i++) {
        const initialDX = Math.random() * 4 - 2; // Random horizontal velocity
        const initialDY = Math.random() * 4 - 2; // Random vertical velocity

        balls.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 30,
            dx: initialDX,
            dy: initialDY,
            color: 'red'
        });
    }
}

function startBallCreationTimer() {
    ballCreationTimer = setInterval(() => {
        createBalls(balls.length);
    }, 10000); // Create a ball every 10 seconds
}

function stopBallCreationTimer() {
    clearInterval(ballCreationTimer);
}

draw();
