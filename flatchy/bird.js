class FlappyBird {
    constructor() {
        this.gameFont = '"Chalkboard SE", cursive';
        
        // Load and setup bird sprite animation
        this.birdSprite = new Image();
        this.birdSprite.onload = () => {
            console.log('Sprite loaded:', this.birdSprite.width, 'x', this.birdSprite.height);
            this.spriteLoaded = true;
            this.spriteAnimation.frameWidth = this.birdSprite.width / this.spriteAnimation.framesPerRow;
            this.spriteAnimation.frameHeight = this.birdSprite.height / 2;
            console.log('Frame size:', this.spriteAnimation.frameWidth, 'x', this.spriteAnimation.frameHeight);
            if (!this.gameLoopStarted) {
                this.init();
            }
        };
        this.birdSprite.onerror = (e) => {
            console.error('Error loading sprite:', e);
        };
        this.birdSprite.src = 'images/flatchy_flap_sprite.png';

        // Load background assets
        this.backgroundImg = new Image();
        this.backgroundImg.onload = () => {
            this.backgroundLoaded = true;
        };
        this.backgroundImg.src = 'images/hills.png';
        this.backgroundLoaded = false;

        this.groundImg = new Image();
        this.groundImg.onload = () => {
            this.groundLoaded = true;
        };
        this.groundImg.src = 'images/ground.png';
        this.groundLoaded = false;
        this.groundOffset = 0;

        this.treeImg = new Image();
        this.treeImg.onload = () => {
            this.treeLoaded = true;
        };
        this.treeImg.src = 'images/tree.png';
        this.treeLoaded = false;

        // Load feather trail effects
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

        this.feather4 = new Image();
        this.feather4.onload = () => {
            this.feather4Loaded = true;
        };
        this.feather4.src = 'images/feather_4.png';
        this.feather4Loaded = false;

        this.spriteLoaded = false;
        this.spriteAnimation = {
            frameWidth: 8,
            frameHeight: 8,
            totalFrames: 11,
            framesPerRow: 6,
            currentFrame: 0,
            frameTimer: 0,
            frameInterval: 100,
            lastFrameTime: 0
        };
        
        // Setup difficulty scaling
        this.startingLevel = 1;
        this.speedIncreasePerLevel = 0.5;
        this.pillarSpaceIncreasePerLevel = .05;
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Setup bird physics
        this.bird = {
            x: 50,
            y: 200,
            velocity: 0,
            gravity: 0.2,
            jump: -4.5,
            size: 48
        };
        
        // Setup game speed and obstacles
        this.baseSpeed = 1.8;
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeInterval = 2000;
        this.lastPipe = 0;
        
        // Setup scoring and game state
        this.score = 0;
        this.levelScore = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Setup UI elements
        this.startButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 30,
            width: 200,
            height: 50
        };
        
        this.restartButton = {
            x: this.canvas.width / 2 - 100,
            y: this.canvas.height / 2 + 30,
            width: 200,
            height: 50
        };
        
        // Setup ambient effects
        this.fireBase = {
            flames: Array(20).fill().map((_, i) => ({
                x: i * (this.canvas.width / 19),
                size: Math.random() * 10 + 30,
                offset: Math.random() * Math.PI
            }))
        };
        
        this.bosses = [];
        
        // Setup level completion UI
        this.levelComplete = false;
        this.continueButton = {
            x: this.canvas.width / 2 - 150,
            y: this.canvas.height / 2 + 100,
            width: 300,
            height: 60
        };
        
        // Setup victory effects
        this.flashEffect = {
            active: false,
            duration: 60,
            currentFrame: 0,
            colors: ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00']
        };
        
        this.currentLevel = this.startingLevel;
        
        // Setup background effects
        this.background = {
            torches: Array(4).fill().map((_, i) => ({
                x: i * (this.canvas.width / 3),
                y: 60 + (i % 2) * 30,
                flameOffset: Math.random() * Math.PI
            }))
        };
        
        // Setup boss types and behaviors
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
        
        this.bossHasAppeared = false;
        
        // Setup boss attack timing
        this.bossShootTimer = {
            lastShot: 0,
            minInterval: 3000
        };
        
        // Load game assets
        this.gameOverImg = new Image();
        this.gameOverImg.onload = () => {
            this.gameOverImgLoaded = true;
        };
        this.gameOverImg.src = 'images/game_over_text.png';
        this.gameOverImgLoaded = false;
        
        this.startBtnImg = new Image();
        this.startBtnImg.onload = () => {
            this.startBtnLoaded = true;
        };
        this.startBtnImg.src = 'images/start_btn_up.png';
        this.startBtnLoaded = false;
        
        this.plainBtnImg = new Image();
        this.plainBtnImg.onload = () => {
            this.plainBtnLoaded = true;
        };
        this.plainBtnImg.src = 'images/plain_btn.png';
        this.plainBtnLoaded = false;
        
        this.titleLogoImg = new Image();
        this.titleLogoImg.onload = () => {
            this.titleLogoLoaded = true;
        };
        this.titleLogoImg.src = 'images/title_logo.png';
        this.titleLogoLoaded = false;
        
        this.gameLoopStarted = false;
        this.bindEvents();

        // Load cloud variations for background
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
        this.bosses = [];
        this.bossHasAppeared = false;
        
        // Set initial game speed based on level
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        if (!this.gameLoopStarted) {
            this.gameLoopStarted = true;
            this.gameLoop();
        }
    }
    
    bindEvents() {
        const handleInput = () => {
            if (!this.spriteLoaded) return;
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
        // Reset bird position and physics
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
        this.score = 0;
        this.levelScore = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        this.bosses = [];
        this.bossHasAppeared = false;
        
        this.levelComplete = false;
        
        this.currentLevel = this.startingLevel;
        this.currentSpeed = this.baseSpeed * (1 + (this.startingLevel - 1) * this.speedIncreasePerLevel);
        
        this.background.torches.forEach(torch => {
            torch.flameOffset = Math.random() * Math.PI;
        });
        
        this.gameLoopStarted = true;
        this.gameLoop();
    }
    
    update() {
        if (!this.gameStarted || this.gameOver || this.levelComplete) return;
        
        // Update animation frames
        const currentTime = Date.now();
        if (currentTime - this.spriteAnimation.lastFrameTime > this.spriteAnimation.frameInterval) {
            this.spriteAnimation.currentFrame = (this.spriteAnimation.currentFrame + 1) % this.spriteAnimation.totalFrames;
            this.spriteAnimation.lastFrameTime = currentTime;
        }

        // Scroll ground texture
        if (this.groundLoaded) {
            this.groundOffset -= this.currentSpeed;
            if (this.groundOffset <= -this.groundImg.width) {
                this.groundOffset = 0;
            }
        }

        // Apply gravity and update bird position
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Check ground collision
        if (this.bird.y + this.bird.size > this.canvas.height - 50) {
            this.bird.y = this.canvas.height - 50 - this.bird.size;
            this.gameOver = true;
        }
        
        const now = Date.now();
        const unscoredPipes = this.pipes.filter(pipe => !pipe.scored).length;
        const adjustedPipeInterval = 2000 / (1 + (this.currentLevel - 1) * this.pillarSpaceIncreasePerLevel);
        
        // Generate new pipes until level completion
        if (now - this.lastPipe > adjustedPipeInterval && (unscoredPipes + this.levelScore) < 10) {
            const pipeY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                y: pipeY,
                scored: false
            });
            this.lastPipe = now;
        }
        
        // Update pipes and check collisions
        this.pipes.forEach(pipe => {
            pipe.x -= this.currentSpeed;
            
            if (this.checkCollision(pipe)) {
                this.gameOver = true;
            }
            
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                this.score++;
                this.levelScore++;
                pipe.scored = true;

                // Spawn boss at halfway point
                if (this.levelScore === 5 && !this.bossHasAppeared) {
                    const bossTypes = [this.bossTypes.GHOST, this.bossTypes.DEMON, this.bossTypes.SKULL];
                    const bossIndex = (this.currentLevel - 1) % bossTypes.length;
                    const bossType = bossTypes[bossIndex];
                    
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
        
        // Update flame animations
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
        
        // Update boss behavior
        this.bosses.forEach(boss => {
            // Animate boss entrance
            if (boss.entranceProgress < 1) {
                boss.entranceProgress += 0.02;
                const easing = 1 - Math.pow(1 - boss.entranceProgress, 3);
                boss.x = boss.x + (boss.targetX - boss.x) * easing;
                boss.y = boss.y + (boss.targetY - boss.y) * easing;
                return;
            }

            const bossSpeed = this.currentSpeed * (1 + (this.currentLevel - 1) * 0.03);
            
            // Keep boss on screen
            if (boss.x < this.canvas.width / 2) {
                boss.x = this.canvas.width / 2;
            }
            
            boss.x -= bossSpeed * 0.2;
            if (boss.x < this.canvas.width / 2) boss.x = this.canvas.width - 50;
            
            const timeScale = 1 + (this.currentLevel - 1) * 0.05;
            
            // Restrict boss movement range
            const maxVerticalDistance = this.canvas.height * 0.3;
            const centerY = this.canvas.height / 2;
            const verticalOffset = Math.sin(Date.now() / 1000 * timeScale) * (30 + this.currentLevel * 2);
            boss.y = centerY + Math.max(-maxVerticalDistance, Math.min(maxVerticalDistance, verticalOffset));
            
            // Check boss collision
            const distance = Math.hypot(
                boss.x - (this.bird.x + this.bird.size/2),
                boss.y - (this.bird.y + this.bird.size/2)
            );
            if (distance < (this.bird.size/2 + boss.type.size/2)) {
                this.gameOver = true;
            }
            
            const timeSinceLastShot = now - this.bossShootTimer.lastShot;
            const shouldForceShot = timeSinceLastShot > this.bossShootTimer.minInterval;
            
            // Fire projectiles
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
            
            // Update and check projectile collisions
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
            
            // Clean up off-screen projectiles
            boss.projectiles = boss.projectiles.filter(projectile => 
                projectile.x > -projectile.size && 
                projectile.x < this.canvas.width + projectile.size &&
                projectile.y > -projectile.size && 
                projectile.y < this.canvas.height + projectile.size
            );
        });
        
        // Handle level completion
        if (this.levelScore >= 10) {
            if (!this.levelComplete) {
                this.levelComplete = true;
                this.flashEffect.active = true;
                cancelAnimationFrame(this.animationFrame);
            }
            
            if (this.flashEffect.active) {
                this.flashEffect.currentFrame++;
                if (this.flashEffect.currentFrame >= this.flashEffect.duration) {
                    this.flashEffect.active = false;
                }
            }
        }
    }
    
    startLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.levelScore = 0;
        
        // Scale difficulty with level
        this.currentSpeed = this.baseSpeed * (1 + (levelNumber - 1) * this.speedIncreasePerLevel);
        
        // Reset game state
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
        this.gameLoopStarted = true;
        this.gameLoop();
    }
    
    checkCollision(pipe) {
        // Fine-tune hitbox for better collision feel
        const hitboxPadding = 8;
        const verticalPadding = 5;
        
        const birdBox = {
            left: this.bird.x + this.bird.size/3,
            right: this.bird.x + this.bird.size/1.2,
            top: this.bird.y + this.bird.size/4,
            bottom: this.bird.y + this.bird.size/1.3
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

        // Draw hitboxes in debug mode
        if (this.gameStarted) {
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.lineWidth = 2;
            
            this.ctx.strokeRect(birdBox.left, birdBox.top, 
                              birdBox.right - birdBox.left, 
                              birdBox.bottom - birdBox.top);
            
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
        if (!this.spriteLoaded) return;
        
        // Paint sky background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background with proper scaling
        if (this.backgroundLoaded) {
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

        // Draw trees before ground layer
        const groundHeight = 60;
        this.pipes.forEach(pipe => {
            if (this.treeLoaded) {
                // Draw bottom tree
                this.ctx.drawImage(
                    this.treeImg,
                    0, 0,
                    this.treeImg.width, this.treeImg.height,
                    pipe.x + 1, pipe.y + this.pipeGap,
                    this.pipeWidth, this.canvas.height - (pipe.y + this.pipeGap)
                );
                
                // Draw top tree (flipped)
                this.ctx.save();
                this.ctx.translate(pipe.x + this.pipeWidth/2, pipe.y);
                this.ctx.scale(1, -1);
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

        // Draw scrolling ground
        if (this.groundLoaded) {
            const y = this.canvas.height - groundHeight;
            
            this.ctx.drawImage(
                this.groundImg,
                this.groundOffset, y,
                this.groundImg.width, groundHeight
            );
            
            this.ctx.drawImage(
                this.groundImg,
                this.groundOffset + this.groundImg.width, y,
                this.groundImg.width, groundHeight
            );
        }
        
        if (this.gameStarted) {
            this.ctx.save();
            
            // Tilt bird based on velocity
            let rotation = 0;
            if (this.bird.velocity < 0) {
                rotation = -0.2;
            } else if (this.bird.velocity > 0) {
                rotation = 0.2;
            }
            
            // Draw feather trail
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            
            if (this.feather1Loaded) {
                this.ctx.globalAlpha = 0.8;
                this.ctx.drawImage(
                    this.feather1,
                    -8 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/4, this.bird.size/4
                );
            }
            
            if (this.feather2Loaded) {
                this.ctx.globalAlpha = 0.6;
                this.ctx.drawImage(
                    this.feather2,
                    -20 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/4.5, this.bird.size/4.5
                );
            }
            
            if (this.feather3Loaded) {
                this.ctx.globalAlpha = 0.4;
                this.ctx.drawImage(
                    this.feather3,
                    -32 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/5, this.bird.size/5
                );
            }

            if (this.feather4Loaded) {
                this.ctx.globalAlpha = 0.2;
                this.ctx.drawImage(
                    this.feather4,
                    -44 - this.bird.size/3, -this.bird.size/3,
                    this.bird.size/5.5, this.bird.size/5.5
                );
            }
            
            this.ctx.globalAlpha = 1.0;
            this.ctx.restore();
            
            // Draw bird sprite
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.size/2, this.bird.y + this.bird.size/2);
            this.ctx.rotate(rotation);
            
            // Select sprite frame
            let column, row;
            if (this.gameOver) {
                column = 5;
                row = 1;
            } else {
                column = this.spriteAnimation.currentFrame % this.spriteAnimation.framesPerRow;
                row = Math.floor(this.spriteAnimation.currentFrame / this.spriteAnimation.framesPerRow);
            }
            
            this.ctx.drawImage(
                this.birdSprite,
                column * this.spriteAnimation.frameWidth,
                row * this.spriteAnimation.frameHeight,
                this.spriteAnimation.frameWidth,
                this.spriteAnimation.frameHeight,
                -this.bird.size/2,
                -this.bird.size/2,
                this.bird.size,
                this.bird.size
            );
            
            this.ctx.restore();
            this.ctx.restore();
        }
        
        if (this.gameStarted && !this.gameOver) {
            // Draw HUD
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `bold 24px ${this.gameFont}`;
            this.ctx.textAlign = 'right';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);
            this.ctx.fillText(`Level ${this.currentLevel}`, this.canvas.width - 20, 40);

            this.ctx.textAlign = 'left';
            this.ctx.strokeText(`Score: ${this.score}`, 20, 40);
            this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        }
        
        if (this.gameOver) {
            // Draw game over overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (this.gameOverImgLoaded) {
                const imgWidth = 300;
                const aspectRatio = this.gameOverImg.height / this.gameOverImg.width;
                const imgHeight = imgWidth * aspectRatio;
                
                this.ctx.drawImage(
                    this.gameOverImg,
                    (this.canvas.width - imgWidth) / 2,
                    this.canvas.height / 3 - 30,
                    imgWidth,
                    imgHeight
                );
            }
            
            // Draw final score
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.font = `bold 36px ${this.gameFont}`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 3 + 60);
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 3 + 60);
            
            // Draw restart button
            if (this.plainBtnLoaded) {
                const btnWidth = 200;
                const aspectRatio = this.plainBtnImg.height / this.plainBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                this.restartButton.width = btnWidth;
                this.restartButton.height = btnHeight;
                this.restartButton.x = (this.canvas.width - btnWidth) / 2;
                this.restartButton.y = this.canvas.height / 2 + 30;
                
                this.ctx.drawImage(
                    this.plainBtnImg,
                    this.restartButton.x,
                    this.restartButton.y,
                    btnWidth,
                    btnHeight
                );

                this.ctx.fillStyle = '#000000';
                this.ctx.font = `bold 24px ${this.gameFont}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    'Try again',
                    this.restartButton.x + (btnWidth/2),
                    this.restartButton.y + (btnHeight/2) + 2
                );
            }
        }
        
        if (!this.gameStarted) {
            // Draw title screen
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (this.titleLogoLoaded) {
                const logoWidth = 400;
                const aspectRatio = this.titleLogoImg.height / this.titleLogoImg.width;
                const logoHeight = logoWidth * aspectRatio;
                
                this.ctx.drawImage(
                    this.titleLogoImg,
                    (this.canvas.width - logoWidth) / 2,
                    this.canvas.height / 3 - 60,
                    logoWidth,
                    logoHeight
                );
            }
            
            if (this.startBtnLoaded) {
                const btnWidth = 200;
                const aspectRatio = this.startBtnImg.height / this.startBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                this.startButton.width = btnWidth;
                this.startButton.height = btnHeight;
                this.startButton.x = (this.canvas.width - btnWidth) / 2;
                this.startButton.y = this.canvas.height / 2 + 30;
                
                this.ctx.drawImage(
                    this.startBtnImg,
                    this.startButton.x,
                    this.startButton.y,
                    btnWidth,
                    btnHeight
                );
            }
        }
        
        // Draw bosses and projectiles
        this.bosses.forEach(boss => {
            this.ctx.font = `${boss.type.size}px ${this.gameFont}`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(boss.type.emoji, boss.x, boss.y);
            
            boss.projectiles.forEach(projectile => {
                this.ctx.font = `${projectile.size}px ${this.gameFont}`;
                this.ctx.fillText(projectile.emoji, projectile.x, projectile.y);
            });
        });
        
        // Draw level complete screen
        if (this.levelComplete) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Add floating clouds
            this.clouds.forEach((cloud, index) => {
                if (cloud.loaded) {
                    const cloudWidth = 150;
                    const aspectRatio = cloud.height / cloud.width || 1;
                    const cloudHeight = cloudWidth * aspectRatio;
                    
                    const x = (index * (this.canvas.width / 3)) - 50;
                    const y = 20 + (index % 2) * 40;
                    
                    this.ctx.drawImage(
                        cloud,
                        x,
                        y,
                        cloudWidth,
                        cloudHeight
                    );
                }
            });
            
            // Show level completion message
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.font = `bold 52px ${this.gameFont}`;
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2, this.canvas.height / 3 - 40);
            this.ctx.fillText(`LEVEL ${this.currentLevel}`, this.canvas.width / 2, this.canvas.height / 3 - 40);
            
            this.ctx.font = `bold 48px ${this.gameFont}`;
            this.ctx.strokeText('COMPLETE!', this.canvas.width / 2, this.canvas.height / 3 + 20);
            this.ctx.fillText('COMPLETE!', this.canvas.width / 2, this.canvas.height / 3 + 20);
            
            // Add continue button
            if (this.plainBtnLoaded) {
                const btnWidth = 200;
                const aspectRatio = this.plainBtnImg.height / this.plainBtnImg.width;
                const btnHeight = btnWidth * aspectRatio;
                
                this.continueButton.width = btnWidth;
                this.continueButton.height = btnHeight;
                this.continueButton.x = (this.canvas.width - btnWidth) / 2;
                this.continueButton.y = this.canvas.height / 2 + 30;
                
                this.ctx.drawImage(
                    this.plainBtnImg,
                    this.continueButton.x,
                    this.continueButton.y,
                    btnWidth,
                    btnHeight
                );

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
    
    // Main game loop
    gameLoop() {
        this.update();
        this.draw();
        if (!this.gameOver) {
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    // Create a themed button with stone texture and glow effects
    drawDungeonButton(x, y, width, height, text) {
        this.ctx.save();
        
        // Add orange glow
        this.ctx.shadowColor = '#ff4400';
        this.ctx.shadowBlur = 20;
        
        // Create stone texture
        this.ctx.fillStyle = '#2C2F33';
        this.ctx.fillRect(x, y, width, height);
        
        // Add vertical lines for depth
        this.ctx.fillStyle = '#23272A';
        for (let i = 0; i < width; i += 20) {
            this.ctx.fillRect(x + i, y, 2, height);
        }
        
        // Add raised border
        this.ctx.fillStyle = '#4A4D50';
        this.ctx.fillRect(x - 2, y - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y + height - 2, width + 4, 4);
        this.ctx.fillRect(x - 2, y, 4, height);
        this.ctx.fillRect(x + width - 2, y, 4, height);
        
        // Add glowing text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold 24px ${this.gameFont}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width/2, y + height/2);
        
        this.ctx.restore();
    }
} 