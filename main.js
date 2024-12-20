class FlappyBird {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 480;
        
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.5,
            jump: -8,
            size: 20
        };
        
        this.pipes = [];
        this.pipeGap = 130;
        this.pipeWidth = 50;
        this.pipeInterval = 1500;
        this.lastPipe = 0;
        
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        this.bindEvents();
        this.init();
    }
    
    init() {
        document.body.appendChild(this.canvas);
        this.gameLoop();
    }
    
    bindEvents() {
        const handleInput = () => {
            if (!this.gameStarted) {
                this.gameStarted = true;
            }
            if (!this.gameOver) {
                this.bird.velocity = this.bird.jump;
            }
        };
        
        this.canvas.addEventListener('click', handleInput);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') handleInput();
        });
    }
    
    update() {
        if (!this.gameStarted) return;
        
        // Update bird
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Generate pipes
        const now = Date.now();
        if (now - this.lastPipe > this.pipeInterval) {
            const pipeY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                y: pipeY,
                scored: false
            });
            this.lastPipe = now;
        }
        
        // Update pipes
        this.pipes.forEach(pipe => {
            pipe.x -= 2;
            
            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
            
            // Update score
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                this.score++;
                pipe.scored = true;
            }
        });
        
        // Remove off-screen pipes
        this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
        
        // Check ground collision
        if (this.bird.y > this.canvas.height - this.bird.size) {
            this.gameOver = true;
            this.bird.y = this.canvas.height - this.bird.size;
        }
    }
    
    checkCollision(pipe) {
        const birdBox = {
            left: this.bird.x,
            right: this.bird.x + this.bird.size,
            top: this.bird.y,
            bottom: this.bird.y + this.bird.size
        };
        
        const topPipeBox = {
            left: pipe.x,
            right: pipe.x + this.pipeWidth,
            top: 0,
            bottom: pipe.y
        };
        
        const bottomPipeBox = {
            left: pipe.x,
            right: pipe.x + this.pipeWidth,
            top: pipe.y + this.pipeGap,
            bottom: this.canvas.height
        };
        
        return this.checkBoxCollision(birdBox, topPipeBox) || 
               this.checkBoxCollision(birdBox, bottomPipeBox);
    }
    
    checkBoxCollision(box1, box2) {
        return box1.left < box2.right &&
               box1.right > box2.left &&
               box1.top < box2.bottom &&
               box1.bottom > box2.top;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#70c5ce';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pipes
        this.ctx.fillStyle = '#2ecc71';
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.y);
            // Bottom pipe
            this.ctx.fillRect(
                pipe.x,
                pipe.y + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.y + this.pipeGap)
            );
        });
        
        // Draw bird
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(
            this.bird.x,
            this.bird.y,
            this.bird.size,
            this.bird.size
        );
        
        // Draw score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                `Final Score: ${this.score}`,
                this.canvas.width / 2,
                this.canvas.height / 2 + 40
            );
        }
        
        // Draw start message
        if (!this.gameStarted) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Click or Press Space to Start',
                this.canvas.width / 2,
                this.canvas.height / 2
            );
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
} 