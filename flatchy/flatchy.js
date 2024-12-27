class FlappyBird {
    constructor() {
        // Add bird sprite image and animation properties
        this.birdSprite = new Image();
        this.birdSprite.onload = () => {
            console.log('Sprite loaded:', this.birdSprite.width, 'x', this.birdSprite.height);
            this.spriteLoaded = true;
            // Update frame dimensions based on actual sprite sheet
            this.spriteAnimation.frameWidth = this.birdSprite.width / this.spriteAnimation.framesPerRow;
            this.spriteAnimation.frameHeight = this.birdSprite.height / 2; // 2 rows
            console.log('Frame size:', this.spriteAnimation.frameWidth, 'x', this.spriteAnimation.frameHeight);
            this.init(); // Initialize game once sprite is loaded
        };
        this.birdSprite.onerror = (e) => {
            console.error('Error loading sprite:', e);
        };
        this.birdSprite.src = 'flatchy/flatchy_flap_sprite.png';
        this.spriteLoaded = false;
        this.spriteAnimation = {
            frameWidth: 8,      // Will be updated when sprite loads
            frameHeight: 8,     // Will be updated when sprite loads
            totalFrames: 12,    // The sprite sheet shows 12 frames
            framesPerRow: 6,    // Organized as 2 rows of 6 frames
            currentFrame: 0,
            frameTimer: 0,
            frameInterval: 100,  // Animation speed
            lastFrameTime: 0
        };
        
        // Add starting level configuration
        this.startingLevel = 10; // Can be modified for testing different levels
        this.speedIncreasePerLevel = 0.5; // 50% increase per level, can be modified
        this.pillarSpaceIncreasePerLevel = .05; // Increase pillar spacing per level
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize game properties
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 48  // Increased from 24 to 48 for better visibility
        };
        
        this.baseSpeed = 1.8; // Base speed for pipes and game elements
        // Set initial speed based on starting level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.pipes = [];
        this.pipeWidth = 50;
        this.pipeGap = 150;
        this.pipeInterval = 2000;
        this.lastPipe = 0;
        
        this.score = 0;
        this.totalPoints = 0;  // Track total points across all levels
        this.gameStarted = false;
        this.gameOver = false;
        
        // Add start button
        this.startButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 50,
            width: 200,
            height: 50
        };
        
        // Add restart button
        this.restartButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 50,
            width: 200,
            height: 50
        };
        
        // Add fire base properties
        this.fireBase = {
            flames: Array(20).fill().map((_, i) => ({
                x: i * (this.canvas.width / 19),
                size: Math.random() * 10 + 30,
                offset: Math.random() * Math.PI
            }))
        };
        
        // Track all active bosses
        this.bosses = [];
        
        // Add victory state and continue button
        this.levelComplete = false;
        this.continueButton = {
            x: this.canvas.width / 2 - 150,
            y: this.canvas.height / 2 + 100,
            width: 300,
            height: 60
        };
        
        // Add flash effect properties
        this.flashEffect = {
            active: false,
            duration: 60,  // frames
            currentFrame: 0,
            colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00']
        };
        
        // Add level tracking - initialize to starting level
        this.currentLevel = this.startingLevel;
        
        // Add dungeon background properties
        this.background = {
            torches: Array(4).fill().map((_, i) => ({
                x: i * (this.canvas.width / 3),
                y: 60 + (i % 2) * 30,
                flameOffset: Math.random() * Math.PI
            }))
        };
        
        // Define boss types with increasing difficulty
        this.bossTypes = {
            GHOST: {
                emoji: '👻',
                size: 40,
                projectileEmoji: '☠️',
                projectileSize: 15
            },
            DEMON: {
                emoji: '👿',
                size: 45,
                projectileEmoji: '🔥',
                projectileSize: 18
            },
            SKULL: {
                emoji: '💀',
                size: 50,
                projectileEmoji: '🦴',
                projectileSize: 20
            }
        };
        
        // Track if boss has appeared for current level
        this.bossHasAppeared = false;
        
        // Add boss shooting timer
        this.bossShootTimer = {
            lastShot: 0,
            minInterval: 3000  // Minimum 3 seconds between shots
        };
        
        this.bindEvents();
        this.init();
    }
    
    init() {
        // Don't initialize boss immediately
        this.bosses = [];
        this.bossHasAppeared = false;
        
        // Ensure speed is set correctly for starting level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.gameLoop();
    }
    
    bindEvents() {
        const handleInput = () => {
            if (!this.spriteLoaded) return; // Don't start if sprite isn't loaded
            if (!this.gameStarted) {
                this.gameStarted = true;
            }
            this.bird.velocity = this.bird.jump;
        };
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            if (this.levelComplete) {
                if (clickX >= this.continueButton.x && 
                    clickX <= this.continueButton.x + this.continueButton.width &&
                    clickY >= this.continueButton.y && 
                    clickY <= this.continueButton.y + this.continueButton.height) {
                    // Start next level with increased difficulty
                    this.startLevel(this.currentLevel + 1);
                }
            } else if (this.gameOver) {
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
                if (this.levelComplete) {
                    // Start next level with increased difficulty
                    this.startLevel(this.currentLevel + 1);
                } else if (this.gameOver) {
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
            size: 48  // Match constructor size
        };
        this.pipes = [];
        this.lastPipe = 0;
        this.score = 0;
        this.totalPoints = 0;  // Reset total points on full restart
        this.gameStarted = false;
        this.gameOver = false;
        
        this.bosses = [];
        this.bossHasAppeared = false;
        
        this.levelComplete = false;
        
        // Reset to starting level first
        this.currentLevel = this.startingLevel;
        
        // Then set speed based on the starting level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.background.torches.forEach(torch => {
            torch.flameOffset = Math.random() * Math.PI;
        });
        
        this.gameLoop();
    }
    
    update() {
        if (!this.gameStarted || this.gameOver || this.levelComplete) return;
        
        // Update sprite animation
        const currentTime = Date.now();
        if (currentTime - this.spriteAnimation.lastFrameTime > this.spriteAnimation.frameInterval) {
            this.spriteAnimation.currentFrame = (this.spriteAnimation.currentFrame + 1) % this.spriteAnimation.totalFrames;
            this.spriteAnimation.lastFrameTime = currentTime;
        }

        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        const now = Date.now();
        
        // Calculate how many unscored pipes are currently in play
        const unscoredPipes = this.pipes.filter(pipe => !pipe.scored).length;
        
        // Adjust pipe interval based on current speed and spacing increase
        const adjustedPipeInterval = 2000 / (1 + (this.currentLevel - 1) * this.pillarSpaceIncreasePerLevel);
        
        // Only generate new pipes if we need more to reach 10 points
        if (now - this.lastPipe > adjustedPipeInterval && (unscoredPipes + this.score) < 10) {
            const pipeY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                y: pipeY,
                scored: false
            });
            this.lastPipe = now;
        }
        
        // Update pipes with current speed
        this.pipes.forEach(pipe => {
            pipe.x -= this.currentSpeed;
            
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
            
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                this.score++;
                this.totalPoints++;  // Increment total points when scoring
                pipe.scored = true;

                // Spawn boss when reaching 5 points if it hasn't appeared yet
                if (this.score === 5 && !this.bossHasAppeared) {
                    const bossTypes = [this.bossTypes.GHOST, this.bossTypes.DEMON, this.bossTypes.SKULL];
                    const bossIndex = (this.currentLevel - 1) % bossTypes.length;
                    const bossType = bossTypes[bossIndex];
                    
                    // Randomly choose entrance direction
                    const entrances = ['bottom', 'top', 'right'];
                    const entrance = entrances[Math.floor(Math.random() * entrances.length)];
                    
                    let startX, startY;
                    switch(entrance) {
                        case 'bottom':
                            startX = this.canvas.width - 100;
                            startY = this.canvas.height + 50;
                            break;
                        case 'top':
                            startX = this.canvas.width - 100;
                            startY = -50;
                            break;
                        case 'right':
                            startX = this.canvas.width + 50;
                            startY = this.canvas.height / 2;
                            break;
                    }
                    
                    this.bosses.push({
                        x: startX,
                        y: startY,
                        targetX: this.canvas.width - 100,
                        targetY: this.canvas.height / 2,
                        baseY: this.canvas.height / 2,
                        type: bossType,
                        projectiles: [],
                        entrance: entrance,
                        entranceProgress: 0
                    });
                    this.bossHasAppeared = true;
                }
            }
        });
        
        this.pipes = this.pipes.filter(pipe => pipe.x > -this.pipeWidth);
        
        if (this.bird.y > this.canvas.height - this.bird.size || this.bird.y < 0) {
            this.gameOver = true;
            this.bird.y = Math.max(0, Math.min(this.bird.y, this.canvas.height - this.bird.size));
        }
        
        // Update flame positions with current speed
        if (!this.gameOver && this.gameStarted) {
            this.fireBase.flames.forEach(flame => {
                flame.x -= this.currentSpeed * 0.67;
                if (flame.x < -20) {
                    flame.x = this.canvas.width + 20;
                    flame.size = Math.random() * 10 + 25;
                    flame.offset = Math.random() * Math.PI;
                }
            });
        }
        
        // Update bosses with increased difficulty per level
        this.bosses.forEach(boss => {
            // Handle entrance animation
            if (boss.entranceProgress < 1) {
                boss.entranceProgress += 0.02;
                const easing = 1 - Math.pow(1 - boss.entranceProgress, 3);
                boss.x = boss.x + (boss.targetX - boss.x) * easing;
                boss.y = boss.y + (boss.targetY - boss.y) * easing;
                return;
            }

            // Scale boss speed with current level (reduced scaling)
            const bossSpeed = this.currentSpeed * (1 + (this.currentLevel - 1) * 0.03);
            
            // Keep boss in the right half of the screen
            if (boss.x < this.canvas.width / 2) {
                boss.x = this.canvas.width / 2;
            }
            
            // Boss movement pattern (slower movement)
            boss.x -= bossSpeed * 0.2;
            if (boss.x < this.canvas.width / 2) boss.x = this.canvas.width - 50;
            
            // More complex movement pattern based on level (reduced amplitude)
            const timeScale = 1 + (this.currentLevel - 1) * 0.05;
            
            // Limit vertical movement to middle 60% of screen
            const maxVerticalDistance = this.canvas.height * 0.3;
            const centerY = this.canvas.height / 2;
            const verticalOffset = Math.sin(Date.now() / 1000 * timeScale) * (30 + this.currentLevel * 2);
            boss.y = centerY + Math.max(-maxVerticalDistance, Math.min(maxVerticalDistance, verticalOffset));
            
            // Check collision with boss
            const distance = Math.hypot(
                boss.x - (this.bird.x + this.bird.size/2),
                boss.y - (this.bird.y + this.bird.size/2)
            );
            if (distance < (this.bird.size/2 + boss.type.size/2)) {
                this.gameOver = true;
            }
            
            // Ensure at least one shot every few seconds
            const timeSinceLastShot = now - this.bossShootTimer.lastShot;
            const shouldForceShot = timeSinceLastShot > this.bossShootTimer.minInterval;
            
            // Either force a shot after the interval or use random chance
            if (shouldForceShot || Math.random() < 0.003 * (1 + (this.currentLevel - 1) * 0.05)) {
                const angle = Math.atan2(
                    this.bird.y - boss.y,
                    this.bird.x - boss.x
                );
                
                const projectileSpeed = 1.5 * (1 + (this.currentLevel - 1) * 0.08);
                
                boss.projectiles.push({
                    x: boss.x,
                    y: boss.y,
                    size: boss.type.projectileSize,
                    emoji: boss.type.projectileEmoji,
                    velocity: {
                        x: Math.cos(angle) * projectileSpeed,
                        y: Math.sin(angle) * projectileSpeed
                    }
                });
                
                this.bossShootTimer.lastShot = now;
            }
            
            // Update projectiles
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
        
        // Check for level completion
        if (this.score >= 10) {
            if (!this.levelComplete) {
                this.levelComplete = true;
                this.flashEffect.active = true;
                cancelAnimationFrame(this.animationFrame);
            }
            
            // Update flash effect
            if (this.flashEffect.active) {
                this.flashEffect.currentFrame++;
                if (this.flashEffect.currentFrame >= this.flashEffect.duration) {
                    this.flashEffect.active = false;
                }
            }
        }
    }
    
    // Add new method for level management with infinite progression
    startLevel(levelNumber) {
        this.currentLevel = levelNumber;
        
        // Reset game state for new level but keep total points
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 48  // Match constructor size
        };
        this.pipes = [];
        this.lastPipe = 0;
        this.score = 0;  // Reset level score only
        this.gameStarted = true;
        this.gameOver = false;
        this.levelComplete = false;
        
        // Clear existing bosses and reset boss appearance flag
        this.bosses = [];
        this.bossHasAppeared = false;
        
        // Reset flash effect
        this.flashEffect.active = false;
        this.flashEffect.currentFrame = 0;
        
        // Start the game loop
        cancelAnimationFrame(this.animationFrame);
        this.gameLoop();
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
        // Don't draw anything if sprite isn't loaded
        if (!this.spriteLoaded) return;
        
        // Replace sky blue background with dungeon background
        // Draw dark stone wall background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');    // Very dark at top
        gradient.addColorStop(0.5, '#2d2d2d');  // Slightly lighter in middle
        gradient.addColorStop(1, '#1a1a1a');    // Dark at bottom
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stone wall pattern
        this.ctx.fillStyle = '#333333';
        for (let y = 0; y < this.canvas.height; y += 40) {
            for (let x = 0; x < this.canvas.width; x += 60) {
                // Draw brick pattern
                this.ctx.fillRect(x, y, 58, 38);
                
                // Add some random darker spots for texture
                if (Math.random() < 0.3) {
                    this.ctx.fillStyle = '#2b2b2b';
                    this.ctx.fillRect(
                        x + Math.random() * 30,
                        y + Math.random() * 20,
                        10,
                        10
                    );
                    this.ctx.fillStyle = '#333333';
                }
            }
        }
        
        // Draw wall torches
        this.background.torches.forEach(torch => {
            // Draw sconce
            this.ctx.save();
            
            // Draw metal sconce base
            this.ctx.fillStyle = '#4a4a4a';
            this.ctx.beginPath();
            this.ctx.moveTo(torch.x - 12, torch.y);
            this.ctx.lineTo(torch.x + 12, torch.y);
            this.ctx.lineTo(torch.x + 8, torch.y + 25);
            this.ctx.lineTo(torch.x - 8, torch.y + 25);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add metallic highlights
            this.ctx.fillStyle = '#5a5a5a';
            this.ctx.fillRect(torch.x - 10, torch.y + 2, 20, 3);
            
            // Draw torch stick
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(torch.x - 3, torch.y - 15, 6, 20);
            
            // Draw flame with localized glow
            const time = Date.now() / 1000;
            const flameY = torch.y - 20 + Math.sin(time + torch.flameOffset) * 1.5; // Reduced movement
            
            // Draw glow
            const gradient = this.ctx.createRadialGradient(
                torch.x, flameY, 5,
                torch.x, flameY, 30
            );
            gradient.addColorStop(0, 'rgba(255, 68, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 68, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(torch.x, flameY, 30, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw flame
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔥', torch.x, flameY);
            
            this.ctx.restore();
        });
        
        // Only draw the bird and flames if game has started
        if (this.gameStarted) {
            this.ctx.save();
            
            // Calculate rotation based on velocity (reduced rotation amount)
            let rotation = 0;
            if (this.bird.velocity < 0) {
                rotation = -0.2;  // Reduced from -0.3
            } else if (this.bird.velocity > 0) {
                rotation = 0.2;   // Reduced from 0.3
            }
            
            // Draw flames behind bird
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            
            // Draw three flames in a horizontal line with decreasing sizes
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Largest flame nearest to bird
            this.ctx.font = '18px Arial';
            this.ctx.fillText('🔥', -20, 0);
            
            // Medium flame in middle
            this.ctx.font = '14px Arial';
            this.ctx.fillText('🔥', -32, 0);
            
            // Smallest flame farthest from bird
            this.ctx.font = '12px Arial';
            this.ctx.fillText('🔥', -42, 0);
            
            this.ctx.restore();
            
            // Draw bird sprite
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            
            // Calculate the row and column in the sprite sheet
            const column = this.spriteAnimation.currentFrame % this.spriteAnimation.framesPerRow;
            const row = Math.floor(this.spriteAnimation.currentFrame / this.spriteAnimation.framesPerRow);
            
            // Draw the bird with proper scaling
            this.ctx.drawImage(
                this.birdSprite,
                column * this.spriteAnimation.frameWidth,    // Source X
                row * this.spriteAnimation.frameHeight,      // Source Y
                this.spriteAnimation.frameWidth,             // Source width
                this.spriteAnimation.frameHeight,            // Source height
                -this.bird.size/2,                          // Destination X
                -this.bird.size/2,                          // Destination Y
                this.bird.size,                             // Destination width
                this.bird.size                              // Destination height
            );
            
            this.ctx.restore();
            this.ctx.restore();
        }
        
        this.ctx.fillStyle = '#2ecc71';
        this.pipes.forEach(pipe => {
            // Dark stone color for main pillar
            this.ctx.fillStyle = '#2C2F33';  // Dark slate color
            
            // Draw main pillars
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.y);
            this.ctx.fillRect(
                pipe.x,
                pipe.y + this.pipeGap,
                this.pipeWidth,
                this.canvas.height - (pipe.y + this.pipeGap)
            );
            
            // Add stone texture and highlights
            this.ctx.fillStyle = '#23272A';  // Darker shade for depth
            for (let i = 0; i < pipe.y; i += 40) {
                this.ctx.fillRect(pipe.x, i, this.pipeWidth, 2);  // Horizontal stone lines
            }
            for (let i = pipe.y + this.pipeGap; i < this.canvas.height; i += 40) {
                this.ctx.fillRect(pipe.x, i, this.pipeWidth, 2);
            }
            
            // Add stone brick pattern
            this.ctx.fillStyle = '#202225';  // Even darker for cracks
            for (let i = 0; i < pipe.y; i += 80) {
                this.ctx.fillRect(pipe.x + this.pipeWidth/3, i, 2, 40);  // Vertical cracks
                this.ctx.fillRect(pipe.x + (this.pipeWidth*2/3), i + 40, 2, 40);
            }
            for (let i = pipe.y + this.pipeGap; i < this.canvas.height; i += 80) {
                this.ctx.fillRect(pipe.x + this.pipeWidth/3, i, 2, 40);
                this.ctx.fillRect(pipe.x + (this.pipeWidth*2/3), i + 40, 2, 40);
            }
            
            // Add chains on the sides
            this.ctx.fillStyle = '#4A4D50';  // Metal color
            // Left chain
            for (let i = 0; i < pipe.y; i += 20) {
                this.ctx.fillRect(pipe.x - 8, i, 4, 10);  // Chain links
            }
            for (let i = pipe.y + this.pipeGap; i < this.canvas.height; i += 20) {
                this.ctx.fillRect(pipe.x - 8, i, 4, 10);
            }
            // Right chain
            for (let i = 10; i < pipe.y; i += 20) {
                this.ctx.fillRect(pipe.x + this.pipeWidth + 4, i, 4, 10);
            }
            for (let i = pipe.y + this.pipeGap + 10; i < this.canvas.height; i += 20) {
                this.ctx.fillRect(pipe.x + this.pipeWidth + 4, i, 4, 10);
            }
            
            // Add highlights
            this.ctx.fillStyle = '#36393F';  // Lighter shade for edge highlight
            this.ctx.fillRect(pipe.x, 0, 3, pipe.y);
            this.ctx.fillRect(pipe.x, pipe.y + this.pipeGap, 3, this.canvas.height - (pipe.y + this.pipeGap));
        });
        
        if (this.gameStarted && !this.gameOver) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(`${this.score}`, this.canvas.width / 2, 50);
            this.ctx.fillText(`${this.score}`, this.canvas.width / 2, 50);

            // Draw level counter in top right
            this.ctx.textAlign = 'right';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.strokeText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);
            this.ctx.fillText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);

            // Draw total points in top left
            this.ctx.textAlign = 'left';
            this.ctx.strokeText(`Total: ${this.totalPoints}`, 20, 40);
            this.ctx.fillText(`Total: ${this.totalPoints}`, 20, 40);
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw scary text with effects
            this.ctx.save();
            
            // Add dripping blood effect
            const bloodDrops = '🩸'.repeat(15);
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#FF0000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(bloodDrops, this.canvas.width / 2, 30);
            
            // Main text with shadow and glow
            this.ctx.shadowColor = '#FF0000';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Glitch effect
            const glitchOffset = Math.random() * 5 - 2.5;
            
            // Red layer
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 43px Arial';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 - 40);
            
            // Main layer
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 42px Arial';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 3 - 40);
            
            // Calculate final score
            const finalScore = this.currentLevel * this.totalPoints;
            
            // Score text with skull decorations
            this.ctx.fillText(`SCORE: ${finalScore}`, this.canvas.width / 2, this.canvas.height / 3 + 20);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`(Level ${this.currentLevel} × ${this.totalPoints} points)`, this.canvas.width / 2, this.canvas.height / 3 + 50);
            this.ctx.font = '30px Arial';
            this.ctx.fillText('💀 💀 💀', this.canvas.width / 2, this.canvas.height / 3 + 90);
            
            this.ctx.restore();
            
            // Draw restart button with spooky styling
            this.drawDungeonButton(
                this.restartButton.x,
                this.restartButton.y,
                this.restartButton.width,
                this.restartButton.height,
                'Restart'
            );
        }
        
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw title with effects
            this.ctx.save();
            
            // Main text with shadow and glow
            this.ctx.shadowColor = '#FF0000';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Glitch effect
            const glitchOffset = Math.random() * 5 - 2.5;
            
            // Red layer
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 43px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('FLAMING', this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 - 40);
            this.ctx.fillText('BIRD SKULL', this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 + 10);
            
            // Main layer
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 42px Arial';
            this.ctx.fillText('FLAMING', this.canvas.width / 2, this.canvas.height / 3 - 40);
            this.ctx.fillText('BIRD SKULL', this.canvas.width / 2, this.canvas.height / 3 + 10);
            
            // Add flame and skull decorations
            this.ctx.font = '30px Arial';
            this.ctx.fillText('🔥 💀 🔥', this.canvas.width / 2, this.canvas.height / 3 + 60);
            
            this.ctx.restore();
            
            // Draw start button with dungeon styling
            this.ctx.save();
            
            // Add glow effect
            this.ctx.shadowColor = '#ff4400';
            this.ctx.shadowBlur = 20;
            
            // Draw stone button background
            this.ctx.fillStyle = '#2C2F33';  // Dark slate color (matching pillars)
            this.ctx.fillRect(
                this.startButton.x,
                this.startButton.y,
                this.startButton.width,
                this.startButton.height
            );
            
            // Add stone texture
            this.ctx.fillStyle = '#23272A';  // Darker shade for depth
            for (let i = 0; i < this.startButton.width; i += 20) {
                this.ctx.fillRect(
                    this.startButton.x + i,
                    this.startButton.y,
                    2,
                    this.startButton.height
                );
            }
            
            // Add metallic border
            this.ctx.fillStyle = '#4A4D50';
            this.ctx.fillRect(
                this.startButton.x - 2,
                this.startButton.y - 2,
                this.startButton.width + 4,
                4
            );
            this.ctx.fillRect(
                this.startButton.x - 2,
                this.startButton.y + this.startButton.height - 2,
                this.startButton.width + 4,
                4
            );
            this.ctx.fillRect(
                this.startButton.x - 2,
                this.startButton.y,
                4,
                this.startButton.height
            );
            this.ctx.fillRect(
                this.startButton.x + this.startButton.width - 2,
                this.startButton.y,
                4,
                this.startButton.height
            );
            
            // Draw text with glow
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                'Start',  // Changed from 'Enter Dungeon' back to 'Start'
                this.canvas.width / 2,
                this.startButton.y + this.startButton.height/2
            );
            
            this.ctx.restore();
        }
        
        // Draw fire base (add this before the game over/start screen overlays)
        this.drawFireBase();
        
        // Draw all bosses and their projectiles
        this.bosses.forEach(boss => {
            // Draw boss
            this.ctx.font = `${boss.type.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(boss.type.emoji, boss.x, boss.y);
            
            // Draw projectiles
            boss.projectiles.forEach(projectile => {
                this.ctx.font = `${projectile.size}px Arial`;
                this.ctx.fillText(projectile.emoji, projectile.x, projectile.y);
            });
        });
        
        // Update level complete screen with scary styling
        if (this.levelComplete) {
            // Draw psychedelic flash effect
            if (this.flashEffect.active) {
                const flashColor = this.flashEffect.colors[
                    Math.floor(this.flashEffect.currentFrame / 4) % this.flashEffect.colors.length
                ];
                this.ctx.fillStyle = flashColor;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw scary text with effects
            this.ctx.save();
            
            // Add dripping blood effect
            const bloodDrops = '🩸'.repeat(15);
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#FF0000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(bloodDrops, this.canvas.width / 2, 30);
            
            // Main text with shadow and glow
            this.ctx.shadowColor = '#FF0000';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Glitch effect
            const glitchOffset = Math.random() * 5 - 2.5;
            
            // Red layer
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 52px Arial';
            this.ctx.fillText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2 + glitchOffset, this.canvas.height / 3 - 40);
            
            // Main layer
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.fillText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2, this.canvas.height / 3 - 40);
            
            // Complete text with skull decorations
            this.ctx.fillText('COMPLETE!', this.canvas.width / 2, this.canvas.height / 3 + 20);
            this.ctx.font = '30px Arial';
            this.ctx.fillText('💀 💀 💀', this.canvas.width / 2, this.canvas.height / 3 + 70);
            
            this.ctx.restore();
            
            // Draw larger continue button with spooky styling
            this.drawDungeonButton(
                this.continueButton.x,
                this.continueButton.y,
                this.continueButton.width,
                this.continueButton.height,
                'Continue... if you dare'
            );
        }
    }
    
    drawFireBase() {
        this.ctx.save();
        this.fireBase.flames.forEach((flame, index) => {
            const time = Date.now() / 1000;
            const y = this.canvas.height - 20 + Math.sin(time + flame.offset) * 5;
            
            // Draw glow effect for more intense fire
            const gradient = this.ctx.createRadialGradient(
                flame.x, y, 5,
                flame.x, y, 40
            );
            gradient.addColorStop(0, 'rgba(255, 50, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(flame.x, y, 40, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw larger flames
            this.ctx.font = `${flame.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔥', flame.x, y);
            
            // Add smaller flames between main flames for denser coverage
            if (index < this.fireBase.flames.length - 1) {
                const midX = (flame.x + this.fireBase.flames[index + 1].x) / 2;
                const midSize = Math.random() * 8 + 25;
                const midY = this.canvas.height - 15 + Math.sin(time + Math.PI) * 5;
                this.ctx.font = `${midSize}px Arial`;
                this.ctx.fillText('🔥', midX, midY);
            }
        });
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        if (!this.gameOver) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    // Add helper method for drawing dungeon-style buttons
    drawDungeonButton(x, y, width, height, text) {
        this.ctx.save();
        
        // Add glow effect
        this.ctx.shadowColor = '#ff4400';
        this.ctx.shadowBlur = 20;
        
        // Draw stone button background
        this.ctx.fillStyle = '#2C2F33';  // Dark slate color
        this.ctx.fillRect(x, y, width, height);
        
        // Add stone texture
        this.ctx.fillStyle = '#23272A';  // Darker shade for depth
        for (let i = 0; i < width; i += 20) {
            this.ctx.fillRect(x + i, y, 2, height);
        }
        
        // Add metallic border
        this.ctx.fillStyle = '#4A4D50';
        this.ctx.fillRect(x - 2, y - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y + height - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y, 4, height);
        this.ctx.fillRect(x + width - 2, y, 4, height);
        
        // Draw text with glow
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
        
        this.ctx.restore();
    }
} 