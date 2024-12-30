class FlappyBird {
    constructor() {
        // Define font style for consistent text rendering across the game
        this.gameFont = '"Chalkboard SE", cursive';
        
        // Add bird sprite image and animation properties
        this.birdSprite = new Image();
        this.birdSprite.onload = () => {
            console.log('Sprite loaded:', this.birdSprite.width, 'x', this.birdSprite.height);
            this.spriteLoaded = true;
            // Update frame dimensions based on actual sprite sheet
            this.spriteAnimation.frameWidth = this.birdSprite.width / this.spriteAnimation.framesPerRow;
            this.spriteAnimation.frameHeight = this.birdSprite.height / 2; // 2 rows
            console.log('Frame size:', this.spriteAnimation.frameWidth, 'x', this.spriteAnimation.frameHeight);
            if (!this.gameLoopStarted) {  // Only start if not already running
                this.init();
            }
        };
        this.birdSprite.onerror = (e) => {
            console.error('Error loading sprite:', e);
        };
        this.birdSprite.src = 'images/flatchy_flap_sprite.png';

        // Add background image
        this.backgroundImg = new Image();
        this.backgroundImg.onload = () => {
            this.backgroundLoaded = true;
        };
        this.backgroundImg.src = 'images/hills.png';
        this.backgroundLoaded = false;

        // Add ground image
        this.groundImg = new Image();
        this.groundImg.onload = () => {
            this.groundLoaded = true;
        };
        this.groundImg.src = 'images/ground.png';
        this.groundLoaded = false;
        this.groundOffset = 0;  // For scrolling effect

        // Add tree image
        this.treeImg = new Image();
        this.treeImg.onload = () => {
            this.treeLoaded = true;
        };
        this.treeImg.src = 'images/tree.png';
        this.treeLoaded = false;

        // Add feather images for trail effect
        this.feather1 = new Image();
        this.feather1.onload = () => {
            this.feather1Loaded = true;
        };
        this.feather1.src = 'images/feather_1.png';
        this.feather1Loaded = false;

        this.feather2 = new Image();
        this.feather2.onload = () => {
            this.feather2Loaded = true;
        };
        this.feather2.src = 'images/feather_2.png';
        this.feather2Loaded = false;

        this.feather3 = new Image();
        this.feather3.onload = () => {
            this.feather3Loaded = true;
        };
        this.feather3.src = 'images/feather_3.png';
        this.feather3Loaded = false;

        // Add fourth feather
        this.feather4 = new Image();
        this.feather4.onload = () => {
            this.feather4Loaded = true;
        };
        this.feather4.src = 'images/feather_4.png';
        this.feather4Loaded = false;

        this.spriteLoaded = false;
        this.spriteAnimation = {
            frameWidth: 8,      // Will be dynamically updated when sprite loads
            frameHeight: 8,     // Will be dynamically updated when sprite loads
            totalFrames: 11,    // Using 11 frames to create smooth animation cycle
            framesPerRow: 6,    // Sprite sheet organized as 2 rows with 6 frames each
            currentFrame: 0,
            frameTimer: 0,
            frameInterval: 100, // Milliseconds between frame updates
            lastFrameTime: 0
        };
        
        // Game configuration for progressive difficulty
        this.startingLevel = 1;
        this.speedIncreasePerLevel = 0.5;     // 50% speed increase per level
        this.pillarSpaceIncreasePerLevel = .05; // 5% increase in pillar spacing per level
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Bird physics and collision properties
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 48
        };
        
        // Base movement speed affects pipes and game elements
        this.baseSpeed = 1.8;
        // Calculate initial speed based on starting level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        // Pipe generation and gameplay parameters
        this.pipes = [];
        this.pipeWidth = 60;  // Width of tree obstacles
        this.pipeGap = 150;   // Vertical space between pipes for bird passage
        this.pipeInterval = 2000; // Time between pipe spawns in milliseconds
        this.lastPipe = 0;
        
        // Scoring system tracks both overall and per-level progress
        this.score = 0;        // Total score across all levels
        this.levelScore = 0;   // Score for current level only
        this.gameStarted = false;
        this.gameOver = false;
        
        // UI element positioning
        this.startButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 30,
            width: 200,
            height: 50
        };
        
        // Add restart button
        this.restartButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 30,
            width: 200,
            height: 50
        };
        
        // Fire effect configuration for visual ambiance
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
        
        // Boss types with increasing difficulty and unique projectiles
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
        
        // Add game over text image
        this.gameOverImg = new Image();
        this.gameOverImg.onload = () => {
            this.gameOverImgLoaded = true;
        };
        this.gameOverImg.src = 'images/game_over_text.png';
        this.gameOverImgLoaded = false;
        
        // Add start button image
        this.startBtnImg = new Image();
        this.startBtnImg.onload = () => {
            this.startBtnLoaded = true;
        };
        this.startBtnImg.src = 'images/start_btn_up.png';
        this.startBtnLoaded = false;
        
        // Add plain button image for restart
        this.plainBtnImg = new Image();
        this.plainBtnImg.onload = () => {
            this.plainBtnLoaded = true;
        };
        this.plainBtnImg.src = 'images/plain_btn.png';
        this.plainBtnLoaded = false;
        
        // Add title logo image
        this.titleLogoImg = new Image();
        this.titleLogoImg.onload = () => {
            this.titleLogoLoaded = true;
        };
        this.titleLogoImg.src = 'images/title_logo.png';
        this.titleLogoLoaded = false;
        
        this.gameLoopStarted = false;  // Add flag to track if game loop is running
        this.bindEvents();

        // Add cloud images
        this.clouds = [];
        for (let i = 1; i <= 4; i++) {
            const cloud = new Image();
            cloud.onload = () => {
                cloud.loaded = true;
            };
            cloud.src = `images/cloud_0${i}.png`;
            cloud.loaded = false;
            this.clouds.push(cloud);
        }
    }
    
    init() {
        // Don't initialize boss immediately
        this.bosses = [];
        this.bossHasAppeared = false;
        
        // Ensure speed is set correctly for starting level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        if (!this.gameLoopStarted) {  // Only start if not already running
            this.gameLoopStarted = true;
            this.gameLoop();
        }
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
            size: 48
        };
        this.pipes = [];
        this.lastPipe = 0;
        this.score = 0;        // Reset total score on full restart
        this.levelScore = 0;   // Reset level score
        this.gameStarted = false;
        this.gameOver = false;
        
        this.bosses = [];
        this.bossHasAppeared = false;
        
        this.levelComplete = false;
        
        // Reset to starting level
        this.currentLevel = this.startingLevel;
        
        // Set speed based on the starting level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.background.torches.forEach(torch => {
            torch.flameOffset = Math.random() * Math.PI;
        });
        
        this.gameLoopStarted = true;  // Set flag when restarting
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

        // Update ground scroll position
        if (this.groundLoaded) {
            this.groundOffset -= this.currentSpeed;
            // Reset ground position when it has scrolled one full width
            if (this.groundOffset <= -this.groundImg.width) {
                this.groundOffset = 0;
            }
        }

        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Check for ground collision - adjust to match visual ground
        if (this.bird.y + this.bird.size > this.canvas.height - 50) {  // Adjusted from -20 to -50 for ground height
            this.bird.y = this.canvas.height - 50 - this.bird.size;  // Keep bird on ground
            this.gameOver = true;
        }
        
        const now = Date.now();
        
        // Calculate how many unscored pipes are currently in play
        const unscoredPipes = this.pipes.filter(pipe => !pipe.scored).length;
        
        // Adjust pipe interval based on current speed and spacing increase
        const adjustedPipeInterval = 2000 / (1 + (this.currentLevel - 1) * this.pillarSpaceIncreasePerLevel);
        
        // Only generate new pipes if we need more to reach 10 points
        if (now - this.lastPipe > adjustedPipeInterval && (unscoredPipes + this.levelScore) < 10) {
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
                this.score++;      // Increment total score
                this.levelScore++; // Increment level score
                pipe.scored = true;

                // Spawn boss when reaching 5 points in current level
                if (this.levelScore === 5 && !this.bossHasAppeared) {
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
        
        // Check for level completion using levelScore
        if (this.levelScore >= 10) {
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
        this.levelScore = 0;   // Reset level score but keep total score
        
        // Update speed for new level - 50% increase per level
        this.currentSpeed = this.baseSpeed * (1 + (levelNumber - 1) * this.speedIncreasePerLevel);
        console.log(`Level ${levelNumber} speed: ${this.currentSpeed}`); // Debug log
        
        // Reset game state for new level
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 48
        };
        this.pipes = [];
        this.lastPipe = 0;
        this.gameStarted = true;
        this.gameOver = false;
        this.levelComplete = false;
        
        this.bosses = [];
        this.bossHasAppeared = false;
        
        this.flashEffect.active = false;
        this.flashEffect.currentFrame = 0;
        
        cancelAnimationFrame(this.animationFrame);
        this.gameLoopStarted = true;  // Set flag when starting new level
        this.gameLoop();
    }
    
    checkCollision(pipe) {
        // Hitbox adjustments for precise collision detection
        const hitboxPadding = 8;  // Padding to match visual tree trunk
        const verticalPadding = 5; // Vertical padding for more forgiving collisions
        
        // Adjust bird hitbox to match the visible sprite
        const birdBox = {
            left: this.bird.x + this.bird.size/3,     // Align with bird's body
            right: this.bird.x + this.bird.size/1.2,  // Cover main body width
            top: this.bird.y + this.bird.size/4,      // Account for head position
            bottom: this.bird.y + this.bird.size/1.3   // Match body height
        };
        
        const topPipeBox = {
            left: pipe.x + hitboxPadding,
            right: pipe.x + this.pipeWidth - hitboxPadding,
            top: verticalPadding,
            bottom: pipe.y - verticalPadding
        };
        
        const bottomPipeBox = {
            left: pipe.x + hitboxPadding,
            right: pipe.x + this.pipeWidth - hitboxPadding,
            top: pipe.y + this.pipeGap + verticalPadding,
            bottom: this.canvas.height - verticalPadding
        };

        // Debug visualization of hitboxes
        if (this.gameStarted) {
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.lineWidth = 2;
            
            // Draw bird hitbox
            this.ctx.strokeRect(birdBox.left, birdBox.top, 
                              birdBox.right - birdBox.left, 
                              birdBox.bottom - birdBox.top);
            
            // Draw pipe hitboxes
            this.ctx.strokeRect(topPipeBox.left, topPipeBox.top,
                              topPipeBox.right - topPipeBox.left,
                              topPipeBox.bottom - topPipeBox.top);
            
            this.ctx.strokeRect(bottomPipeBox.left, bottomPipeBox.top,
                              bottomPipeBox.right - bottomPipeBox.left,
                              bottomPipeBox.bottom - bottomPipeBox.top);
        }
        
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
        
        // Clear the canvas
        this.ctx.fillStyle = '#87CEEB';  // Sky blue fallback
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background image if loaded
        if (this.backgroundLoaded) {
            // Draw the background image to fill the canvas while maintaining aspect ratio
            const scale = Math.max(
                this.canvas.width / this.backgroundImg.width,
                this.canvas.height / this.backgroundImg.height
            );
            const width = this.backgroundImg.width * scale;
            const height = this.backgroundImg.height * scale;
            const x = (this.canvas.width - width) / 2;
            const y = (this.canvas.height - height) / 2;
            
            this.ctx.drawImage(this.backgroundImg, x, y, width, height);
        }

        // Draw trees before ground
        const groundHeight = 60;
        this.pipes.forEach(pipe => {
            if (this.treeLoaded) {
                // Draw bottom tree first (it goes behind ground)
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    pipe.x + 1, pipe.y + this.pipeGap,
                    this.pipeWidth, this.canvas.height - (pipe.y + this.pipeGap)
                );
                
                // Draw top tree (upside down)
                this.ctx.save();
                this.ctx.translate(pipe.x + this.pipeWidth/2, pipe.y);
                this.ctx.scale(1, -1); // Flip vertically
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    -this.pipeWidth/2 + 1, 0,
                    this.pipeWidth, pipe.y
                );
                this.ctx.restore();
            }
        });

        // Draw scrolling ground on top of trees
        if (this.groundLoaded) {
            const y = this.canvas.height - groundHeight;
            
            // Draw first ground image
            this.ctx.drawImage(
                this.groundImg,
                this.groundOffset, y,
                this.groundImg.width, groundHeight
            );
            
            // Draw second ground image for seamless scrolling
            this.ctx.drawImage(
                this.groundImg,
                this.groundOffset + this.groundImg.width, y,
                this.groundImg.width, groundHeight
            );
        }
        
        // Only draw the bird and trail if game has started
        if (this.gameStarted) {
            this.ctx.save();
            
            // Calculate rotation based on velocity (reduced rotation amount)
            let rotation = 0;
            if (this.bird.velocity < 0) {
                rotation = -0.2;  // Reduced from -0.3
            } else if (this.bird.velocity > 0) {
                rotation = 0.2;   // Reduced from 0.3
            }
            
            // Draw trail behind bird
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            
            // Draw three feathers in a trail with decreasing sizes and opacity
            // Largest feather nearest to bird
            if (this.feather1Loaded) {
                this.ctx.globalAlpha = 0.8;
                this.ctx.drawImage(
                    this.feather1,
                    -8 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/4, this.bird.size/4
                );
            }
            
            // Medium feather in middle
            if (this.feather2Loaded) {
                this.ctx.globalAlpha = 0.6;
                this.ctx.drawImage(
                    this.feather2,
                    -20 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/4.5, this.bird.size/4.5
                );
            }
            
            // Smaller feather
            if (this.feather3Loaded) {
                this.ctx.globalAlpha = 0.4;
                this.ctx.drawImage(
                    this.feather3,
                    -32 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/5, this.bird.size/5
                );
            }

            // Smallest feather farthest from bird
            if (this.feather4Loaded) {
                this.ctx.globalAlpha = 0.2;
                this.ctx.drawImage(
                    this.feather4,
                    -44 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/5.5, this.bird.size/5.5
                );
            }
            
            // Reset opacity
            this.ctx.globalAlpha = 1.0;
            
            this.ctx.restore();
            
            // Draw bird sprite
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            
            // Calculate sprite sheet position for current animation frame
            let column, row;
            if (this.gameOver) {
                column = 5;  // Last column for death animation
                row = 1;    // Bottom row contains death frame
            } else {
                column = this.spriteAnimation.currentFrame % this.spriteAnimation.framesPerRow;
                row = Math.floor(this.spriteAnimation.currentFrame / this.spriteAnimation.framesPerRow);
            }
            
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
        
        if (this.gameStarted && !this.gameOver) {
            // Draw level counter in top right
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `bold 24px ${this.gameFont}`;
            this.ctx.textAlign = 'right';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);
            this.ctx.fillText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);

            // Draw score in top left
            this.ctx.textAlign = 'left';
            this.ctx.strokeText(`Score: ${this.score}`, 20, 40);
            this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw game over image
            if (this.gameOverImgLoaded) {
                const imgWidth = 300;  // Base width
                const aspectRatio = this.gameOverImg.height / this.gameOverImg.width;
                const imgHeight = imgWidth * aspectRatio;  // Calculate height based on aspect ratio
                
                this.ctx.drawImage(
                    this.gameOverImg,
                    (this.canvas.width - imgWidth) / 2,
                    this.canvas.height / 3 - 30,  // Adjusted position
                    imgWidth,
                    imgHeight
                );
            }
            
            // Score text with matching style
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.font = `bold 36px ${this.gameFont}`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 3 + 60);
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 3 + 60);
            
            // Draw restart button using plain button image
            if (this.plainBtnLoaded) {
                const btnWidth = 200;  // Match current button width
                const aspectRatio = this.plainBtnImg.height / this.plainBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                // Update button hitbox to match image
                this.restartButton.width = btnWidth;
                this.restartButton.height = btnHeight;
                this.restartButton.x = (this.canvas.width - btnWidth) / 2;
                this.restartButton.y = this.canvas.height / 2 + 30;  // Changed from +20 to +30
                
                // Draw the button image
                this.ctx.drawImage(
                    this.plainBtnImg,
                    this.restartButton.x,
                    this.restartButton.y,
                    btnWidth,
                    btnHeight
                );

                // Add centered text on the button
                this.ctx.fillStyle = '#000000';  // Black text
                this.ctx.font = `bold 24px ${this.gameFont}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    'Try again',
                    this.restartButton.x + (btnWidth/2),
                    this.restartButton.y + (btnHeight/2) + 2  // Move down by adding 2 pixels instead of subtracting
                );
            }
        }
        
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw title logo
            if (this.titleLogoLoaded) {
                const logoWidth = 400;  // Base width for the logo
                const aspectRatio = this.titleLogoImg.height / this.titleLogoImg.width;
                const logoHeight = logoWidth * aspectRatio;
                
                this.ctx.drawImage(
                    this.titleLogoImg,
                    (this.canvas.width - logoWidth) / 2,
                    this.canvas.height / 3 - 60,  // Position it slightly higher than the old text
                    logoWidth,
                    logoHeight
                );
            }
            
            // Draw start button image
            if (this.startBtnLoaded) {
                const btnWidth = 200;  // Match current button width
                const aspectRatio = this.startBtnImg.height / this.startBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                // Update button hitbox to match image
                this.startButton.width = btnWidth;
                this.startButton.height = btnHeight;
                this.startButton.x = (this.canvas.width - btnWidth) / 2;
                this.startButton.y = this.canvas.height / 2 + 30;  // Changed from +20 to +30
                
                this.ctx.drawImage(
                    this.startBtnImg,
                    this.startButton.x,
                    this.startButton.y,
                    btnWidth,
                    btnHeight
                );
            }
        }
        
        // Draw all bosses and their projectiles
        this.bosses.forEach(boss => {
            // Draw boss
            this.ctx.font = `${boss.type.size}px ${this.gameFont}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(boss.type.emoji, boss.x, boss.y);
            
            // Draw projectiles
            boss.projectiles.forEach(projectile => {
                this.ctx.font = `${projectile.size}px ${this.gameFont}`;
                this.ctx.fillText(projectile.emoji, projectile.x, projectile.y);
            });
        });
        
        // Update level complete screen with new styling
        if (this.levelComplete) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw clouds first
            this.clouds.forEach((cloud, index) => {
                if (cloud.loaded) {
                    // Calculate cloud dimensions
                    const cloudWidth = 150;  // Reduced from 200 to 150
                    const aspectRatio = cloud.height / cloud.width || 1;
                    const cloudHeight = cloudWidth * aspectRatio;
                    
                    // Position clouds across the top of the screen
                    const x = (index * (this.canvas.width / 3)) - 50;
                    const y = 20 + (index % 2) * 40;  // Alternate heights
                    
                    this.ctx.drawImage(
                        cloud,
                        x,
                        y,
                        cloudWidth,
                        cloudHeight
                    );
                }
            });
            
            // Level text
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.font = `bold 52px ${this.gameFont}`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2, this.canvas.height / 3 - 40);
            this.ctx.fillText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2, this.canvas.height / 3 - 40);
            
            // Complete text
            this.ctx.font = `bold 48px ${this.gameFont}`;
            this.ctx.strokeText('COMPLETE!', this.canvas.width / 2, this.canvas.height / 3 + 20);
            this.ctx.fillText('COMPLETE!', this.canvas.width / 2, this.canvas.height / 3 + 20);
            
            // Draw continue button with plain button image
            if (this.plainBtnLoaded) {
                const btnWidth = 200;
                const aspectRatio = this.plainBtnImg.height / this.plainBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                // Update button hitbox
                this.continueButton.width = btnWidth;
                this.continueButton.height = btnHeight;
                this.continueButton.x = (this.canvas.width - btnWidth) / 2;
                this.continueButton.y = this.canvas.height / 2 + 30;
                
                // Draw the button
                this.ctx.drawImage(
                    this.plainBtnImg,
                    this.continueButton.x,
                    this.continueButton.y,
                    btnWidth,
                    btnHeight
                );

                // Add centered text on the button
                this.ctx.fillStyle = '#000000';
                this.ctx.font = `bold 24px ${this.gameFont}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    'Continue',
                    this.continueButton.x + (btnWidth/2),
                    this.continueButton.y + (btnHeight/2) + 2
                );
            }
        }
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
        this.ctx.font = `bold 24px ${this.gameFont}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
        
        this.ctx.restore();
    }
} 