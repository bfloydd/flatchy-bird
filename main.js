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
            gravity: 0.2,
            jump: -4.5,
            size: 24
        };
        
        this.pipes = [];
        this.pipeGap = 150;
        this.pipeWidth = 50;
        this.pipeInterval = 2000;
        this.lastPipe = 0;
        
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        this.animationFrame = null;
        this.restartButton = {
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height / 2 + 20,
            width: 100,
            height: 40
        };
        
        this.startButton = {
            x: this.canvas.width / 2 - 50,
            y: this.canvas.height / 2 + 20,
            width: 100,
            height: 40
        };
        
        // Update fire base properties for larger flames
        this.fireBase = {
            flames: Array(20).fill().map((_, i) => ({
                x: i * 18,
                y: this.canvas.height,
                size: Math.random() * 8 + 40,  // Increased base size from 34 to 40
                offset: Math.random() * Math.PI
            }))
        };
        
        // Define boss types and their properties
        this.bossTypes = {
            GHOST: {
                emoji: '👻',
                level: 2,
                size: 40,
                velocity: -1.4,
                projectileEmoji: '☠️'
            },
            SKELETON: {
                emoji: '💀',
                level: 4,
                size: 45,
                velocity: -1.6,
                projectileEmoji: '🦴'
            },
            ANGRY: {
                emoji: '😠',
                level: 6,
                size: 45,
                velocity: -1.8,
                projectileEmoji: '💢'
            },
            DEMON: {
                emoji: '👿',  // Demon face emoji
                level: 8,
                size: 50,     // Slightly larger
                velocity: -2.0, // Slightly faster
                projectileEmoji: '🔥'  // Fire projectiles
            }
        };
        
        // Track all active bosses
        this.bosses = [];
        
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
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            if (this.gameOver) {
                if (clickX >= this.restartButton.x && 
                    clickX <= this.restartButton.x + this.restartButton.width &&
                    clickY >= this.restartButton.y && 
                    clickY <= this.restartButton.y + this.restartButton.height) {
                    this.restart();
                }
            } else if (!this.gameStarted) {
                if (clickX >= this.startButton.x && 
                    clickX <= this.startButton.x + this.startButton.width &&
                    clickY >= this.startButton.y && 
                    clickY <= this.startButton.y + this.startButton.height) {
                    handleInput();
                }
            } else {
                handleInput();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                if (this.gameOver) {
                    this.restart();
                } else if (!this.gameStarted) {
                    handleInput();
                } else {
                    handleInput();
                }
            }
        });
    }
    
    restart() {
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 24
        };
        this.pipes = [];
        this.lastPipe = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        this.bosses = []; // Clear all bosses
        
        this.gameLoop();
    }
    
    update() {
        if (!this.gameStarted || this.gameOver) return;
        
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
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
        
        this.pipes.forEach(pipe => {
            pipe.x -= 1.8;
            
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
            
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                this.score++;
                pipe.scored = true;
            }
        });
        
        this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
        
        if (this.bird.y > this.canvas.height - this.bird.size) {
            this.gameOver = true;
            this.bird.y = this.canvas.height - this.bird.size;
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Update flame positions
        if (!this.gameOver && this.gameStarted) {
            this.fireBase.flames.forEach(flame => {
                flame.x -= 1.2;
                if (flame.x < -20) {
                    flame.x = this.canvas.width + 20;
                    flame.size = Math.random() * 10 + 25;
                    flame.offset = Math.random() * Math.PI;
                }
            });
        }
        
        // Update bosses
        Object.values(this.bossTypes).forEach(bossType => {
            if (this.score >= bossType.level) {
                // Check if this boss type already exists
                const existingBoss = this.bosses.find(b => b.type === bossType);
                if (!existingBoss) {
                    // Create new boss
                    this.bosses.push({
                        type: bossType,
                        active: true,
                        x: this.canvas.width,
                        y: this.canvas.height,
                        size: bossType.size,
                        velocity: bossType.velocity,
                        projectiles: [],
                        shootCooldown: 120,
                        maxShots: 3,
                        emergingFromFire: true,
                        emergenceProgress: 0
                    });
                }
            }
        });
        
        // Update all active bosses
        this.bosses.forEach(boss => {
            if (boss.emergingFromFire) {
                boss.emergenceProgress += 0.02;
                boss.y = this.canvas.height - (80 * boss.emergenceProgress);
                
                if (boss.emergenceProgress >= 1) {
                    boss.emergingFromFire = false;
                    boss.y = this.canvas.height - 80;
                }
            } else {
                // Move boss
                boss.x += boss.velocity;
                
                // Boss shooting logic
                if (boss.shootCooldown <= 0 && boss.maxShots > 0) {
                    // Calculate direction and miss vector (same as before)
                    const dirX = this.bird.x - boss.x;
                    const dirY = this.bird.y - boss.y;
                    
                    const perpX = -dirY;
                    const perpY = dirX;
                    
                    const length = Math.sqrt(perpX * perpX + perpY * perpY);
                    const missDistance = 150;
                    const missX = (perpX / length) * missDistance;
                    const missY = (perpY / length) * missDistance;
                    
                    boss.projectiles.push({
                        x: boss.x,
                        y: boss.y,
                        size: 15,
                        velocity: {
                            x: (this.bird.x + missX - boss.x) / 100,
                            y: (this.bird.y + missY - boss.y) / 100
                        }
                    });
                    boss.maxShots--;
                    boss.shootCooldown = 90;
                }
                
                if (boss.shootCooldown > 0) {
                    boss.shootCooldown--;
                }
            }
            
            // Update projectiles for this boss
            boss.projectiles.forEach(projectile => {
                projectile.x += projectile.velocity.x;
                projectile.y += projectile.velocity.y;
                
                const distance = Math.hypot(
                    projectile.x - (this.bird.x + this.bird.size/2),
                    projectile.y - (this.bird.y + this.bird.size/2)
                );
                
                if (distance < (this.bird.size/2 + projectile.size/2)) {
                    this.gameOver = true;
                }
            });
            
            // Remove off-screen projectiles
            boss.projectiles = boss.projectiles.filter(projectile => 
                projectile.x > -projectile.size && 
                projectile.x < this.canvas.width + projectile.size &&
                projectile.y > -projectile.size && 
                projectile.y < this.canvas.height + projectile.size
            );
        });
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
        this.ctx.fillStyle = '#70c5ce';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Only draw the skull and flames if game has started
        if (this.gameStarted) {
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            
            let rotation = 0;
            if (this.bird.velocity < 0) {
                rotation = -0.3;
            } else if (this.bird.velocity > 0) {
                rotation = 0.3;
            }
            
            // Draw flames behind skull
            this.ctx.save();
            if (this.bird.velocity < 0) {
                // Multiple flames trailing when moving up
                this.ctx.translate(-this.bird.size/2, this.bird.size/4);
                this.ctx.rotate(-0.3);
                this.ctx.font = '25px Arial';
                this.ctx.fillText('🔥', 0, 0);
                this.ctx.font = '20px Arial';
                this.ctx.fillText('🔥', -15, 0);
                this.ctx.font = '18px Arial';
                this.ctx.fillText('🔥', -25, 0);
            } else {
                // Multiple flames trailing when moving down
                this.ctx.translate(-this.bird.size/2, -this.bird.size/4);
                this.ctx.rotate(0.3);
                this.ctx.font = '25px Arial';
                this.ctx.fillText('🔥', 0, 0);
                this.ctx.font = '20px Arial';
                this.ctx.fillText('🔥', -15, 0);
                this.ctx.font = '18px Arial';
                this.ctx.fillText('🔥', -25, 0);
            }
            this.ctx.restore();
            
            // Draw skull with rotation
            this.ctx.rotate(rotation);
            this.ctx.font = '30px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💀', 0, 0);
            this.ctx.restore();
        }
        
        this.ctx.fillStyle = '#2ecc71';
        this.pipes.forEach(pipe => {
            // Main log color - lighter brown
            this.ctx.fillStyle = '#A67B5B'; // Changed from #8B4513 to a lighter brown
            
            // Draw main logs
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.y);
            this.ctx.fillRect(
                pipe.x,
                pipe.y + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.y + this.pipeGap)
            );
            
            // Add wood texture rings - lighter accent color
            this.ctx.fillStyle = '#C19A6B'; // Changed from #A0522D to a lighter accent
            for (let i = 0; i < pipe.y; i += 30) {
                this.ctx.fillRect(pipe.x, i, this.pipeWidth, 5);
            }
            for (let i = pipe.y + this.pipeGap; i < this.canvas.height; i += 30) {
                this.ctx.fillRect(pipe.x, i, this.pipeWidth, 5);
            }
            
            // Add darker edges for depth - slightly lighter edge color
            this.ctx.fillStyle = '#8B7355'; // Changed from #654321 to a lighter edge color
            this.ctx.fillRect(pipe.x, 0, 5, pipe.y);
            this.ctx.fillRect(pipe.x + this.pipeWidth - 5, 0, 5, pipe.y);
            this.ctx.fillRect(pipe.x, pipe.y + this.pipeGap, 5, this.canvas.height - (pipe.y + this.pipeGap));
            this.ctx.fillRect(pipe.x + this.pipeWidth - 5, pipe.y + this.pipeGap, 5, this.canvas.height - (pipe.y + this.pipeGap));
        });
        
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(`${this.score}`, this.canvas.width / 2, 50);
            this.ctx.fillText(`${this.score}`, this.canvas.width / 2, 50);
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 3);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                `Final Score: ${this.score}`,
                this.canvas.width / 2,
                this.canvas.height / 3 + 40
            );
            
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(
                this.restartButton.x,
                this.restartButton.y,
                this.restartButton.width,
                this.restartButton.height
            );
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                'Restart',
                this.canvas.width / 2,
                this.restartButton.y + this.restartButton.height/2
            );
        }
        
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw title with flame and skull emojis
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Draw shadow for main title
            this.ctx.fillStyle = '#ff4d4d';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.fillText('FLAMING', this.canvas.width / 2 + 2, 140 + 2);
            this.ctx.fillText('BIRD SKULL', this.canvas.width / 2 + 2, 180 + 2);
            
            // Draw main title with gradient
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 40px Arial';
            this.ctx.fillText('FLAMING', this.canvas.width / 2, 140);
            this.ctx.fillText('BIRD SKULL', this.canvas.width / 2, 180);
            
            // Add flame and skull decorations
            this.ctx.font = '30px Arial';
            this.ctx.fillText('🔥 💀 🔥', this.canvas.width / 2, 220);
            
            // Draw start button
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fillRect(
                this.startButton.x,
                this.startButton.y,
                this.startButton.width,
                this.startButton.height
            );
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                'Start',
                this.canvas.width / 2,
                this.startButton.y + this.startButton.height/2
            );
        }
        
        // Draw fire base (add this before the game over/start screen overlays)
        this.drawFireBase();
        
        // Draw all bosses and their projectiles
        this.bosses.forEach(boss => {
            if (boss.active && this.gameStarted && !this.gameOver) {
                this.ctx.font = `${boss.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                if (boss.emergingFromFire) {
                    this.ctx.save();
                    this.ctx.shadowColor = '#ff4400';
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowOffsetX = 0;
                    this.ctx.shadowOffsetY = 0;
                }
                
                this.ctx.fillText(boss.type.emoji, boss.x, boss.y);
                
                if (boss.emergingFromFire) {
                    this.ctx.restore();
                }
                
                // Draw projectiles
                this.ctx.font = '15px Arial';
                boss.projectiles.forEach(projectile => {
                    this.ctx.fillText(boss.type.projectileEmoji, projectile.x, projectile.y);
                });
            }
        });
    }
    
    drawFireBase() {
        // Only draw fire if game has started
        if (!this.gameStarted) return;
        
        // Draw continuous flames
        this.fireBase.flames.forEach((flame, i) => {
            this.ctx.save();
            this.ctx.translate(flame.x, this.canvas.height + 10); // Move flames slightly below bottom edge
            
            // Minimal animation to prevent gaps
            const time = Date.now() / 1000;
            const sizeOffset = Math.sin(time + flame.offset) * 2;
            const yOffset = Math.cos(time + flame.offset) * 1;
            
            this.ctx.font = `${flame.size + sizeOffset}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText('🔥', 0, yOffset);
            
            this.ctx.restore();
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        if (!this.gameOver) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
} 