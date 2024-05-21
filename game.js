const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
    }

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
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
        if (ball.color === 'green') {
            gameOver = true;
            displayGameOver();
        } else {
            ball.color = 'green';
            splitBall(ball, balls.indexOf(ball));
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

function draw() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
        drawBall(ball);
        updateBall(ball);
        checkCollision(ball);
    });
    drawSquare();
    requestAnimationFrame(draw);
}

draw();
